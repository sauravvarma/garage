---
name: spec-research
description: Researches a thin, stale, or gap-ridden `[FEATURE]-IDEAS.md` and proposes a draft decision tree (page states) plus a list of adjacent gaps (chart shape, units, taxonomy entries, design-code drift, vague verbs, locked-but-undescribed decisions) — so that `/code-agent`, `/visual-qa`, or `/design-agent` can run without flying blind. Reads API contracts, source-of-truth render branches (for ports), role/permission gates, URL params, sibling specs, and design comps. Writes proposals back into the IDEAS doc as a draft section the user reviews and locks. Use whenever an IDEAS doc is thin and you're about to plan, implement, port, or QA against it — even before another skill refuses. Not a coding tool, not a design tool, not a QA tool.
---

# spec-research — turn a thin spec into a reviewable draft

This skill exists because most "the AI shipped the wrong thing" bugs aren't coding bugs — they're scoping bugs. The spec described the happy path; nobody enumerated the empty / error / role-gated / mid-fetch branches; the code shipped what was described. /spec-research is the **spec-completion phase** between scaffolding (`/spec-first-project-setup`) and implementation (`/code-agent`).

The output is always a **proposal**, never a unilateral edit. The user accepts/edits/rejects rows. The skill does the research so the user can review, not the other way around.

## When to invoke

Invoke directly whenever an IDEAS doc is missing detail you'd need to implement or QA against. Also invoked indirectly: `/code-agent` and `/visual-qa` route here when their preflights detect a thin spec.

Typical triggers:
- *"The IDEAS doc has no Page states table — derive one."*
- *"We're porting Sleep Insights from mweb — read the source and reconcile against the IDEAS doc."*
- *"This feature has only 2 locked decisions; what else needs to be locked before I can implement?"*
- *"This route's IDEAS doc was written 3 commits ago — has it drifted from the code?"*

If the IDEAS doc doesn't exist at all, route the user to `/spec-first-project-setup` to scaffold it first; this skill fills, it doesn't scaffold.

## Inputs

- **Required:** path to a `[FEATURE]-IDEAS.md` in the project (or the project root + a feature name to fuzzy-match).
- **Required:** project root with `CLAUDE.md` and `docs/REPO-CONVENTIONS.md` — to know the data flow, parser rules, token system.
- **Optional but high-value:**
  - Source file or directory to port from (mweb component, legacy app, etc.)
  - API contract documentation or example responses
  - Sibling IDEAS docs in the same route family (shared decisions cross-reference)
  - Design comp (Pencil, Figma) — read structure, not just visuals

If the IDEAS doc references mweb / a legacy source and that source isn't readable, ask the user for a pointer before proceeding. Don't guess what the source renders.

## Process — derive the decision tree

The decision tree is the **product-level state machine** — what the page renders given its inputs. It is *not* a dump of render branches in source code; the source code populates the tree but isn't the tree.

### Step 0 — migration interrogation (per feature, not per project)

Migration is a per-feature posture, not a project-wide one. A repo can have one port-feature next to ten greenfields — so the question gets asked at every feature, not once at bootstrap. Ask the user:

> *"Is this feature a port from a source (sibling repo, legacy codebase, demo, prior internal version)?"*

- **No** → skip the rest of this step; go to Step 1.
- **Yes** → drive the port-aware path:

  1. **Capture source pointer.** Get source path(s) — repo, directory, key files. Save them in a `Source mirror` block at the top of the feature IDEAS doc (see Output format).
  2. **Read the global port rules.** Open the project's `docs/REPO-CONVENTIONS.md` and find the port-relevant sections: *Naming & file layout*, *Primitive substitutions*, *Backend-contract gotchas*, *Source-baggage drop list*. (These were scaffolded by `/spec-first-project-setup`; they may be empty.)
     - **Populated** → carry the locked rules forward as constraints on this feature's port plan.
     - **Empty or thin** → surface as the first adjacent gap: *"This is one of the first port-features this project has spec'd; the global port rules in REPO-CONVENTIONS.md are sparse. Want to fill them now (so future port-features inherit), or inline the per-feature decisions and leave the global doc thin for now?"* Either path is valid — let the user choose. If they fill globally, propose draft rows in REPO-CONVENTIONS and wait for lock before continuing.
  3. **Add a `Source mirror` block to the feature IDEAS doc.** Columns/rows that always appear:
     - Source path being mirrored (repo + dir).
     - Target path (with mapping rationale — typically applying the global naming rules: strip version suffixes, drop `/experiments/`, etc.).
     - Per-source render branch → target state (this is what the existing Step 3 produces; nest under this block).
     - Deliberately preserved behavior, with reason.
     - Deliberately dropped behavior, with reason (cross-link to the global drop list when applicable; if a drop is new and reusable, propose promoting it).
     - Primitive substitutions in use (referenced from the global table).
     - Backend-contract gotchas hit (referenced from the global section).
  4. **Conformance check at proposal time.** Once states/decisions are drafted (after Step 4 populates the table), verify each row against the global rules: target paths match the naming convention, no source-baggage propagated, primitive substitutions applied where source uses a missing primitive, backend gotchas accounted for. Mismatches become adjacent gaps in the proposal.

For greenfield features, none of this applies — the rest of the process is unchanged. The skill's behavior cleanly bifurcates on the Step 0 answer.

### Step 1 — inventory the inputs

For the feature in scope, list every input that can change what's rendered:

- **API endpoints** the page calls. For each: response shape (fields, optional fields, arrays-that-can-be-empty), error envelopes (recoverable vs terminal), latency characteristics (does it stream, refetch, race).
- **URL params** (`:patientId`, `?fixture=`, `?tab=`).
- **Redux state slices** the page reads (eligibility flags, onboarding state, feature flags, active-patient).
- **User role / permission gates** (logged in vs out, role-scoped, plan-gated).
- **Timing-dependent state** (refetch in flight, patient switch mid-load, SSE disconnect, optimistic update pending).
- **Sibling-page state** (if a parent route's state leaks in, e.g. sidebar resize, navigation entry context).

Don't trust the design comp for this — it shows the happy path. Walk the API contract field by field and ask: *"what if this is missing, empty, an error, role-gated, late?"*

### Step 2 — derive states from inputs

Cross-product the inputs with the state families that a page can be in. Common families:

- Loading / first paint (no data yet)
- Stale refetch (have prior data, refetching in background)
- Success — primary data
- Success — empty data (zero rows, no records)
- Partial data (some fields missing, optional sections absent)
- Error — recoverable (retry CTA available)
- Error — terminal (5xx persistent, auth lost, force re-login)
- Role / permission gated (eligible / ineligible / not-yet-onboarded / plan-gated)
- Stale-during-key-change (e.g. patient switch mid-fetch)
- Network offline / SSE disconnected (when applicable)
- Mutation in-flight (POST/PUT/DELETE pending)
- Mutation failed (4xx validation, 5xx, network drop)
- Optimistic success (mutation pending, UI showing predicted state)

Not every family applies to every feature. Drop the ones that don't (and say why, briefly). Add families specific to the project (e.g. dweb has *patient-switch-stale*; a chat app might have *typing-indicator visible*; a streaming-data app might have *backfill-in-progress*).

The goal is: each state is a **distinct render branch** with its own trigger, its own visible content, and its own way the user exits it. If two "states" render the same thing under the same trigger, they're one state.

### Step 3 — for ports, mirror source render branches

Only runs when Step 0's interrogation answered "yes, this is a port." The output of this step nests inside the `Source mirror` block established in Step 0; it doesn't introduce a separate output structure.

Read the source component's full render tree:

- Every `if (...) return ...` and ternary in the render path
- Every reducer flag whose name starts with `is/has/should/can`
- Every action creator that changes the slice shape
- Every selector that gates a render branch

Map each source branch to a node in the decision tree. Some will collapse (the source uses a boolean flag, but it's the same state as one already in your tree). Some will reveal states you'd have missed without the source.

If the source has 8 branches and your derivation has 4, find the missing 4 *or* explain why the target implementation legitimately drops them (e.g. "target routes mount per-patient, so source's `patient-switch-stale` branch is unreachable here — drop with rationale"). Drops with a reusable rationale get proposed for promotion to the global *Source-baggage drop list* in REPO-CONVENTIONS.

### Step 4 — populate the table

Use the spec-first feature-ideas template's `## Page states` table. Columns: `# | State | Trigger | Renders | Dispatches | Exit | Status`.

Fill every column you can derive. Where you can't, write `<!-- needs decision: ... -->` so the user can see what's open.

The `Status` column is the user's call: `shipped` (in scope this iteration), `deferred` (acknowledged but not implementing yet), `dropped` (deliberately not supported, with reason). Default to `shipped` for states you'd recommend implementing now; mark `deferred` for states that are clearly future work; never silently omit.

## Process — surface adjacent gaps

States are the most common scoping miss, but they're not the only one. After deriving the decision tree, pass over the IDEAS doc again and flag anything else that would surprise a reader after shipping:

- **Vague verbs in locked decisions.** "Handle the X case", "Support Y", "Work with Z" — what does it look like? What dispatches? Push for a concrete render rule.
- **Locked-but-undescribed visual choices.** A locked decision like "use a chart library" without a chart shape (line, bar, dots-with-line, range bars). A locked "show a CTA" without copy. A locked "expandable panel" without an animation/transition decision.
- **Field shape / parser contract.** What fields does each API response object contain? Optional vs required? Snake or camel? Per parser philosophy, every field is explicitly mapped — but the IDEAS doc has to tell us *what fields exist* before the parser can map them.
- **Token coverage.** Any new visual value (color, spacing, shadow) that doesn't trace to an existing token. Should propose adding it as a token in `docs/DESIGN-TOKENS.md`.
- **Design taxonomy entry.** Is the feature listed in `docs/DESIGN-TAXONOMY.md` with a sync state? If not, that's a debt entry the implementer will otherwise create silently.
- **Inconsistent locked decisions.** E.g. "URL is the source of truth" + "page renders based on a hidden Redux flag" — surface the conflict; ask which wins.
- **Stale doc-vs-code drift.** If the IDEAS doc references an API shape, a route path, or a Redux slice that has since changed (grep the codebase, compare), flag the staleness.
- **Untraceable source claims.** If the IDEAS doc says "match mweb's behavior for X" and you can't find X in the referenced source, ask before mirroring.

Each gap becomes a question for the user, not a unilateral fill. Phrase them so a 1-line answer is enough: *"What chart shape — two-line, stacked bars, dots-with-line?"* not *"Specify the chart shape with full rationale."*

## Output format

Produce a proposed patch to the IDEAS doc, marked as drafts so the user reviews before they become spec. For greenfield features the patch is two sections (`Page states` + `Adjacent gaps`); for ports it gains a third (`Source mirror`) anchored above the others.

```markdown
<!-- DRAFT — proposed by /spec-research [date]. Review and lock before /code-agent. -->

## Source mirror   <!-- only for ports; omit for greenfield -->

- **Source path:** `<repo>/<dir>/<file>` (the verbatim source being ported)
- **Target path:** `<repo>/<dir>/<file>` (after applying global naming rules from REPO-CONVENTIONS → Naming & file layout — strip version suffixes, drop experiment segments, etc.)
- **Preserved behavior:** bullet list with reason per item.
- **Dropped behavior:** bullet list with reason per item. Cross-link the global *Source-baggage drop list* when a drop matches an existing rule; propose promotion when a new drop is reusable.
- **Primitive substitutions used:** ref rows from REPO-CONVENTIONS → Primitive substitutions (e.g. `Client_Only_Render → @loadable/component`).
- **Backend-contract gotchas hit:** ref entries from REPO-CONVENTIONS → Backend-contract gotchas (e.g. platform-header masquerade).
- **Conformance check result:** pass / mismatches-as-gaps. Mismatches surface in the Adjacent gaps section below.

## Page states

| # | State | Trigger | Renders | Dispatches | Exit | Status |
|---|-------|---------|---------|------------|------|--------|
| 1 | loading | initial mount, no cached data | LoadingSkeleton | fetchX | data lands | shipped |
| 2 | success | data && data.length > 0 | ChartView | — | patient switch | shipped |
| ... | ... | ... | ... | ... | ... | shipped/deferred/dropped |

## Adjacent gaps (questions for the user)

- **Chart shape.** Decision #3 locks `recharts` but not the visualisation. Two-line / stacked bars / dots-with-line?
- **Units.** Spec doesn't list reading-object fields (systolic, diastolic, pulse, takenAt, ...). Need this for the parser.
- **Design taxonomy.** No entry in `docs/DESIGN-TAXONOMY.md` for `blood-pressure`. Add as out-of-sync, or have `/design-agent` produce a frame first?
- **403 reachability.** Locked entry "deep-link from Health Score" bypasses sidebar gating — the 403 state IS reachable and needs a render rule. What does it look like?
- ...
```

**Two ways to deliver the patch:**

1. *(default)* Write the draft directly into the IDEAS doc, near the top, wrapped in an HTML comment marker. The user edits in place — accepting a row means deleting the `DRAFT` marker around it; rejecting means deleting the row; deferring means changing Status. Cleaner workflow than a separate review file.
2. *(fallback if the file is not writable, or the user opts out)* Print the proposed patch in the response with copy-paste instructions.

Always announce which one you did. Never silently drop the draft into the doc without telling the user.

## Handoff contract

When invoked by another skill (e.g. `/code-agent`'s preflight router), return a short structured report:

- Where the draft was written (path + section header) or printed
- Count: states proposed, of which N `shipped` / M `deferred` / K `dropped`
- Count: adjacent gaps surfaced
- Open questions the user needs to answer before re-invoking the caller
- A one-line resumption hint: *"Once locked, return to `/code-agent`."* (or `/visual-qa`, etc.)

Don't echo the full draft back to the caller — point at it. The caller doesn't need to know what's in it, only that it exists and is awaiting human review.

## What this skill is NOT

- **Not a code-writer.** Never produces source files (`.js`, `.tsx`, `.css`, etc.). Outputs are markdown proposals for the IDEAS doc only.
- **Not a design tool.** When a gap is visual / variant-level (chart shape, panel animation, layout strategy), surface it as a question — route the user to `/design-agent` if the answer needs generated variants, or `/design-explore` if direction itself is unclear. Don't try to answer visual questions inside this skill.
- **Not a QA tool.** Doesn't take screenshots, doesn't enumerate breakpoints, doesn't run Playwright. `/visual-qa` consumes the decision tree this skill produces.
- **Not a unilateral editor.** Always marks proposals as `DRAFT`. The user locks.

## Out of scope routing

- IDEAS doc doesn't exist → `/spec-first-project-setup` (scaffold first; this skill fills, doesn't bootstrap).
- The gap is visual / variant-level (chart shape, animation, layout) and the user wants options → `/design-agent`.
- Direction itself isn't locked (the *kind* of page is undecided) → `/design-explore`.
- The decision tree is filled, ready to implement → `/code-agent`.
- The decision tree is filled, ready to QA → `/visual-qa`.
