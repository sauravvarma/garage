---
name: spec-first-project-setup
description: >-
  Bootstrap the doc structure, design scaffolds, and CLAUDE.md a project
  needs before /design-explore, /design-agent, /code-agent, or /visual-qa
  can run — those companion skills hard-block on the artifacts created here.
  Use whenever the user starts a new project, says "set up specs / scaffold
  docs / create project structure", asks for a docs skeleton, or when a
  companion skill reports missing artifacts. Required for any project that
  doesn't already have docs/, CLAUDE.md, and the design taxonomy in place.
---

# Spec-first project setup

Bootstrap the doc structure, design directory, and Claude Code configuration that the global engineering rules depend on. Creates the skeleton — the user fills in the values.

## Companion skills

This skill scaffolds the artifacts that four sibling skills depend on. The intended workflow once setup is done:

| Skill | Stage | Reads |
|---|---|---|
| `/design-explore` | Discover or challenge design direction | All design docs (treats them as living, can challenge) |
| `/design-agent` | Generate production design variants | All design docs (treats them as locked spec) |
| `/code-agent` | Implement features | `CLAUDE.md`, `REPO-CONVENTIONS.md`, `COMPONENT-SPECS.md` (`[FEATURE]-IDEAS.md` recommended per feature) |
| `/visual-qa` | Verify rendered code against spec | `DESIGN-TOKENS.md`, `DESIGN-LANGUAGE.md`, `DESIGN-TAXONOMY.md` |

Each companion skill runs a "spec preflight" check on first invocation and tells the user to run `/spec-first-project-setup` if its required artifacts are missing.

## When to use

- Starting a new project from scratch.
- Adding spec structure to an existing project that has none.
- User asks to "set up docs", "scaffold specs", or "create project structure".

## What it creates

```
docs/
├── BRIEF-AND-DIRECTION.md
├── DESIGN-LANGUAGE.md
├── DESIGN-TOKENS.md
├── COMPONENT-SPECS.md
├── DESIGN-TAXONOMY.md
├── REPO-CONVENTIONS.md       # Routing, parsing, state management, analytics patterns
├── [FEATURE]-IDEAS.md        # One per feature/page
└── mocks/                    # API response fixtures (optional)
    └── [endpoint-name].json
design/
└── .gitkeep
CLAUDE.md                      # Project-level Claude Code configuration
.claude/
└── rules/                     # Project-specific rules (if applicable)
    └── design-code-sync.md    # Only for projects with design artifacts
```

## Templates

All file templates live in `assets/templates/`. Each "Create" step below copies a template into place, substituting placeholders (project name, feature name, design tool, file paths). Templates use `[BRACKETS]` for substitutions and `<!-- HTML comments -->` for guidance the user fills in later.

## Conventions for all create steps

Every "Create" step skips the file if it already exists; preserved files are listed in the final message. No overwrites — the user's existing work is sacred.

Substitution map applied to every template:
- `[Project Name]` → project name from Step 1
- `[project-name]` → kebab-case of project name
- `[Feature]` → feature name from Step 1
- `[FEATURE]` → upper-kebab feature name
- `[DESIGN_TOOL]` / `[FILE_PATH]` → from Step 1 (used in `design-code-sync.md`)
- `[command]` → real command if discoverable from package.json/Makefile, else placeholder

## Folder discipline

Skills must not create top-level directories beyond:
- `docs/` — markdown specs
- `design/` — design tool files (`.pen` files live here)
- `.claude/rules/` — project rules
- Root: `CLAUDE.md` only

## Step-by-step

### 1. Ask the user

Before creating anything, gather:

1. **Project name and purpose** — one sentence. *Used as `[Project Name]` substitution and seeds `BRIEF-AND-DIRECTION.md`.*
2. **Project type** — determines which CLAUDE.md template runs in Step 12 and whether Step 13 fires:
   - **Design project** (has Figma, Pencil, Sketch, or similar) → `claude-md-design.md` + Step 13 design-sync rules
   - **Code-only project** (no design artifact) → `claude-md-code-only.md`, skip Step 13
   - **Enterprise project** (Jira / Confluence / Bitbucket workflow) → `claude-md-enterprise.md`
3. **Design tool** — Figma, Pencil, Sketch, none yet? *Determines whether Step 11 creates a `.pen` file or a `.gitkeep`, and what gets substituted into `design-code-sync.md`.*
4. **Features/pages** — list of routes or major features. *Determines which `[FEATURE]-IDEAS.md` files to create in Step 9.*
5. **Existing docs** — does the project already have any of these? *Skip-if-exists rule prevents overwrites; capture the list for the final message.*

### 2. Collect API data (optional)

Ask the user:

> **Do you have sample API responses for the primary data sources?** Share curls, JSON payloads, or HAR exports — they'll be PII-scrubbed, saved as mocks, and the response shapes will be auto-documented in the feature IDEAS docs.

This step is optional — skip if the project has no APIs yet or the user doesn't have samples ready. But when available, API data is the highest-leverage input for the entire setup:

- **Mock data** makes design comps use real copy, real structure, and real widget inventories instead of lorem ipsum.
- **Response shapes** documented in IDEAS docs become the binding contract between API and frontend — component specs, Redux state shape, and widget type registries all derive from them.
- **Dev fixtures** are available from day one for Redux store seeding, unit tests, and Storybook stories.

**When the user provides a curl:**

1. Execute it and capture the JSON response.
2. **Scrub PII** before saving — replace names, patient/user IDs, auth tokens, email addresses, and coordinates with placeholder values (e.g. `"Test User"`, zeroed UUIDs, `0.0` coords).
3. Save to `docs/mocks/[endpoint-name].json` using a descriptive kebab-case name derived from the API path (e.g. `/api/v2/health-insights/patient/:id/insights` → `insights-v2.json`).
4. Analyze the response structure and append an **"API response shape"** section to the relevant `[FEATURE]-IDEAS.md` doc covering: envelope structure, widget/component type inventory, key nested object shapes (field names + types, not values), status/category enums with associated colors/labels, CTA action patterns, and implementation notes (reusable patterns, API-driven vs token-driven values).
5. If the user provides multiple curls, repeat for each — one mock file per endpoint, one response-shape section per feature doc.

**When the user provides raw JSON:** same as above, skip the curl execution.

**When the user provides a HAR export:** extract the relevant API responses from the HAR file, then process each as above.

### 3. Create `docs/BRIEF-AND-DIRECTION.md`

Copy `assets/templates/brief-and-direction.md` to `docs/BRIEF-AND-DIRECTION.md`.

### 4. Create `docs/DESIGN-LANGUAGE.md`

Copy `assets/templates/design-language.md` to `docs/DESIGN-LANGUAGE.md`.

### 5. Create `docs/DESIGN-TOKENS.md`

Copy `assets/templates/design-tokens.md` to `docs/DESIGN-TOKENS.md`.

### 6. Create `docs/COMPONENT-SPECS.md`

Copy `assets/templates/component-specs.md` to `docs/COMPONENT-SPECS.md`.

### 7. Check for `docs/DESIGN-HEURISTICS.md` (folded into Step 14)

**Do not create this file.** Taste settings (variance, motion, contrast, color economy, grid density, personality) emerge from a design conversation, not a setup script. That conversation belongs in `/design-explore`. If `docs/DESIGN-HEURISTICS.md` is missing for a design project, append the nudge in Step 14's final message.

### 8. Create `docs/DESIGN-TAXONOMY.md`

Copy `assets/templates/design-taxonomy.md` to `docs/DESIGN-TAXONOMY.md`. The template is Pencil-flavored (frame naming convention assumes `.pen` files); adjust references if the design tool is Figma or Sketch.

### 9. Create feature idea docs

For each feature/page the user listed in Step 1, copy `assets/templates/feature-ideas.md` to `docs/[FEATURE]-IDEAS.md`. Substitute `[Feature]` with the feature name. The template includes the route chrome section so the AI always has full route context (header, footer, layout) — not just the main content area. The decisions table includes a `Type` column (`direction` / `variant`) which `/design-agent` and `/code-agent` watch for to pick the right routing on open decisions.

### 10. Create `docs/REPO-CONVENTIONS.md`

This doc captures architectural patterns, routing philosophy, state management conventions, and institutional knowledge that applies across all features. It is **not** a feature spec — it's the knowledge someone needs to work correctly in the codebase.

**Discovery step:** Before copying the template, investigate the existing codebase to seed the sections. Check for:

- **Routing**: central link/navigation wrapper? How does the app decide between client-side navigation and full page loads? (Look for `Link` imports, route config, navigation utilities.)
- **Data flow**: How does API data reach components? Parser/transformer layer? State management library? (Look for parser.js files, Redux/Zustand setup, thunks/sagas.)
- **Code splitting**: How are pages loaded? Lazy loading, SSR, or client-only? (Look for `loadable`, `lazy`, dynamic imports.)
- **Analytics**: How do tracking events flow? API-driven or hardcoded? Shared tracking utility? (Look for ga_data patterns, tracking.js, analytics libraries.)
- **Asset handling**: How are images, icons, static files resolved? (Look for asset utilities, CDN config, public directories.)
- **Styling**: CSS architecture? Modules, tokens, variables, preprocessors? (Look for shared SCSS/CSS files, theme config.)

If the codebase is new/empty, copy the template as-is. If it's an existing codebase, copy the template and seed the sections from your investigation, leaving placeholders for what you couldn't discover.

Copy `assets/templates/repo-conventions.md` to `docs/REPO-CONVENTIONS.md`.

**Key principles for this doc** (apply when filling in or reviewing later):
1. **Philosophy over mechanics** — explain *why* the convention exists, not just *what* it is.
2. **Convention, not tutorial** — assume the reader is an experienced developer who just needs to know *this repo's* way of doing things.
3. **Repo-wide only** — feature-specific patterns go in the feature's IDEAS doc.
4. **Living document** — gets updated as conventions are discovered or changed.

### 11. Create `design/` directory and design file

Create `design/` directory for design tool files.

**If the design tool is Pencil:**
1. Create the `.pen` file via Pencil MCP: `open_document("design/[project-name].pen")`. Use the kebab-case project name from Step 1.
2. The absolute path to this file is stored in CLAUDE.md (Step 12).

> ⚠️ **Never use `/new` as a `filePath`.** `/new` is an ephemeral unsaved document — work done there is lost when the editor switches context. Always create a named `.pen` file so work persists across sessions.

**If the design tool is not Pencil (or none):** create `design/` with a `.gitkeep`.

### 12. Create `CLAUDE.md`

Copy the template that matches Step 1's project type:

- **Design project** → `assets/templates/claude-md-design.md` → `CLAUDE.md`
- **Code-only project** → `assets/templates/claude-md-code-only.md` → `CLAUDE.md`
- **Enterprise project** → `assets/templates/claude-md-enterprise.md` → `CLAUDE.md`

For design projects, the template includes a `## Pencil design file` section — fill in the absolute path from Step 11.

### 13. Create `.claude/rules/` (design projects only)

For design projects, copy `assets/templates/design-code-sync.md` to `.claude/rules/design-code-sync.md`. Substitute `[DESIGN_TOOL]` and `[FILE_PATH]` with the project's design tool name and absolute design file path. The template defines two gates: Gate 1 (design artifact gate, fires when modifying `.pen` files) and Gate 2 (code change gate, fires when modifying component code).

### 14. Final message

Tell the user: "Doc structure + CLAUDE.md + repo conventions ready. Fill in BRIEF-AND-DIRECTION first, then REPO-CONVENTIONS.md — everything else flows from those two.

Once filled in, the companion skills are ready to use:
- `/design-explore` to discover or pressure-test design direction (creates `docs/DESIGN-HEURISTICS.md`)
- `/design-agent` to generate production design variants
- `/code-agent` to implement features
- `/visual-qa` to verify rendered code against the spec"

If `docs/DESIGN-HEURISTICS.md` was missing during Step 7's check, append: *"⚠️ `docs/DESIGN-HEURISTICS.md` doesn't exist yet. Run `/design-explore` to discover your design direction — it will create that file with taste settings derived from the conversation. Until then, run `/design-agent` with the `--use-defaults` trailing flag to proceed with safe defaults."*

Also list any files that were preserved (skipped because they already existed) so the user knows which steps were skipped.
