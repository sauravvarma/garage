# Design tokens

These are the source of truth for visual values. Exposed 1:1 as CSS custom properties in `src/app.css`. Components reference the CSS variable, never the raw value.

## Color

| Token | Light | Dark | CSS variable |
|-------|-------|------|--------------|
| surface | — | `#0f1115` | `--color-surface` |
| card | — | `#191c22` | `--color-card` |
| text | — | `#e8eaed` | `--color-text` |
| text-muted | — | `#9aa0a6` | `--color-text-muted` |
| accent (rest) | — | `#ff7a45` | `--color-accent` |
| accent (press) | — | `#e85f29` | `--color-accent-press` |
| success | — | `#3ecf8e` | `--color-success` |
| danger | — | `#ef5350` | `--color-danger` |

Dark-only product; no light theme shipped.

## Typography

| Token | Value | CSS variable |
|-------|-------|--------------|
| body | `15px` | `--font-size-body` |
| display (streak count) | `32px` | `--font-size-display` |

## Spacing

| Token | Value | CSS variable |
|-------|-------|--------------|
| space-1 | `4px` | `--space-1` |
| space-2 | `8px` | `--space-2` |
| space-3 | `16px` | `--space-3` |
| space-4 | `24px` | `--space-4` |

## Radius

| Token | Value | CSS variable |
|-------|-------|--------------|
| card | `12px` | `--radius-card` |

## Shadows

None — flat surfaces, differentiated by `--color-card` against `--color-surface`.

## Motion

| Token | Value | CSS variable |
|-------|-------|--------------|
| flame-pop | `180ms ease-out` | `--motion-flame` |

## Grid

Single-column, mobile-only. No multi-column system.

| Token | Value | Meaning |
|-------|-------|---------|
| content-width | `min(100vw - var(--space-3) * 2, 560px)` | max content column, padded each side |
