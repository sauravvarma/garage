# Design tokens

## Color
| Token | Light | Dark | CSS variable |
|-------|-------|------|--------------|
| <!-- e.g. surface --> | <!-- #hex --> | <!-- #hex --> | <!-- --token-name --> |

## Typography
| Token | Value | CSS variable |
|-------|-------|--------------|
| <!-- e.g. heading-font --> | <!-- font stack --> | <!-- --token-name --> |

## Spacing
| Token | Value | CSS variable |
|-------|-------|--------------|

## Radius
| Token | Value | CSS variable |
|-------|-------|--------------|

## Shadows
| Token | Value | CSS variable |
|-------|-------|--------------|

## Motion
| Token | Value | CSS variable |
|-------|-------|--------------|

## Grid
<!--
Document the column / layout grid as a formula, not a snapshot. If the project doesn't have
a column system, delete this section.

Capture (fill in or remove rows that don't apply):
- Max content width (e.g. 1440px, 1280px, none/full-bleed)
- Outer padding / safe gutters (each side)
- Inter-column gap
- Number of columns
- The derived per-column width formula
- Whether there's a per-column margin separate from the inter-column gap

The formula matters more than the result. A reader should be able to recompute column widths
at any viewport from the formula — a hardcoded "36px per column" rots the moment the max-width
or padding changes.
-->

| Token | Value | Meaning |
|-------|-------|---------|
| <!-- e.g. $col --> | <!-- formula like calc(min(100vw, MAX) - PAD*2 - GAP*(N-1)) / N --> | <!-- one column width --> |
| <!-- e.g. $col-N --> | <!-- formula in terms of $col and gap --> | <!-- N-column span --> |
| <!-- gutter --> | <!-- e.g. 6px --> | <!-- per-column margin, if any --> |
| <!-- gap --> | <!-- e.g. 12px --> | <!-- gap between adjacent columns --> |
