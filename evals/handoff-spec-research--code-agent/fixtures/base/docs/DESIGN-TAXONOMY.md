# Design taxonomy

## Lifecycle labels

| Label | Meaning |
|-------|---------|
| Draft | Exploring — not a commitment |
| Variant | Comparing options |
| Final | Approved for implementation |
| Deprecated | Replaced by a newer final |

## Sync states

| State | Meaning |
|-------|---------|
| Synced | Design and code match |
| Out of sync | One changed without the other |
| Not started | Design exists, code doesn't yet |

## Frame naming convention

All frames in `design/streakly.pen` follow `[label] Artifact Name — Letter: Short Description`. The bracket prefix is the lifecycle label and the single source of truth for a frame's stage. Proposal groups are date-stamped. No unnamed or default frames.

## Artifact index

| Artifact | ID/Frame | Label | Sync state | Notes |
|----------|----------|-------|------------|-------|
| Habit Tracker — A: single-column card stack | — | Draft | Not started | Direction locked in DESIGN-HEURISTICS; no comp or code yet |

## Rules

### When you change code
1. Update the design comp if the change is material (layout, structure, content).
2. Update sync state in the artifact index above.
3. If you skip the design update, mark as "Out of sync".

### When you change design
1. Frame name must follow the naming convention above.
2. Add or update the artifact index row with the frame ID.
3. Note whether code needs updating, and update sync state.
