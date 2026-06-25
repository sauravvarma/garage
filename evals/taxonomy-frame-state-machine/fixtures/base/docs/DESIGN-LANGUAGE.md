# Design language

## Typography

Single sans-serif system stack. Two roles only: body copy and a large display size reserved for the streak count (the one number that should dominate a card). Fixed scale — no fluid type. Specific sizes live in DESIGN-TOKENS.

## Color strategy

Dark-only palette, one warm accent (flame orange) carrying both brand and primary action. Semantic split is strict: accent is rest/interaction for the primary CTA and the streak flame; success and danger are reserved for completion and broken-streak affordances and never borrow the accent. Actual hex values live in DESIGN-TOKENS.

## Layout principles

One habit per card; cards stack vertically in a single column. No grid system — content is a single padded column capped at a max width. Spacing uses a 4px-based scale.

### Target layout strategy
mobile-only
<!-- DEFAULT for this codebase. One of: responsive | desktop-only | mobile-only.
     Determines which viewports downstream skills (visual-qa, code-agent)
     capture screenshots at by default. Individual features can override this
     in their IDEAS doc when they target a different viewport set. -->

## Interaction philosophy

Motion is earned, not ambient. The only signature motion is the flame "pop" when a streak increments — the layout itself never animates. Transitions are triggered by user completion events, not by route changes or scroll.
