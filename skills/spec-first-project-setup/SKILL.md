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

Every "Create" step skips the file if it already exists; preserved files are listed in the final message. No overwrites — the user's existing work is sacred. The one exception is Step 13 (`design-code-sync.md`), which reconciles mechanically-derived fields on re-run; see that step for the diff-and-prompt protocol.

Substitution map applied to every template:
- `[Project Name]` → project name from Step 1
- `[project-name]` → kebab-case of project name
- `[Feature]` → feature name from Step 1
- `[FEATURE]` → upper-kebab feature name
- `[DESIGN_TOOL]` / `[FILE_PATH]` → from Step 1 (used in `design-code-sync.md`)
- `[LAYOUT_STRATEGY]` → from Step 1 question 4 (project default — written into `DESIGN-LANGUAGE.md`)
- `[ROUTE_LAYOUT_STRATEGY]` → per feature, from Step 9 (`inherit` by default; `responsive` / `desktop-only` / `mobile-only` if the user overrides — written into each `[FEATURE]-IDEAS.md`)
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
4. **Target layout strategy (project default)** — `responsive`, `desktop-only`, or `mobile-only`? Asked as: *"What viewports does this codebase target by default? Responsive (both desktop and mobile), desktop-only, or mobile-only?"* *Used as `[LAYOUT_STRATEGY]` substitution in `DESIGN-LANGUAGE.md` so visual-qa and code-agent know which viewports to capture by default. Individual features can override this in their IDEAS doc.*
5. **Features/pages** — list of routes or major features. *Determines which `[FEATURE]-IDEAS.md` files to create in Step 9. For each feature, also ask if it overrides the project default — most should answer `inherit`.*
6. **Existing docs** — does the project already have any of these? *Skip-if-exists rule prevents overwrites; capture the list for the final message.*

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

Copy `assets/templates/design-language.md` to `docs/DESIGN-LANGUAGE.md`. Substitute `[LAYOUT_STRATEGY]` with the answer to Step 1 question 4 so the "Target layout strategy" line is populated, not left as a placeholder.

### 5. Create `docs/DESIGN-TOKENS.md`

Copy `assets/templates/design-tokens.md` to `docs/DESIGN-TOKENS.md`.

### 6. Create `docs/COMPONENT-SPECS.md`

Copy `assets/templates/component-specs.md` to `docs/COMPONENT-SPECS.md`.

### 7. Check for `docs/DESIGN-HEURISTICS.md` (folded into Step 14)

**Do not create this file.** Taste settings (variance, motion, contrast, color economy, grid density, personality) emerge from a design conversation, not a setup script. That conversation belongs in `/design-explore`. If `docs/DESIGN-HEURISTICS.md` is missing for a design project, append the nudge in Step 14's final message.

### 8. Create `docs/DESIGN-TAXONOMY.md`

Copy `assets/templates/design-taxonomy.md` to `docs/DESIGN-TAXONOMY.md`. The template is Pencil-flavored (frame naming convention assumes `.pen` files); adjust references if the design tool is Figma or Sketch.

### 9. Create feature idea docs

For each feature/page the user listed in Step 1, copy `assets/templates/feature-ideas.md` to `docs/[FEATURE]-IDEAS.md`. Substitute `[Feature]` with the feature name and `[ROUTE_LAYOUT_STRATEGY]` with the per-feature override (default to `inherit` unless the user said this feature targets something different from the project default).

Default behavior: ask the user once at the start of Step 9 *"Do any of these features need a layout strategy that's different from the project default ([LAYOUT_STRATEGY])? If so, which?"* — then write `inherit` for all features except the named overrides. Don't ask per-feature in a loop; one batched question is enough since most features inherit.

The template includes:
- The route chrome section (now including "Target layout strategy") so the AI always has full route context (header, footer, layout, viewport scope) — not just the main content area.
- The decisions table with a `Type` column (`direction` / `variant`) which `/design-agent` and `/code-agent` watch to pick the right routing on open decisions.
- An **"API response shape"** section header (filled in by Step 2 if mocks were provided).
- A **"Parser implementation"** section header (placeholder — `/code-agent` populates it as patterns are discovered while implementing the feature).

### 10. Create `docs/REPO-CONVENTIONS.md`

This doc captures architectural patterns, routing philosophy, state management conventions, and institutional knowledge that applies across all features. It is **not** a feature spec — it's the knowledge someone needs to work correctly in the codebase.

**Discovery step:** Before copying the template, investigate the existing codebase to seed the sections. Check for:

- **Routing**: central link/navigation wrapper? How does the app decide between client-side navigation and full page loads? (Look for `Link` imports, route config, navigation utilities.)
- **Data flow**: How does API data reach components? Parser/transformer layer? State management library? (Look for parser.js files, Redux/Zustand setup, thunks/sagas.)
- **Code splitting**: How are pages loaded? Lazy loading, SSR, or client-only? (Look for `loadable`, `lazy`, dynamic imports.) **Note any SSR/hydration setup** (e.g. `loadableReady`, `ChunkExtractor`) — these are common sources of framework gotchas worth pre-documenting.
- **Analytics**: How do tracking events flow? API-driven or hardcoded? Shared tracking utility? (Look for ga_data patterns, tracking.js, analytics libraries.)
- **Asset handling**: How are images, icons, static files resolved? (Look for asset utilities, CDN config, public directories.)
- **Styling**: CSS architecture? Modules, tokens, variables, preprocessors? (Look for shared SCSS/CSS files, theme config.) **Check whether tokens are auto-injected by sass-loader / style-loader** (common in catalyst-core / CRA-style setups) — if yes, document so engineers don't waste time `@import`ing them.
- **Environment / setup**: are there per-engineer files (e.g. local config, `.env`) that aren't in git? Document the bootstrap procedure.
- **Framework gotchas**: known issues with the framework that bite during development — leave a section heading even if empty so `/code-agent` knows where to write findings.
- **Port-relevant section scaffolding (always — empty is fine)**: leave these section headings in `REPO-CONVENTIONS.md` even when the project has zero port-features today, so the first port-feature to land has a home to write into instead of inventing one:
  - **Naming & file layout** — directory casing, version-suffix policy (e.g. drop source-repo `V2` when the target has no V1), file-name patterns inside containers/pages, slice-key conventions.
  - **Primitive substitutions** — when a feature ported from a source repo uses a wrapper/HOC/utility that doesn't exist in this repo, the target equivalent. One row per substitution (`source primitive → target primitive`, with rationale).
  - **Backend-contract gotchas** — header / cookie / auth differences between source and target environments (the kind of thing that makes a verbatim port 4xx silently).
  - **Source-baggage drop list** — things the source repo carries that should never propagate forward (mweb's `/experiments/` path segments, AB-test wrappers, version suffixes from a long-gone V1).
  These sections stay empty for greenfield projects and fill incrementally — populated either directly by the user or via `/spec-research` when the first port-feature triggers the conformance check (see spec-research's "Migration interrogation" step).

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
1. The design file path is `design/[project-name].pen` (kebab-case project name from Step 1). Record this absolute path in CLAUDE.md (Step 12).
2. **Pencil MCP cannot create `.pen` files** — its toolset has no create/open command, and a `batch_design` write to a non-existent path silently lands in whatever file is currently open (the `filePath` parameter is advisory; the active editor wins). So the file must be created in the **Pencil app**: ask the user to create a new document, save it at the exact `design/[project-name].pen` path, and keep it open. The downstream design skills verify the file exists and is the active editor before their first write (the write-barrier gate in design-agent's `references/pencil-hygiene.md` Rule 6).

> ⚠️ **Never use `/new` as a `filePath`,** and never use `batch_design` to "create" a file. `/new` is an ephemeral unsaved document — work done there is lost when the editor switches context. The named `.pen` must already exist and be open before any write.

**If the design tool is not Pencil (or none):** create `design/` with a `.gitkeep`.

### 12. Create `CLAUDE.md`

Copy the template that matches Step 1's project type:

- **Design project** → `assets/templates/claude-md-design.md` → `CLAUDE.md`
- **Code-only project** → `assets/templates/claude-md-code-only.md` → `CLAUDE.md`
- **Enterprise project** → `assets/templates/claude-md-enterprise.md` → `CLAUDE.md`

For design projects, the template includes a `## Pencil design file` section — fill in the absolute path from Step 11.

### 13. Create or reconcile `.claude/rules/design-code-sync.md` (design projects only)

For design projects, this rule file is loaded into context by Claude Code's native `.claude/rules/` mechanism when Claude reads a file matching its `paths:` frontmatter. The rule body then guides subsequent edits — Gate 1 for design-tool files, Gate 2 for component code. Unlike most artifacts in the pod it cannot be append-only, because the `paths:` frontmatter and `[DESIGN_TOOL]` / `[FILE_PATH]` substitutions are mechanically derived from `CLAUDE.md` and must stay in sync as the project grows.

**If `.claude/rules/design-code-sync.md` does not exist:**

Copy `assets/templates/design-code-sync.md` to `.claude/rules/design-code-sync.md`. Substitute `[DESIGN_TOOL]` and `[FILE_PATH]` with the project's design tool name and absolute design file path. The template's `paths:` frontmatter starts with `[FILE_PATH]` (so the rule loads when Claude reads the design file) and contains commented-out examples for component directories — propose concrete component paths based on `docs/REPO-CONVENTIONS.md` and the features listed in Step 1, and let the user confirm before writing them into the frontmatter. A rule with no `paths:` field loads on every session unconditionally, which is heavy; narrow scope is better.

**If the file already exists (re-run case):**

Do *not* overwrite — the user may have hand-tuned the paths or edited gate text. Instead, reconcile the mechanically-derived fields:

1. **Design tool / path drift.** Read the current `[DESIGN_TOOL]` and `[FILE_PATH]` values from the rule file's body (Gate 2, C3). Compare against the values in `CLAUDE.md` (Step 12 wrote them there). If they differ, surface the diff to the user and propose substituting the new values. Apply only on confirmation.
2. **Path coverage drift.** Read the `paths:` array in the rule file's frontmatter. Compare against the component directories referenced in `CLAUDE.md` and `docs/REPO-CONVENTIONS.md` (e.g. new feature dirs added since the rule was first generated). If any referenced component dir is not covered by an existing entry, surface the gap and propose additions. Apply only on confirmation. Also flag if the file is missing `paths:` entirely — that means it loads unconditionally, which is usually not what the user wants.
3. **Doc-path drift.** Check that paths the rule references in its prose (`docs/DESIGN-TAXONOMY.md`, `docs/DESIGN-TOKENS.md`, the tokens SCSS file) still exist. If any moved or were renamed, surface the broken reference — do not auto-fix; let the user decide whether to update the rule or restore the path.
4. **Legacy frontmatter migration.** If the file uses Cursor-style `globs:` instead of Claude Code's `paths:`, surface this — Claude Code ignores `globs:` and will load the rule unconditionally. Propose renaming `globs:` → `paths:` (the array contents transfer as-is).

Do **not** touch the gate text (D1–D5, C1–C6) or any other prose in the rule body during reconciliation. That content is considered hand-tuned once the file exists; the user owns it.

If no drift is detected, note "design-code-sync rule is in sync" in the final message alongside the preserved-files list.

### 14. Final message

Tell the user: "Doc structure + CLAUDE.md + repo conventions ready. Fill in BRIEF-AND-DIRECTION first, then REPO-CONVENTIONS.md — everything else flows from those two.

Once filled in, the companion skills are ready to use:
- `/design-explore` to discover or pressure-test design direction (creates `docs/DESIGN-HEURISTICS.md`)
- `/design-agent` to generate production design variants
- `/code-agent` to implement features
- `/visual-qa` to verify rendered code against the spec"

If `docs/DESIGN-HEURISTICS.md` was missing during Step 7's check, append: *"⚠️ `docs/DESIGN-HEURISTICS.md` doesn't exist yet. Run `/design-explore` to discover your design direction — it will create that file with taste settings derived from the conversation. Until then, run `/design-agent` with the `--use-defaults` trailing flag to proceed with safe defaults."*

Also list any files that were preserved (skipped because they already existed) so the user knows which steps were skipped.
