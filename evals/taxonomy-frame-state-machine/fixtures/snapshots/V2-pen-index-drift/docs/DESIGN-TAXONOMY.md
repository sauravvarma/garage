# Design taxonomy

This file is the **single source of truth for the frame state machine**. Every `.pen` frame in the project obeys it; `/design-explore`, `/design-agent`, `/code-agent`, and `/visual-qa` all read and enforce it.

## Three axes — keep them separate

A frame carries three independent pieces of state. Only the first lives in the bracket prefix; folding the others into the bracket is the mistake this taxonomy exists to prevent.

| Axis | Where it lives | Values |
|---|---|---|
| **Lifecycle** | bracket prefix on the frame name | `[draft]` · `[concept]` · `[variant]` · `[anchor]` · `[final]` · `[deprecated]` |
| **Origin** | the enclosing **group's** name | `[explore]` · `[proposal]` · `[mirror]` |
| **Sync state** | the **artifact-index row** (never the frame name) | Synced · Out of sync · Not started · — |

## Lifecycle states

| State | Meaning | Carries sync state? |
|-------|---------|---------------------|
| `[draft]` | Solo work-in-progress — not committed, not competing. A loose sketch, a manual doodle, or vN+1 of an approved frame. | no |
| `[concept]` | A candidate competing in a **direction** decision. Exists only inside an `[explore]` group. | no |
| `[variant]` | A candidate competing in a **composition** decision. Exists only inside a `[proposal]` group. | no |
| `[anchor]` | Terminal, read-only **grounding** — a fixed point you design *against*, never implemented. The winner of a direction decision, or a mirror capture of shipped UI. | no |
| `[final]` | Terminal, **implementable** spec — approved for code. | yes |
| `[deprecated]` | Terminal — superseded or rejected. Kept as history (append-only). | no |

Two pairings make the machine small:

- `[concept]` and `[variant]` are the **same kind of state** — "candidate in a decision set" — differing only in *which* decision the set resolves (direction vs composition).
- `[anchor]` and `[final]` are both **terminal** and both play the **reference role** (below). They differ in one way: only `[final]` is implementable, so only `[final]` carries a sync state.

## The "reference" role — a role, not a state

"Reference" is **not** a lifecycle label. It is a *role*: **a frame read as grounding for new design work.** Two states play it, in three sub-roles:

| Sub-role | Played by | Grounds | Scope |
|---|---|---|---|
| **Direction anchor** | `[anchor]` (from `[explore]`) | how it should *feel* (aesthetic) | broad — one anchor informs many features |
| **Pattern source** | `[final]` (a similar page-type) | how we *compose* this family of page | same page-family, future features |
| **Mirror baseline** | `[anchor]` (from `[mirror]`) | what the *current shipped* UI looks like | 1:1, the same feature being redesigned |

Reference frames inform **proportion, hierarchy, and feel — never content or inventory.** Content always comes from the docs. "Reference → variant" is *grounding*, never *copy-and-rearrange*.

## State diagram

```
ORIGIN (group)   [explore] Intent — date       [proposal] Feature — date     [mirror] Feature — date
                 ┌─────────┐                    ┌─────────┐
SOLO WIP         │ [draft] │                    │ [draft] │
                 └────┬────┘                    └────┬────┘
            formalize │  │ N=1 decide   formalize    │  │ N=1 decide
                      ▼  │                           ▼  │
CANDIDATE        [concept] A/B/C…             [variant] A/B/C…
                      │ direction pick             │ composition pick
                 ┌────┴─────┐                  ┌───┴──────┐
                 ▼          ▼                  ▼          ▼
TERMINAL     [anchor]  [deprecated]        [final]  [deprecated]      [anchor]  (born terminal:
             (winner)   (losers)           (winner)  (losers)          one per shipped state)
                 │                              │
        writes DESIGN-HEURISTICS         sync state attaches
        + "Direction chosen"                  │
                 │                            ▼
                 └──── play the ───────▶ iterate: [final] X → [draft] X v2 → (pick) → [final] X v2
                       REFERENCE role                       (old [final] X → [deprecated], one atomic op)
                       for future [proposal]s

Pivot (/design-explore Mode 5): enumerated [anchor]/[final] frames → [deprecated]  (only re-open path, audit-trailed)
```

Six states: `draft → {concept | variant} → {anchor | final} | deprecated`. Every legal edge is drawn — anything not drawn is illegal. `[final]` is the one **hinge**: the output of one decision that, later, becomes a reference input to the next feature's proposal.

## Invariants (readers enforce, and block on violation)

- **I1** — at most one `[final]` per Artifact Name in the file.
- **I2** — at most one `[anchor]` per Artifact Name in the file.
- **I3** — `[concept]` and `[variant]` exist *only* inside a dated origin group (`[explore]` / `[proposal]`).
- **I4** — terminal states (`[anchor]`, `[final]`, `[deprecated]`) never transition back — **except** `/design-explore` Mode 5 Pivot, which relabels enumerated terminals to `[deprecated]` as an audit-trailed event.

`/design-agent` (Phase 0c), `/code-agent` (when reading the comp), and `/visual-qa` (Phase 0d) each check I1–I3 when they touch the file and **block on violation**. A hand-rename in the editor that breaks an invariant is caught at the next skill invocation, not silently shipped.

## Atomic promotion

Promoting a winner is **one indivisible operation** — never "rename the winner now, clean up the rest later":

1. rename the winner's bracket (`[concept]`→`[anchor]`, or `[variant]`/`[draft]`→`[final]`),
2. rename the losing siblings → `[deprecated]`,
3. rename any prior same-Artifact-Name terminal of the same kind → `[deprecated]` (this is what enforces I1/I2),
4. update every affected artifact-index row.

A decision with a single candidate (N=1) is still a promotion: a solo `[draft]` can be decided directly to `[final]` or `[anchor]`.

## Origin groups

Origin lives in the **group name**; lifecycle lives on the **frame**. Groups are always date-stamped.

| Group | Created by | Holds | Candidate label | Winner label |
|---|---|---|---|---|
| `[explore] Intent — date` | `/design-explore` | concepts for a **direction** decision | `[concept]` | `[anchor]` |
| `[proposal] Feature — date` | `/design-agent` | variants for a **composition** decision | `[variant]` | `[final]` |
| `[mirror] Feature — date` | `/design-agent` mirror mode | faithful captures of shipped UI | — (born terminal) | `[anchor]` |

A `[mirror]` group carries a *captured-on* date — **staleness, not sync, is its failure mode**; a stale mirror → `[deprecated]`.

## Sync states

The sync axis applies **only to `[final]` frames** (the moment a frame becomes implementable spec). All other states show `—` in the index.

| State | Meaning |
|-------|---------|
| Synced | Design and code match |
| Out of sync | One changed without the other |
| Not started | `[final]` exists, code doesn't yet |
| — | Not applicable (`[draft]`/`[concept]`/`[variant]`/`[anchor]`/`[deprecated]`) |

## Frame naming convention

### Format

```
[label] Artifact Name — Letter: Short Description
```

- **`[label]`** — one of the six lifecycle states above.
- **Artifact Name** — stable concept identity (never changes across the lifecycle).
- **Letter** — `A`, `B`, `C`… (only when comparing candidates in a set).
- **Short Description** — the spatial/layout concept (never generic like "option 1").

Examples:

```
[concept] Contact Page — A: Editorial Gravity
[variant] Hero Section — B: Centered Hero
[anchor]  Contact Page — Warm Minimalism (direction)
[final]   Hero Section — A: Side-by-side
```

### Sub-component nesting

Append `> Region > Element`:

```
[final] Hero Section — A: Side-by-side > Headline
[variant] Pricing Page — B: Master-detail > Sidebar > Tab Bar
```

### Origin groups in practice

Candidates always live inside a dated origin group (I3):

```
[explore] Contact Page Direction — 2026-04-14
  [concept] Contact Page — A: Editorial Gravity
  [concept] Contact Page — B: Warm Minimalism
  [concept] Contact Page — C: Swiss Precision

[proposal] Hero Section Widget — 2026-04-14
  [variant] Hero Section — A: Side-by-side
  [variant] Hero Section — B: Centered Hero
  [variant] Hero Section — C: Compact Card
```

### Lifecycle transitions (label changes, name stays stable)

**Direction decision (explore) — atomic promotion:**
```
[explore] Contact Page Direction — 2026-04-14
  [anchor]     Contact Page — B: Warm Minimalism
  [deprecated] Contact Page — A: Editorial Gravity
  [deprecated] Contact Page — C: Swiss Precision
```

**Composition decision (proposal) — atomic promotion:**
```
[proposal] Hero Section Widget — 2026-04-14
  [final]      Hero Section — A: Side-by-side
  [deprecated] Hero Section — B: Centered Hero
  [deprecated] Hero Section — C: Compact Card
```

**Iteration on an approved design:**
```
[final] Hero Section — A: Side-by-side
[draft] Hero Section — A: Side-by-side v2
```
On promotion of v2, the old `[final]` → `[deprecated]` in the same atomic op.

### Label text nodes

Follow `label/` prefix with the same naming:
```
label/ [variant] Hero Section — A: Side-by-side
```

### Rules

1. **Label always leads** — scannable in layer panels, instant lifecycle context.
2. **Label changes, name doesn't** — on promotion/deprecation, rename only the bracket prefix.
3. **Every `[concept]`, `[variant]`, `[anchor]`, or `[final]` frame gets a row in the artifact index** below. `[draft]` is too transient to index; `[deprecated]` keeps its existing row (relabeled in place).
4. **No unnamed frames** — delete the default/empty frame a newly-created `.pen` ships with.
5. **Origin groups are date-stamped** — so you know when the exploration/proposal/capture happened.
6. **Candidates live only inside a dated group** (I3) — a bare `[concept]`/`[variant]` at the canvas root is invalid.

## Artifact index

| Artifact | ID/Frame | Label | Sync state | Notes |
|----------|----------|-------|------------|-------|
| [anchor] Habit Tracker — Warm Ember (direction) | `X33ZJx` | anchor | — | Direction anchor (winner of `[explore]` 2026-05-20); wrote DESIGN-HEURISTICS. Reference role only — never implemented. |
| [final] Habit Tracker — B: Single-column card stack | `L8rvtM` | final | Synced | Implementable spec for `/habits`; winner of `[proposal]` 2026-05-25. Code matches. |
| [deprecated] Habit Tracker — A: Cool Grid | `W4aL1` | deprecated | — | Lost direction decision 2026-05-20. |
| [deprecated] Habit Tracker — C: Mono Ledger | `DPNer` | deprecated | — | Lost direction decision 2026-05-20. |
| [deprecated] Habit Tracker — A: Two-pane split | `KTDrB` | deprecated | — | Lost composition decision 2026-05-25. |
| [deprecated] Habit Tracker — C: Compact rows | `llUjP` | deprecated | — | Lost composition decision 2026-05-25. |

## Rules

### When you change code
1. Update the design comp if the change is material (layout, structure, content).
2. Update sync state in the artifact index above (`[final]` rows only).
3. If you skip the design update, mark as "Out of sync".

### When you change design
1. Frame name must follow the naming convention above.
2. Promotion is atomic (rename winner + losers + prior terminal + index rows in one operation).
3. Add or update the artifact index row with the frame ID.
4. Note whether code needs updating; update sync state accordingly (`[final]` only).
5. Never break an invariant (I1–I4) — readers will block on it.
