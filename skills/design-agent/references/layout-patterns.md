# Layout Patterns Reference

Adapted from page-design-guide-mcp (chihebnabil) and impeccable's spatial-design reference. Select patterns that fit the content type and the project's design language.

## Page-level Patterns

### F-Pattern
**Best for:** Text-heavy pages, article indexes, dashboards.
- Users scan horizontally across the top, then drop down and scan a shorter horizontal line, then scan vertically down the left side.
- Place the most important content in the first horizontal scan (hero/headline).
- Place navigation or secondary content along the left vertical.
- Critical content should never live in the bottom-right — it gets the least attention.

### Z-Pattern
**Best for:** Landing pages, simple marketing pages, pages with one CTA.
- Top-left → top-right → diagonal to bottom-left → bottom-right.
- Place logo/brand top-left, nav top-right, key message in the diagonal, CTA bottom-right.
- Works best with minimal content; breaks down with dense layouts.

### Single Column
**Best for:** Articles, blog posts, focused reading experiences.
- Max width 680-720px for body text readability (45-75 characters).
- Generous margins. Section breaks via whitespace (80-120px), horizontal rules, or full-width elements.
- One idea per scroll. Don't pack multiple concepts into one viewport.

### Split Screen
**Best for:** Comparison layouts, preview + list, hero + feature.
- One column dominates (60-70%), the other supports.
- On mobile, columns stack — the column with context/preview typically goes first.
- Clear visual separation between panels (background color, border, or spacing).

### Card Grid
**Best for:** Feature showcases, team pages, product listings.
- 3-4 columns desktop, 2 tablet, 1 mobile. Gap: 16-24px.
- All cards share the same structure. Hover states consistent across all cards.
- Limit to 6-9 cards per section. More than that needs filtering or pagination.

### Bento Grid
**Best for:** Dashboard-style home pages, feature showcases, portfolio displays.
- Mix tile sizes: 1x1, 2x1, 1x2, 2x2. Feature important content in larger tiles.
- **Visual rhythm through size variation** — not all tiles the same size. The mix creates energy.
- Column-dense packing. Each tile has a clear type (text, stat, list, card/link, accent).
- Asymmetrical CSS Grid. 1px borders or subtle gaps between tiles.
- Max 12px border-radius. 24-40px internal padding.

### Hero + Sections
**Best for:** Marketing pages, product pages, long-form storytelling.
- Full-width hero with one strong headline (3-6rem), one supporting line, optional CTA.
- Sections alternate between full-width and contained (max-width) layouts.
- Each section has its own visual identity but shares the token system.

---

## Section-level Guidance

Adapted from page-design-guide-mcp's 2026-style section specs:

### Header
- Height: ~72px desktop. Sticky with `backdrop-blur-lg`.
- Logo/brand left, navigation right. Current page indicator (underline, weight, or color).
- Should be findable but quiet — never competes with page content.

### Hero
- One headline. It should be the largest text on the page.
- If using a background image or gradient, ensure text contrast meets WCAG AA.
- Gradient text (via `bg-clip-text`) is a current trend but reduces readability — use sparingly.
- CTA should be the single most obvious action on the page.

### Features
- Max 6-9 features per section. More than that needs grouping or a different pattern.
- Bento variant: mixed-size cards in a grid. Standard variant: alternating left/right.
- Each feature gets one icon/visual, one headline, one short description.

### Testimonials
- Layouts: masonry, marquee scroll, or featured + grid.
- Attribution always visible (name, role, company, optional photo).
- Max 3-5 visible at once. More can be in a carousel or "show more."

### FAQ
- Accordion pattern. Max-width ~64rem (1024px) for readability.
- Questions as bold text. Answers revealed on click/tap.
- Group by category if more than 8 questions.

### Footer
- Grid: 4 columns desktop, stacked mobile.
- Include: navigation links, legal (privacy/terms), copyright, optional newsletter signup.
- Minimal variant: one line (copyright, one link, one personality line).

---

## Responsive Adaptation

1. **Columns reduce.** 4 → 2 → 1. Never jump from 4 directly to 1 without an intermediate.
2. **Hierarchy sharpens.** On mobile, only one element dominates per viewport.
3. **Horizontal becomes vertical.** Side-by-side layouts stack. More important element goes first.
4. **Touch targets grow.** Interactive elements ≥ 44px on mobile.
5. **Whitespace compresses proportionally.** Don't eliminate whitespace — reduce it. Breathing room still matters at every size.
6. **Content-driven breakpoints.** Break where the layout breaks, not at arbitrary device widths.
7. **Input method awareness.** Hover states only on devices that support hover: `@media (hover: hover)`.

---

## Three Layout Approaches (from impeccable)

For projects with higher DESIGN_VARIANCE:

1. **Asymmetrical Bento** — Mixed-size tiles in a CSS Grid. Visual rhythm through size variation. No two adjacent tiles the same size.
2. **Z-Axis Cascade** — Overlapping elements with subtle z-index layering. Cards or images that peek behind others. Creates depth without 3D.
3. **Editorial Split** — Dramatic typography on one side, supporting content on the other. The type IS the visual. Works for portfolio and landing pages.
