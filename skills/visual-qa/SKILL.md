---
name: visual-qa
description: >-
  Automated visual QA for any frontend project. Captures screenshots at
  spec-defined breakpoints via Playwright, reads them multimodally, and checks
  against the project's own spec (tokens, layout rules, design language) —
  not hardcoded assumptions. Learns project profile from docs/, CLAUDE.md,
  and design tokens; persists checklist to .claude/visual-qa-checklist.md.
  Use after layout or component changes, before reporting a layout task as
  done, or when the user says "visual QA / check breakpoints / screenshot
  check / does this look right / before-after diff". Not for accessibility
  audits or performance checks — those are separate tools.
---

# Visual QA

Automated visual verification loop for frontend projects. Takes screenshots of the running app at defined breakpoints, reads them (multimodal), and checks against **the project's own spec** — not hardcoded assumptions.

## When to use

- After making layout or component changes
- User asks "does this look right", "check breakpoints", "visual QA"
- Before reporting a layout task as complete
- When you can't verify a visual QA checklist item from code alone

## Spec preflight

Before capturing anything, verify what's available. Visual-qa is graceful — it can run with minimal context and still do useful work — but tell the user what's missing so they understand which checks will and won't fire.

**Required:**
- A way to run the app — discovered from `CLAUDE.md` "Commands" section or `package.json` scripts (Phase 0a). If neither yields a dev/start command, ask the user.
- Playwright — auto-installed in Phase 1 if missing.

**Recommended (enables project-specific checks):**
- `docs/DESIGN-TOKENS.md` — without it, no token/color/typography checks
- `docs/DESIGN-LANGUAGE.md` — without it, no semantic role checks (rest vs interaction, etc.)

**Optional (enables design ↔ code comparison):**
- `docs/DESIGN-TAXONOMY.md` with rows marked `Final` and `Synced` — without it, only spec-vs-code comparison runs; design-vs-code is skipped

If recommended docs are missing, tell the user: "Project-specific design checks won't run — only universal checks (no horizontal overflow, fonts loaded, touch target sizes, etc.). Run `/spec-first-project-setup` to scaffold the docs and fill them in, or proceed with universal-only checks."

---

## Phase 0: Learn the Project

Before capturing anything, build a **project profile** by reading project configuration. This is what makes the skill work across any frontend project.

### 0a. Discover dev server

Read these sources in order (stop at first match):
1. `CLAUDE.md` — look for a "Commands" section with `dev` / `start` / `run` commands. Treated as authoritative.
2. `README.md` — look for a "Getting started" / "Development" / "Run locally" section that names the command. Confirm the extracted command with the user before treating it as authoritative (prose-derived; easier to mis-parse than CLAUDE.md).
3. Ask the user directly.

Extract: **base URL** (e.g. `http://localhost:3000`) and **start command** (e.g. `npm run start`, `pnpm dev`, `bun dev`, `python manage.py runserver`, `go run main.go`). The skill is stack-agnostic — it doesn't infer the command from lockfiles, but it'll use whatever the project's docs say.

### 0b. Discover breakpoints

Read these sources in order:
1. `docs/` — search for breakpoint tables, media query definitions, or responsive specs in any doc file (look for keywords: "breakpoint", "viewport", "responsive", "mobile", "desktop", "media query")
2. CSS/SCSS variables — search for media query definitions in the project's stylesheet entry points or variables files
3. `CLAUDE.md` — check for breakpoint references

If breakpoints are found in the spec, use those exactly — they define **discrete modes**, not a gradient. If none are found, use these defaults and confirm with the user:

| Name | Width × Height | Represents |
|------|---------------|------------|
| Mobile | 375 × 812 | Small phone |
| Tablet | 768 × 1024 | iPad portrait |
| Desktop | 1440 × 900 | Standard laptop |
| Wide | 1920 × 1080 | Full HD monitor |

### 0c. Discover design language

Read these sources to understand what "correct" looks like for this project. **For every bullet: if the named doc is missing, skip that source of checks and proceed. Do not block.** The graceful-degradation contract from the spec preflight extends through this phase — universal checks always run; project-specific checks only fire for the docs that exist.

1. **Color strategy** — read `docs/DESIGN-TOKENS.md` or equivalent. Extract: what colors are used at rest vs on interaction? Are there semantic roles (e.g. surface vs accent)? What palette violations would look wrong? *(If missing, skip color-strategy checks.)*
2. **Typography** — read design tokens or language docs. Extract: expected font families for headings and body. What does a "font not loaded" fallback look like? *(If missing, skip typography checks.)*
3. **Layout rules** — read component specs or feature docs. Extract: grid column counts per breakpoint, scroll direction per breakpoint, specific measurements or ratios. *(If missing, skip layout-rule checks.)*
4. **Route chrome** — read CLAUDE.md or page specs. Extract: which header/footer variant each route uses. *(If missing, skip route-chrome checks.)*

When emitting the project-specific checklist in Phase 0e, omit sections whose source docs were missing rather than emitting empty bullets — write `### Color\n_(skipped: docs/DESIGN-TOKENS.md not found)_` so the persisted checklist is honest about what was and wasn't derived.

### 0d. Discover design artifacts

Check if the project has visual design references:
- `design/` directory — Pencil, Figma exports, screenshots
- Artifact index in `docs/DESIGN-TAXONOMY.md` or equivalent — which frames are "Final" and "Synced"

If design artifacts exist for the route being tested, they become the comparison reference.

### 0e. Build and emit the project-specific checklist

From what you discovered, construct a checklist tailored to this project and **write it to `.claude/visual-qa-checklist.md`** in the project root. This file is the persisted profile — it survives across sessions so Phase 0 doesn't need to re-derive from docs every time.

**Format:**

```markdown
# Visual QA Checklist
<!-- Auto-generated by /visual-qa from project docs. Edit to override. -->
<!-- Last derived: [date] -->
<!-- Sources: [list of docs/files read] -->

## Project profile

- **Dev server:** [start command] → [base URL]
- **Breakpoints:**
  | Name | Width × Height | Source |
  |------|---------------|--------|
  | [name] | [w] × [h] | [which doc or file defined this] |

## Universal checks

- [ ] No horizontal overflow at any breakpoint
- [ ] Route chrome (header/footer) present and correct variant
- [ ] Fonts loaded (not system fallback)
- [ ] No broken images or empty content areas
- [ ] Touch targets ≥44px on mobile breakpoints
- [ ] No elements touching viewport edges without intentional bleed

## Project-specific checks

### Color
- [ ] [what the spec says about rest vs interaction colors, semantic roles]

### Typography
- [ ] [expected font families, what fallback would look like]

### Layout
- [ ] [grid columns per breakpoint, scroll direction, specific measurements]

### Spacing
- [ ] [token-based spacing expectations, proportions]

### [Any other categories the spec defines]
- [ ] [checks derived from docs]
```

**On first run:** Generate the file from scratch. Show the user what was learned and ask for confirmation before proceeding to capture.

**On subsequent runs:** If `.claude/visual-qa-checklist.md` already exists in the project root (NOT user-global at `~/.claude/`), read it instead of re-running Phase 0. Only re-derive if:
- The user says "refresh checklist", "re-learn", or "update QA profile"
- The file's `Last derived` date is older than 30 days
- The user explicitly edited the file (treat manual edits as overrides — don't overwrite them on refresh, merge instead)

**The user can edit this file directly.** Manual additions or corrections are respected. On refresh, the skill re-derives from docs and presents a diff against the existing checklist so the user can accept, reject, or merge changes.

---

## Phase 1: Setup

1. **Check if dev server is running** at the discovered base URL (single HEAD/GET request, short timeout — 2-3s; we just need to know if the server's up, not block the skill on a slow first response).
   - **Running →** proceed.
   - **Not running →** *do not silently spawn a long-running process.* Surface to the user: *"Dev server doesn't appear to be running at `[base URL]`. Want me to start it with `[discovered command]`, or will you start it manually? (also: 'cancel')"* — then act on their answer. If the user opts to start it, run the command in the background and **bound the readiness poll at 60 seconds**. If the URL still doesn't respond after 60s, surface the underlying error (last `curl`/`wget` output or the start command's stderr) and ask the user what's wrong rather than retrying silently.
2. **Check for Playwright.** Run `npx playwright --version`. If not available, do not auto-install — Playwright is a one-time project/system setup, not visual-qa's responsibility. Tell the user: *"Playwright isn't installed. Install once with your project's package manager (e.g. `npm install -D playwright`, `pnpm add -D playwright`, `bun add -d playwright`), then run `npx playwright install chromium`. I'll wait — re-invoke me when it's ready."*

3. **Pick engines.** Default: Chromium. Add WebKit (`BROWSERS=chromium,webkit`) by default for any project that ships to mobile/Safari users — same WebKit engine that powers iOS Safari and the simulator's WKWebView, and it surfaces CSS gotchas Chromium tolerates (`backdrop-filter`, `position: fixed` under transformed ancestors, `@property`-animated CSS custom props). If WebKit binary isn't installed, tell the user: *"WebKit binary missing. Run `npx playwright install webkit` once, then re-invoke me."* Don't auto-install. Skip WebKit only if the project is desktop-Chromium-only (e.g. an Electron app).

4. **Determine route(s) to check.** Use the route that was just modified. If unclear, ask the user.

5. **Native shell pass (project-specific).** If the project ships through a native WebView shell (catalyst-core, Capacitor, Cordova, Ionic, or any project whose `docs/REPO-CONVENTIONS.md` describes a simulator workflow), follow that doc's tier-3 instructions for a final pass — typically a `xcrun simctl io booted screenshot ...` capture after the app has been reloaded. The skill does not enumerate framework specifics; the project's conventions own the commands. If the project has no native shell, stop after the engine passes above.

---

## Phase 2: Capture

Run `node scripts/capture.js` from the project root with these env vars:

- `BASE_URL` — base URL Playwright hits (e.g. `http://localhost:3000`)
- `ROUTE` — path to capture (default: `/`)
- `OUTPUT_DIR` — screenshot output directory (default: `/tmp/visual-qa`; `/tmp/` is auto-cleaned by the OS — override if you want screenshots to persist)
- `BREAKPOINTS` — JSON array of `{name, width, height}` from Phase 0
- `WAIT_TIMEOUT` — ms to wait after networkidle (default: 1500). Raise for SPAs with long-running websockets where networkidle never fires; lower for static sites where 1500ms is wasteful.
- `FULL_PAGE` — `"true"` for full-page screenshots
- `BROWSERS` — comma-separated engines: any of `chromium`, `webkit`, `firefox` (default: `chromium`). When more than one is set, screenshot files are prefixed with the engine name (`chromium-mobile.png`, `webkit-mobile.png`).

Read each screenshot via the `Read` tool (Claude Code is multimodal).

---

## Phase 3: Analyze

For each screenshot, run the **project-specific checklist** built in Phase 0. Check every item — both universal and project-specific.

**How to analyze:**
- Look at the screenshot as a user would. Don't just confirm your expectations — actively look for things that seem off.
- Compare against the spec: if the spec says "4 columns on desktop" and you see 3, that's a failure.
- Compare against the design artifact: if a "Final + Synced" Pencil frame exists for this route, compare layout, spacing, and structure.
- Note anything ambiguous as a warning rather than a pass or fail.

---

## Phase 4: Report

```
## Visual QA Report: [route] — [date]

### Project profile
- Breakpoints: [list with source]
- Color strategy: [summary]
- Key layout rules: [summary]

### [Breakpoint name] ([width]×[height])
✅ [Check that passed]
⚠️ [Check that's ambiguous] — [what to verify manually]
❌ [Check that failed] — [what's wrong, what the spec says, suggested fix]
Screenshot: /tmp/visual-qa/[name].png

[Repeat for each breakpoint]

### Summary
- X passes, Y warnings, Z failures
- [Recommended action before marking task complete]
```

---

## Phase 5: Iterate

If the user asks to fix the issues:

1. Make the code change
2. Re-capture screenshots at the **affected breakpoint(s) only** (not all). Affected = breakpoints where checks failed in the previous report, or breakpoints the user explicitly named.
3. Re-analyze against the same checklist
4. Report again
5. Repeat until all checks pass or flag remaining issues for manual review

The iteration loop should be tight — don't re-discover the project profile on each pass. Only re-capture and re-analyze.

---

## Phase 6: Cleanup

After the user has either confirmed they're done or explicitly asked to keep screenshots:
- Default → delete `/tmp/visual-qa/` contents
- Keep → move to a project directory (e.g. `.claude-design/qa-screenshots/`)

The model has no automatic signal for "user reviewed" — wait for an explicit confirmation or move-on cue before deleting.

---

## Before/After Mode

When invoked with "before/after" or "diff" intent:

1. **Before:** Take screenshots at all breakpoints BEFORE making changes. Save to `/tmp/visual-qa/before/`.
2. **Make the change.**
3. **After:** Take screenshots at all breakpoints. Save to `/tmp/visual-qa/after/`.
4. **Diff:** Read both sets. For each breakpoint, compare before and after:
   - What changed (intended)
   - What changed (unintended — potential regression)
   - What stayed the same (expected)

This catches regressions that aren't spec violations but are unintended side effects.

---

