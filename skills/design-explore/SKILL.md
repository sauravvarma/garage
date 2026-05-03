---
name: design-explore
description: >-
  Creative exploration and design direction discovery — runs BEFORE specs are
  locked, or to challenge them when something feels off. Use /design-agent
  AFTER direction is locked for production variants. This skill helps find
  aesthetic direction, critiques screenshots/references, challenges locked
  decisions when the user wants to brainstorm pivots, generates divergent
  concepts via cross-domain inspiration / sensory metaphors / anti-examples,
  and produces loose Pencil sketches plus concept reports. Use when the user
  says /design-explore, asks "what should X feel like", wants design critique
  of a screenshot, wants to revisit or pressure-test direction, says "I want
  something different but can't articulate what", names an off-web reference
  for inspiration, or seems unsure whether they need exploration vs production
  variants (this skill triages). Pass `--ephemeral` for non-committal sessions
  where nothing writes to project docs.
---

# Design Explore

A creative exploration agent that helps discover design directions, critique existing work, and challenge assumptions — even when specs exist. Where `/design-agent` executes within decided constraints, `/design-explore` helps figure out what those constraints should be, or whether they're still the right ones.

Primarily invoked explicitly via `/design-explore`. May also activate when the user's design intent is ambiguous and needs triage between exploration and production.

## When to use

- User says `/design-explore "what should the contact page feel like?"`
- User says `/design-explore "I want something different but I can't articulate what"`
- User says `/design-explore "critique this screenshot"`
- User says `/design-explore "I'm not sure the design direction is right anymore"`
- User says `/design-explore "what if we went a completely different way?"`
- User is pre-spec, exploring aesthetic direction
- User has specs but wants to pressure-test or pivot them

## When NOT to use

- User wants compliant production variants within a locked direction → `/design-agent`
- User wants to implement a design → Mode A
- User wants visual QA of implemented code → `/visual-qa`

## Self-contained dependencies

All knowledge is embedded in `references/`:

- `references/design-traditions.md` — cross-domain inspiration catalog (10 traditions)
- `references/exploration-techniques.md` — divergent methods, sensory vocabulary, genre subversion (7 techniques)
- `references/direction-critique.md` — lightweight 6-question critique for exploratory work
- `references/pencil-rendering-quirks.md` — known Pencil MCP rendering quirks (fresh-insert paint failures in cloned sheets, +50px y-offset on certain frames) and the clone-and-modify workaround

Load references progressively based on mode (see each mode's "References needed" line). Do not load the design references all upfront — load what the mode requires. **Exception:** load `pencil-rendering-quirks.md` before any mode that writes to a `.pen` file (the loose-sketch generation in modes that produce Pencil output). Skipping it risks burning a session on invisible-widget debugging.

---

## Ephemeral mode

For genuine "what if" exploration that must not touch project state, accept a trailing `--ephemeral` flag:

`/design-explore "<intent>" --ephemeral`

Detect the literal `--ephemeral` substring anywhere in the prompt; strip it from the intent string before routing. Document trailing form to users; accept other positions silently. When ephemeral mode is active:

- All concept reports go to `/tmp/design-explore-scratchpad-[YYYY-MM-DD]-[slug].md` instead of project docs
- **Skip every write to `docs/`** — including the Direction Commit Gate and any feature-doc updates. Mode 5's Reaffirm/Tweak/Pivot writes also redirect to `/tmp/` (see Mode 5 Step 4).
- Pencil sketches use `design/exploration-scratchpad.pen` (or `/tmp/exploration-scratchpad.pen` if no `design/` directory exists yet)
- The final message to the user always includes the scratchpad file path so they can manually copy anything that resonates into the real project docs later
- The skill never blocks on missing project structure in ephemeral mode

Ephemeral overrides the commit rule everywhere else in this skill. Without `--ephemeral`, the Direction Commit Gate is non-negotiable.

---

## Phase 0: Stage Detection

Before doing anything creative, figure out where the user is and what they actually need. This runs every invocation.

### Step 1 — Read what exists

Check for these files (don't fail if they're missing — their absence is signal):

1. `CLAUDE.md` — does the project exist? Is there a design direction stated?
2. `docs/BRIEF-AND-DIRECTION.md` — is there a brief?
3. `docs/DESIGN-LANGUAGE.md` — has a design language been chosen?
4. `docs/DESIGN-TOKENS.md` — are tokens defined?
5. `docs/DESIGN-HEURISTICS.md` — are taste settings locked?
6. `docs/[FEATURE]-IDEAS.md` — is there a feature doc for what the user is asking about?

### Step 2 — Classify the stage

Based on what exists, classify into one of four stages:

**Stage A: Blank slate** — No docs, no brief, no design language. The user is starting from zero.

> ⚠️ **Stage A guard:** Until the user runs `/spec-first-project-setup`, run in `--ephemeral` mode automatically — concepts go to `/tmp/`, no `docs/` writes. There's nowhere to commit yet.

→ Usually route to **Mode 1: Direction Discovery** (start with the aesthetic interview), but route by intent — a blank-slate user might also want Mode 2 (cross-domain) or Mode 4 (anti-example). After Step 4 narrowing, tell the user: *"Direction is forming. Run `/spec-first-project-setup` next so I have a place to commit DESIGN-HEURISTICS and the feature docs. Or pass `--ephemeral` if you want to keep this session non-committal."*

**Stage B: Pre-spec exploration** — Brief exists, maybe a design language, but decisions aren't locked for this feature. The user knows the general direction but not the specifics.
→ Route to **Mode 1** or **Mode 2** depending on what they asked for.

**Stage C: Specs exist, user wants to challenge them** — Design language, tokens, heuristics are all locked. But the user is back because something feels off, or they want to explore a pivot.
→ Route to **Mode 5: Challenge the Docs** (new mode — see below).

**Stage D: Specs exist, user wants production variants** — Everything is locked and the user is ready for compliant design work.
→ Redirect: "It looks like your design direction is locked and you're ready for production variants. Run `/design-agent 'design [feature]'` instead. If you're here because you want to *question* the direction, tell me what feels off and I'll switch to exploration mode."

### Step 3 — State what you found

Before proceeding, tell the user:
- What docs exist and what's missing
- Which stage you've classified them into
- Which mode you're entering and why
- If you're uncertain: ask. "It looks like you have a locked design language but you're asking an exploratory question. Do you want to brainstorm within that direction, or are you questioning whether the direction itself is right?"

Don't assume. The user saying "explore the contact page" when specs are locked might mean "I want creative ideas within the locked direction" (→ redirect to /design-agent) or "I'm not sure the direction works for contact pages" (→ Mode 5). Ask.

---

## Pencil file resolution

Resolve before any Pencil MCP call:

1. Read `CLAUDE.md` for a `## Pencil design file` section. Found → use that absolute path for every call.
2. Missing section → create `design/[project-name].pen` and register it in CLAUDE.md.
3. Blank slate (no CLAUDE.md) → create `design/exploration.pen` as a scratch file; don't register it yet. Migrate when the user runs `/spec-first-project-setup`.
4. NEVER use `/new` (ephemeral; work lost when the editor switches context).
5. Same resolved path for every call.

### Frame naming for exploration

Exploration frames go in a group named: `[explore] [Intent] — [YYYY-MM-DD]`

Inside, frames are named by concept, not variant letter — exploration concepts shouldn't get conflated with `/design-agent`'s production A/B/C variants:
- `[concept] Editorial Gravity — bold serif headlines, generous whitespace`
- `[concept] Warm Minimalism — restrained palette, rounded forms, breathing room`
- `[concept] Swiss Precision — tight grid, monospace labels, high contrast`

---

## Mode 1: Direction Discovery

**Trigger:** User has a vague intent, no direction at all, or is at Stage A/B.

**References needed:** `design-traditions.md` + `exploration-techniques.md`

### Step 1 — Aesthetic interview (conversational)

Ask 3-5 targeted questions. Not about design preferences directly — people can't articulate those well. Instead, use comparative and sensory prompts:

- "Which of these two descriptions feels closer to what you want?"
  - A: "A quiet room with one perfect object on a shelf"
  - B: "A busy workshop with tools and materials spread across every surface"
- "If this page were a physical space, what would it smell like? What's the lighting?"
- "Name a website, magazine, building, or product that has the *feeling* you want — even if the content is completely different."
- "What should this absolutely NOT feel like?"

Don't ask all at once. Ask one, listen, then ask the next based on what they said. Use Technique 6 (Comparative Pairs) from `exploration-techniques.md` for the first question.

### Step 2 — Concept generation

Based on the interview, generate **3-5 written concept descriptions**. Each concept:

- Has a name (2-3 words that capture the aesthetic)
- Names the design tradition it draws from (see `design-traditions.md`)
- Describes the feeling in sensory terms (weight, texture, temperature, rhythm)
- States what it borrows from the tradition and what it subverts
- Identifies one "signature tension" — the contradiction that makes it interesting

Present concepts as written descriptions first. Do NOT jump to Pencil yet. The user needs to react to ideas before seeing layouts.

### Step 3 — Sketch (optional, on request)

If the user wants to see concepts visualized, generate loose Pencil frames. These are **sketches, not production designs:**

- Use approximate spacing (don't agonize over 4pt grid compliance)
- Placeholder content is fine (but placeholder that matches the *tone* — don't use "Lorem ipsum" if the concept is "sharp and technical")
- Color and type should gesture at the direction, not implement the final token system
- One frame per concept, single breakpoint (desktop)

### Step 4 — Narrowing

After the user reacts, either:
- Merge elements from multiple concepts ("the type treatment from A with the spatial rhythm of C")
- Sharpen one concept into 2-3 sub-variants that differ on specific dimensions
- Reject all and run another divergent round with updated anti-examples

### Step 5 — Commit the direction

→ Run the **Direction Commit Gate** (see below) before ending the session. Skip if `--ephemeral` is active. If the user is rejecting concepts and wants another divergent round, defer until they pick one — but never exit with a chosen concept and no `DESIGN-HEURISTICS.md` written.

---

## Mode 2: Cross-Domain Exploration

**Trigger:** User names a specific non-web reference or asks for inspiration from outside web conventions.

**References needed:** `design-traditions.md` + `exploration-techniques.md`

### Process

1. Read `design-traditions.md` for the named tradition (or closest match)
2. Identify the tradition's core spatial and visual principles
3. Translate those principles into web design language — what does "Swiss poster composition" mean for a nav + hero + content layout?
4. Generate concepts that apply those principles faithfully, not superficially
5. For each concept, state: "This borrows [X] from [tradition] and adapts it by [Y]"

The goal is genuine translation of principles, not cosplay. "Japanese-inspired" doesn't mean slapping a zen circle on a white page — it means understanding ma (negative space as active element), wabi-sabi (beauty in imperfection), and applying those spatial ideas.

### Step 5 — Commit the direction

→ Run the **Direction Commit Gate** (see below) if the user picks a concept. Skip if `--ephemeral` is active. If the user is just exploring without picking, say so explicitly: *"Concepts shown for exploration only — no project docs written. Tell me when one resonates and I'll commit it."*

---

## Mode 3: Critique of External Work

**Trigger:** User provides a screenshot, URL description, or points to an existing Pencil frame and asks for critique.

**References needed:** `direction-critique.md` only

### Process

1. Read `direction-critique.md`
2. If it's a Pencil frame, read it via Pencil MCP
3. If it's a screenshot, read it via the Read tool
4. Run the exploration critique — the six questions:
   - **What tradition is this drawing from?** Name it explicitly.
   - **What's the signature move?** The one design choice that defines this.
   - **What's conventional?** Where does it follow the most common path?
   - **What's the weakest spatial relationship?** Where does the eye have nowhere to rest, or two elements compete?
   - **What would break it out?** One specific change that would make it more distinctive.
   - **What's the unasked question?** A design tension the work hasn't resolved.
5. Present findings conversationally, not as a rubric checklist

---

## Mode 4: Anti-Example Driven Exploration

**Trigger:** User describes what they DON'T want, or asks to "do something different from X."

**References needed:** `exploration-techniques.md` + `design-traditions.md`

### Process

1. Catalog the anti-examples explicitly: "Closing off: centered heroes, card grids, blue accents, rounded everything"
2. For each closed-off pattern, identify what it was solving (e.g., card grids solve "show multiple items of equal importance")
3. Generate alternative solutions to the same underlying problems — ones that don't use the closed-off patterns
4. Present as concepts with names and descriptions
5. The user's anti-examples join the AI slop list as additional constraints for this session

### Step 6 — Commit the direction

→ Run the **Direction Commit Gate** (see below) if the user picks an alternative. Skip if `--ephemeral` is active. If the user is just exploring, no commit — but make the no-commit explicit so they know nothing was saved.

---

## Mode 5: Challenge the Docs

**Trigger:** User has locked specs but wants to pressure-test, brainstorm pivots, or revisit decisions. Stage C from Phase 0.

**References needed:** `design-traditions.md` + `direction-critique.md` + the project's own spec chain

This mode exists because specs should be living documents, not sacred texts. A user who says "I'm not sure this direction is working" deserves exploration, not a redirect to `/design-agent`.

### Process

**Step 1 — Understand what's being questioned**

Read the full spec chain (CLAUDE.md → BRIEF-AND-DIRECTION → DESIGN-LANGUAGE → DESIGN-TOKENS → DESIGN-HEURISTICS). Then ask:

- "What specifically feels off? Is it the overall direction, a specific page, or a particular design choice?"
- "Are you questioning the *principle* (e.g., 'calm surface' isn't right) or the *execution* (e.g., 'calm surface is right but the current tokens don't achieve it')?"

This distinction matters. Questioning the principle is exploration. Questioning the execution is refinement within the existing direction — and might be better served by `/design-agent` in critique-only mode.

**Step 2 — Critique the locked direction**

Treat the locked design direction itself as a design to critique. Run the 6-question direction critique against the spec:

- What tradition is the current direction drawing from?
- What's the signature move of this direction?
- What's conventional about it?
- What's the weakest part of the direction? (Not a spatial relationship — a conceptual weakness)
- What would break it out? One change to the direction itself that would make it more distinctive.
- What's the unasked question? A tension the direction hasn't resolved.

Present this honestly. If the direction is strong, say so. If it's generic, name that. The user asked for a challenge, not validation.

**Step 3 — Generate alternative directions**

Generate 2-3 alternative directions that address whatever felt off. Each alternative:

- Names what it keeps from the current direction (continuity is valuable)
- Names what it changes and why
- Identifies the trade-off: "You gain [X] but lose [Y]"
- States how much rework would be required: "This is a tweak to tokens" vs. "This is a full design language reset"

**Step 4 — Decision**

The user can:
- **Reaffirm the current direction** — "OK, I'm convinced it's right." Append a one-line audit entry to `docs/DESIGN-HEURISTICS.md` under a "## Reaffirmations" section: `[YYYY-MM-DD] Reaffirmed after challenge: [one-sentence rationale]`. This leaves a trail so the same doubt doesn't resurface unexamined.
- **Tweak the direction** — adjust DESIGN-HEURISTICS.md taste parameters and specific tokens. → Run the **Direction Commit Gate** (see below) to re-write DESIGN-HEURISTICS.md with the new settings.
- **Pivot** — fundamentally change the direction. Before declaring impact, enumerate the affected work: list every Pencil frame in the file (via Pencil MCP search) and every `[FEATURE]-IDEAS.md` doc with a "Direction chosen" entry. → Run the **Direction Commit Gate**, plus update DESIGN-LANGUAGE.md and possibly DESIGN-TOKENS.md. Mark all open `direction` decisions as re-opened in affected feature docs (this is the post-hoc reopen path that `/design-agent` and `/code-agent` watch for via the Type column). Flag the pivot scope: "This will invalidate the following frames and feature directions: [enumerated list]."
- **Keep exploring** — not ready to decide. Continue in exploration mode.

If `--ephemeral` is active, all writes go to `/tmp/` instead of project docs. Reaffirm/Tweak/Pivot still produce a scratchpad report; project state is untouched.

---

## Direction Commit Gate

Triggered when the user picks a concept (Mode 1 Step 5, Mode 2 Step 5, Mode 4 Step 6, Mode 5 Step 4 Tweak/Pivot). Skip entirely if `--ephemeral` is active — those writes go to `/tmp/` instead.

**Why this gate is load-bearing:** `/design-agent`'s spec preflight hard-blocks without `docs/DESIGN-HEURISTICS.md`. Skipping the write breaks the next skill in the chain — the user thinks direction is locked, then `/design-agent` refuses to run.

**Required outputs:**

1. **Write `docs/DESIGN-HEURISTICS.md`** — translate the chosen concept into taste-tuning parameters using the human-readable "label (range)" format. Always write the **label first**, with the numeric range in parentheses — designers and PMs should be able to read the file without looking up what numbers mean.
   - DESIGN_VARIANCE: e.g., "distinctive (7-8)"
   - MOTION_INTENSITY: e.g., "micro-only (3-4)"
   - TYPE_CONTRAST: e.g., "dramatic (7-8)"
   - COLOR_ECONOMY: e.g., "restrained (3-4)"
   - GRID_DENSITY: e.g., "sparse (1-3)"
   - PERSONALITY: e.g., "warm"

   Labels come from the design-agent's taste-tuning reference. If the file already exists from a previous run, update it rather than overwrite, and note what changed.

2. **Update feature docs** — if exploration was scoped to a specific feature, append a "Direction chosen — [date]" entry to `docs/[FEATURE]-IDEAS.md` with the concept name, tradition, and signature tension.

3. **State the handoff** — "The [feature] direction is locked. Run `/design-agent 'design the [feature]'` to generate compliant variants."

The exploration skill does NOT generate production frames, enforce token compliance, implement code, or run visual QA — those are downstream responsibilities of `/design-agent`, `/code-agent`, and `/visual-qa`.

---

## What makes exploration different from production

| Dimension | /design-explore | /design-agent |
|-----------|----------------|---------------|
| Input | Vague intent, feelings, anti-examples, doubt about direction | Locked specs, decision tables |
| Output | Concepts, loose sketches, direction reports, doc updates | Production variants, critique reports |
| Constraint level | Minimal — exploring the space | Maximal — within decided constraints |
| Variant axis | Radically different traditions/directions | Composition/hierarchy within one direction |
| Critique | "What tradition? What's conventional? What would break it out?" | Full 10-dimension production rubric |
| Token compliance | Not required | Required |
| Decision state | Pre-lock, or challenging post-lock | Post-lock |
| Docs relationship | Creates and challenges docs | Reads and obeys docs |

---

## Quick trigger phrases

- `/design-explore "what should the contact page feel like?"`
- `/design-explore "I want something like a Japanese garden but for a tech portfolio"`
- `/design-explore "critique this screenshot"` (attach image)
- `/design-explore "show me 5 radically different directions for the home page"`
- `/design-explore "everything I've seen looks the same — help me find something different"`
- `/design-explore "NOT a typical SaaS landing page, NOT card grids, NOT blue accent"`
- `/design-explore "I'm not sure the calm surface direction is working for the work page"`
- `/design-explore "what if we went brutalist instead?"`
- `/design-explore "explore vibe options for a marketing site" --ephemeral` (no project docs written)
