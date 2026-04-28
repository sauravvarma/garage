---
name: design-agent
description: >-
  Generates production design variants in Pencil WITHIN A LOCKED DESIGN
  DIRECTION (post-direction-lock work — for direction discovery use
  /design-explore). Critiques variants against the project spec + embedded
  aesthetic frameworks, presents structured trade-off reports, supports
  critique-only mode (evaluate existing frames without regenerating) and a
  "push it further" option for boundary-testing variants. Explicit invocation
  only — never triggered automatically. Use when the user says /design-agent
  followed by a design intent, asks to critique an existing Pencil frame
  against the spec, or wants production variants within a locked direction.
  Pass `--use-defaults` to proceed when DESIGN-HEURISTICS.md is missing.
---

# Design Agent

An isolated design subagent that generates and critiques production design variants. Produces Pencil frames and structured critique reports. **Explicit invocation only** — never auto-triggered.

**This skill is Mode B.** When not invoked, Claude Code operates in Mode A (the confirmed human-orchestrated chain: spec-first → implement → visual QA → sync gate → commit). Mode B wraps Mode A by adding a design phase before implementation.

## When to use

- User explicitly says `/design-agent "design the contact page"` or similar
- User says `/design-agent "critique the home page frame"` — critique-only mode
- User says `/design-agent "design X — include a wild one"` — with pushed variant
- Never auto-trigger on design-related conversation
- Never suggest invoking this skill — wait for the user to invoke it

## When NOT to use

- User asks to implement something (Mode A)
- User asks to fix a bug or adjust styling (Mode A)
- User asks to run visual QA (use /visual-qa instead)
- User wants to explore or discover a design direction (use /design-explore instead)
- User wants to challenge or revisit locked design decisions (use /design-explore Mode 5)
- Any task that doesn't start with explicit `/design-agent` invocation

## Spec preflight

Before designing anything, verify the artifacts this skill depends on. Stop and present a checklist if anything required is missing — do not silently proceed with assumptions or invent values.

**Required:**
- `CLAUDE.md` — project context, must contain a `## Pencil design file` section with the absolute path to the `.pen` file
- `docs/BRIEF-AND-DIRECTION.md` — tone, audience, goals
- `docs/DESIGN-LANGUAGE.md` — typography, color, layout philosophy
- `docs/DESIGN-TOKENS.md` — token values
- `docs/DESIGN-TAXONOMY.md` — artifact index, frame naming convention
- `docs/DESIGN-HEURISTICS.md` — taste settings (created by `/design-explore`)
- `docs/[FEATURE]-IDEAS.md` — direction chosen + design variations for the feature being designed (created by `/design-explore`)

**Routing for missing artifacts:**

- Missing `CLAUDE.md` / `BRIEF-AND-DIRECTION` / `DESIGN-LANGUAGE` / `DESIGN-TOKENS` / `DESIGN-TAXONOMY` → "Project structure isn't set up. Run `/spec-first-project-setup` first, then come back."
- Missing `DESIGN-HEURISTICS.md` → "Taste settings aren't established. Run `/design-explore` first — it will discover your project's design direction and create this file. Or pass `--use-defaults` to proceed with the safe/balanced fallbacks in `references/taste-tuning.md`."
- Missing `[FEATURE]-IDEAS.md` (or no "Direction chosen" entry in it) → "No feature decisions exist for [feature]. Run `/design-explore '[feature intent]'` first to discover the direction, then come back to generate variants."

The `--use-defaults` opt-in only covers DESIGN-HEURISTICS. Missing structural docs always block.

**Flag syntax:** accept `--use-defaults` anywhere in the prompt; strip before routing. Document the trailing form (`/design-agent "<intent>" --use-defaults`) to users.

## Self-contained dependencies

This skill uses NO external MCP servers beyond Pencil MCP (the project's design tool), NO globally installed skills, and NO tools beyond what's already in the session (Pencil MCP, Read, Write, Bash, Glob, Grep). All design knowledge is embedded in the `references/` directory:

- `references/critique-framework.md` — structured 10-dimension evaluation rubric
- `references/layout-patterns.md` — page and section layout patterns
- `references/anti-patterns.md` — common design mistakes and AI slop detection
- `references/taste-tuning.md` — configurable aesthetic parameters

Read ALL four reference files at the start of every invocation — the critique pipeline in Phase 2 needs its full vocabulary loaded; lazy-loading per phase causes the model to invent dimensions that aren't in the framework.

---

## Pencil file resolution (HARD RULE)

Resolve the design file path before ANY Pencil MCP call:

1. Read `CLAUDE.md` for a `## Pencil design file` section. Found → use that absolute path for every call.
2. Missing → create `design/[project-name].pen` and register it in CLAUDE.md under `## Pencil design file`.
3. NEVER use `/new` (ephemeral unsaved document; work lost when the editor switches context).
4. Same resolved path for every call. No switching mid-session.

Folder layout is owned by `/spec-first-project-setup`; `.pen` files always go in `design/`.

---

## Source of truth

The project docs are the source of truth for what to design. Pencil frames are output companions, not input references.

1. **Widget inventory** comes from the feature doc and mweb source reference — not from reading existing Pencil frames.
2. **Layout decisions** come from the locked decision table — not from what a previous variant happened to do.
3. **Visual identity** (colors, gradients, tokens) comes from DESIGN-LANGUAGE.md and DESIGN-TOKENS.md — not from sampling hex values in existing frames.
4. **Existing Pencil frames** may be glanced at to understand what was already tried. But they are NEVER the source for what to include, how to arrange it, or what the visual treatment should be.
5. **On iteration:** re-read the docs to rebuild your mental model. The feedback is about the layout concept, not about copying a previous frame and rearranging it.

The loop is: `docs → design → critique → iterate`. Never: `design → design → design`. Iterating from a previous frame instead of from docs causes layouts to drift toward whatever the last frame happened to do, regardless of what the spec actually requires.

---

## Phase 0: Discovery

Before designing anything, build context.

### 0a. Read the spec chain

Read in order:
1. `CLAUDE.md` — project context, design tool, design direction
2. `docs/BRIEF-AND-DIRECTION.md` — tone, personality, goals, audience
3. `docs/DESIGN-LANGUAGE.md` — typography, color strategy, layout philosophy
4. `docs/DESIGN-TOKENS.md` — token values, semantic roles
5. `docs/DESIGN-TAXONOMY.md` — artifact index (find reference frames)
6. `docs/DESIGN-HEURISTICS.md` — taste settings. If `--use-defaults` was passed, use fallbacks from `references/taste-tuning.md` and state that mode is active before generating.
7. `docs/[FEATURE]-IDEAS.md` — locked direction + open variant decisions for the feature being designed.

Spec preflight has already enforced presence; this is a re-read to ground the work.

### 0b. Check for open decisions

Scan the feature doc's decision table. Decision rows may carry an optional `Type` column (`direction` | `variant`).

- **Open `direction` decisions →** Direction itself isn't locked. Stop and route the user back: *"This feature has open direction-level decisions. Run `/design-explore '[feature intent]'` first to lock the direction."* (Preflight should normally have caught this, but Mode 5 Pivot can re-open direction post-hoc.)
- **Open `variant` decisions (or untyped opens with DESIGN-HEURISTICS present) →** Write a proposal section to the existing `docs/[FEATURE]-IDEAS.md` (do not create the file — preflight already enforced its existence) with the questions that need answering. Present them to the user. **STOP. Do not design until the user answers.**
- **All decisions locked →** Proceed to Phase 1.

### 0c. Find reference frames

From the artifact index in `docs/DESIGN-TAXONOMY.md`, find all frames with stage "Final". Identify the one most similar to what's being designed (similar page type, similar content structure). This becomes the pattern reference.

If the reference frame is in Pencil, read it via Pencil MCP to extract spacing, hierarchy, and composition patterns.

### 0d. State active configuration

Before proceeding, state:
- Which taste-tuning settings are active (from heuristics doc or defaults)
- Which reference frame is being used as the pattern source
- What the feature doc says about this page/component

---

## Phase 1: Generate Variants

Generate **2-3 design variants** in Pencil via Pencil MCP.

### Structure in Pencil

Create a group named: `[proposal] [Feature Name] — [YYYY-MM-DD]`

Inside the group, create frames:
- `[variant] [Feature] — A: [short description of approach]`
- `[variant] [Feature] — B: [short description of approach]`
- `[variant] [Feature] — C: [short description of approach]` (optional)

### What each variant must include

- **Full route chrome** — header variant, main content, footer variant (from page spec convention)
- **Design system compliance** — use tokens, atoms, and components from the project's design system
- **Breakpoint-aware** — design for the primary breakpoint (usually desktop). Note how it adapts at other breakpoints in the critique report.

### How variants should differ

Variants should differ on **composition and hierarchy** — the dimensions where judgment matters. They should NOT differ on:
- Color (tokens already decide this)
- Typography families (design language already decides this)
- Component styling (design system already decides this)

Good variant axes:
- Layout pattern (F-pattern vs Z-pattern vs single-column)
- Content density (sparse vs balanced)
- Hierarchy emphasis (headline-dominant vs content-dominant)
- Whitespace (generous vs maximal)
- Section ordering (which story comes first)

### Reference frame influence

Extract patterns from the reference frame and apply them:
- Spacing proportions (ratio of padding to content)
- Typography hierarchy (how the reference frame sizes headings vs body)
- How interaction/accent color is used (or not used at rest)
- How the reference frame handles the header-to-content transition

Variants should feel like they belong in the same family as the reference frame, not like a different design system.

### "Push It Further" variant (optional)

After generating standard variants, optionally generate one additional variant that pushes past safety.

**When to generate:**
- The user explicitly asks: `/design-agent "design X — include a wild one"`. Pushed variants are opt-in only.

**How it works:**
- Take the strongest standard variant and increase DESIGN_VARIANCE by +3 from the active setting (cap at 10)
- Push the signature compositional choice 2-3x further (generous whitespace → extreme whitespace; asymmetric → dramatically asymmetric)
- Ban the single most conventional element in the variant and replace it with something unexpected
- Name this variant with the suffix `— [pushed]` (e.g., `[variant] Contact — C: dramatic asymmetry [pushed]`)

---

## Phase 2: Critique

Run the full critique framework on each variant. The four reference files were loaded upfront in "Self-contained dependencies" — no need to re-cite them per pipeline step.

### Critique pipeline (in order)

**1. Structural critique**
- Hierarchy & Flow checks
- Composition & Balance checks
- Typography checks
- Color & Contrast checks
- Interaction States checks (if applicable)

**2. Anti-pattern scan**
- Check each variant against every anti-pattern
- Flag any matches

**3. Layout pattern evaluation**
- Identify which layout pattern each variant uses
- Evaluate whether the pattern fits the content type

**4. Taste alignment**
- Compare each variant against the active taste settings
- Flag deviations (e.g., variant uses tight spacing but GRID_DENSITY is sparse (1-3))

**5. Subjective "feel" assessment** (Dimension 7: Emotional Resonance)
- Personality match
- Calm at rest
- Distinctiveness (does it avoid AI-generated patterns?)
- Cohesion

### Handling conflicts

If different critique dimensions disagree (e.g., anti-pattern scan says "too much whitespace" but taste settings set GRID_DENSITY to sparse (1-3)), **surface both signals**. Do not resolve the conflict. Present it to the user:

> "Conflict: The anti-pattern scan flagged excessive whitespace in Variant A, but the active GRID_DENSITY setting (sparse, 1-3) explicitly calls for this. This is either intentional or the taste setting needs adjustment."

---

## Phase 3: Report

### Update feature doc

Add a design rationale section to `docs/[FEATURE]-IDEAS.md`:

```markdown
## Design rationale — [date]

### Active settings
- DESIGN_VARIANCE: [label] ([range]), MOTION_INTENSITY: [label] ([range]), TYPE_CONTRAST: [label] ([range]), COLOR_ECONOMY: [label] ([range]), GRID_DENSITY: [label] ([range]), PERSONALITY: [value]

### Reference frame
- [Frame name] ([frame ID]) — used for spacing and hierarchy patterns

### Variants generated
- **A: [description]** — [layout pattern], [key characteristic]
- **B: [description]** — [layout pattern], [key characteristic]
- **C: [description]** — [layout pattern], [key characteristic]
```

### Present to user

For each variant, present:

```
### Variant A: [description]

**Critique results:**
✅ Hierarchy: clear primary element, natural reading flow
✅ Typography: follows type scale, clear weight contrast
⚠️ Whitespace: generous but approaching maximal in the hero section
❌ Anti-pattern: orphan element in the card grid at tablet breakpoint

**Taste alignment:** Matches active settings. No deviations.

**Subjective feel:** Calm at rest. The hero section may feel too empty — depends on whether headline copy is short or long.
```

If a pushed variant was generated, present it separately after the standard variants:

```
### Pushed Variant: [description]

This variant takes [Variant X] and pushes [specific element] further.
DESIGN_VARIANCE raised from [N] to [N+3].

**What changed:** [specific description of the push]
**What it gains:** [what becomes more distinctive or interesting]
**What it risks:** [what might break or feel uncomfortable]
**Critique results:** [standard critique]
```

The pushed variant is explicitly framed as "this might be too far — but it shows where the boundary is." It gives the user a calibration point.

Then a trade-off summary:

```
### Trade-offs
- **A vs B:** A has more breathing room but less content above the fold. B is denser but risks feeling busy on mobile.
- **B vs C:** B uses F-pattern (better for scan), C uses single-column (better for focused reading).
- **Recommended for your design direction:** A aligns most closely with "calm surface" and the reference frame's spacing patterns. B is the safe choice. C is the most distinctive but deviates from established patterns.
```

---

## Phase 4: Human Decision

**STOP and wait for the user.** Do not proceed to implementation.

The user will:
1. Review variants in Pencil
2. Pick one → rename to `[final]`
3. OR ask for iteration: `/design-agent "iterate — more whitespace on B"`
4. OR reject all: `/design-agent "try again with single-column layout"`

### After human picks a variant

The design agent's job is done. The user returns to Mode A:
- Implement the chosen design
- Run /visual-qa
- Run the sync gate
- Commit

The design agent does NOT implement, does NOT run visual QA, does NOT touch code.

---

## Iteration Rules

When iterating on a previous round (user says "iterate" or "try again"), these rules are non-negotiable.

### The re-derivation rule

1. **Re-read the full spec chain** — CLAUDE.md, BRIEF-AND-DIRECTION, DESIGN-LANGUAGE, DESIGN-TOKENS, DESIGN-TAXONOMY
2. **Re-read the feature doc** — decisions may have changed since the last round
3. **Re-read all four reference files** — critique framework, layout patterns, anti-patterns, taste tuning
4. **Rebuild the widget inventory from docs** — not from the previous Pencil frames
5. **THEN glance at previous Pencil frames** — only to understand what was tried, never as source of truth

Previous frames are **context**, not **spec**. The iteration loop is:

```
feedback + docs → new design → critique
```

Never:

```
feedback + previous frame → tweaked frame → critique
```

If you catch yourself copying a previous frame and adjusting it, STOP. Go back to docs. Derive the layout from the spec + feedback, not from the previous attempt + feedback.

### Concept integrity rule

Each variant must retain its own unique layout concept through iteration. If the user says "more whitespace on B," apply more whitespace to B's concept — don't make B look like A with extra padding. The concepts should remain distinguishable.

### Parallel variant generation

When generating multiple variants on iteration, consider parallel subagents — each briefed with the full doc-derived spec and a specific layout concept. This works because docs-as-source makes each agent self-contained.

### Preservation

Do NOT delete previous variants — the user needs them for side-by-side comparison when picking.

---

## Critique-Only Mode

**Trigger:** User says `/design-agent "critique [frame name or description]"` — requests critique without generating new variants.

### Process

1. Run Phase 0 discovery (read spec chain, heuristics, references) as normal
2. Identify the target frame in Pencil — read it via Pencil MCP
3. **If the frame can't be found:**
   - List all frames in the Pencil file by searching for frame-level nodes
   - Present the list to the user: "I couldn't find a frame named '[X]'. Here's what's in the file: [list]. Which one should I critique?"
   - If the user provides a screenshot instead, read it via the Read tool and critique that
   - If no frames exist at all, tell the user: "The Pencil file has no frames yet. Did you mean to point me at a screenshot, or should we generate designs first with `/design-agent 'design [feature]'`?"
4. Run the **full critique pipeline** from Phase 2 against the single frame:
   - AI Slop Detection gate
   - All 10 dimensions
   - Anti-pattern scan
   - Taste alignment check
5. Present the critique report using the standard Phase 3 format
6. Add a **"What would break it out?"** section — one specific change that would make the frame more distinctive
7. **STOP.** Do not generate alternatives unless the user asks for them

This mode is for when the user has designed something themselves (or iterated manually in Pencil) and wants an honest evaluation without the agent regenerating from scratch.

---

## Relationship with /design-explore

`/design-explore` is the upstream skill for creative exploration:
- `/design-explore` helps discover WHAT the direction should be (pre-spec), and can challenge locked directions when something feels off
- `/design-agent` generates compliant variants WITHIN a locked direction (post-spec)

When `/design-explore` completes, it may produce a DESIGN-HEURISTICS.md and updated feature docs. These become inputs to `/design-agent`.

The handoff: "Direction is locked. Run `/design-agent` to generate production variants."

If a user invokes `/design-agent` but their intent sounds exploratory ("what should this feel like?", "I'm not sure about the direction"), redirect them: "That sounds like exploration — try `/design-explore` first to nail down the direction, then come back here for production variants."

---

