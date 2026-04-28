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

All frames in Pencil .pen files follow this naming scheme. The bracket prefix is the taxonomy lifecycle label — it is the **single source of truth** for what stage a frame is in.

### Format

```
[label] Artifact Name — Letter: Short Description
```

- **`[label]`** — One of: `[draft]`, `[variant]`, `[final]`, `[deprecated]`
- **Artifact Name** — Stable concept identity (never changes across lifecycle)
- **Letter** — `A`, `B`, `C` etc. (only when comparing variants)
- **Short Description** — The spatial/layout concept (not generic like "option 1")

### Sub-component nesting

Append `> Region > Element` for sub-components:

```
[final] Hero Section — A: Side-by-side > Headline
[variant] Pricing Page — B: Master-detail > Sidebar > Tab Bar
```

### Proposal groups

When exploring variants, wrap them in a proposal group frame:

```
[proposal] Hero Section Widget — 2026-04-14
  [variant] Hero Section — A: Side-by-side
  [variant] Hero Section — B: Centered Hero
  [variant] Hero Section — C: Compact Card
```

### Lifecycle transitions

The bracket label changes when the lifecycle changes. The name stays stable.

**Exploration → Approval:**
```
[proposal] Hero Section Widget — 2026-04-14
  [final] Hero Section — A: Side-by-side
  [deprecated] Hero Section — B: Centered Hero
  [deprecated] Hero Section — C: Compact Card
```

**Iteration on approved design:**
```
[final] Hero Section — A: Side-by-side
[draft] Hero Section — A: Side-by-side v2
```

### Label text nodes

Follow `label/` prefix with the same naming:
```
label/ [variant] Hero Section — A: Side-by-side
```

### Rules

1. **Label always leads** — scannable in layer panels, instant lifecycle context
2. **Label changes, name doesn't** — rename only the bracket prefix on promotion/deprecation
3. **Every `[variant]` or `[final]` frame gets a row in the artifact index below**
4. **No unnamed frames** — delete default/empty frames created by `open_document`
5. **Proposal groups are date-stamped** — so you know when the exploration happened

## Artifact index

| Artifact | ID/Frame | Label | Sync state | Notes |
|----------|----------|-------|------------|-------|
| <!-- e.g. [final] Home Page — A: Bento Grid --> | <!-- frame ID --> | <!-- Final --> | <!-- Synced --> | |

## Rules

### When you change code
1. Update the design comp if the change is material (layout, structure, content).
2. Update sync state in the artifact index above.
3. If you skip the design update, mark as "Out of sync".

### When you change design
1. Frame name must follow the naming convention above.
2. Add or update the artifact index row with the frame ID.
3. Note whether code needs updating.
4. Update sync state accordingly.
