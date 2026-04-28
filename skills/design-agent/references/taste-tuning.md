# Taste Tuning

Configurable parameters that shape the design agent's aesthetic direction. Adapted from taste-skill (leonxlnx) and impeccable (open-horizon-labs).

Read from the project's `docs/DESIGN-HEURISTICS.md` if it exists. If it doesn't, use defaults below. State active settings before generating variants.

## Parameters

### DESIGN_VARIANCE (1-10)
**Default:** 5
How far the design deviates from conventional patterns.
- **1-3:** Safe, conventional layouts. Standard card grids, symmetric spacing, predictable hierarchy. Good for enterprise, dashboards.
- **4-6:** Balanced. Mostly conventional with intentional moments of interest. Asymmetric grids, varied section layouts. Good for portfolios, product sites.
- **7-8:** Distinctive. Asymmetrical bento, overlapping elements, editorial splits, unexpected type treatment. Good for creative portfolios, agencies.
- **9-10:** Experimental. Break conventions intentionally. Z-axis layering, dramatic whitespace, type-as-visual. Only for projects that explicitly want this.

**Rule from taste-skill:** When variance > 4, ban centered heroes. Push toward asymmetric layouts.

### MOTION_INTENSITY (1-10)
**Default:** 3
How much motion and animation is used.
- **1-2:** No animation. Static layouts only. Hover color changes, focus rings — nothing more.
- **3-4:** Micro-interactions only. Hover states with 150-200ms transitions. Focus rings. Subtle feedback.
- **5-6:** Section-level motion. Elements fade/slide in on scroll (IntersectionObserver). Staggered reveals: `delay = index × 80ms`. Spring physics: stiffness 100, damping 20.
- **7-8:** Page transitions. Full-screen transitions between routes. Motion blur on navigation. Scale + fade between pages.
- **9-10:** Cinematic. Dramatic entrances, parallax, 3D transforms. Only for statement sites.

**Motion physics (from taste-skill):**
- Duration rule: micro 100ms, small 200ms, medium 300ms, large 500ms
- Recommended easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-quart)
- Only animate `transform` and `opacity` — never layout properties
- Grain/noise on `position: fixed` pseudo-elements (avoids repaints)
- `prefers-reduced-motion` is **mandatory** — 35% of adults over 40 are affected

### TYPE_CONTRAST (1-10)
**Default:** 5
The ratio between heading and body typography.
- **1-3:** Subtle. Small size jumps, similar weights. Quiet hierarchy. For minimal or data-heavy interfaces.
- **4-6:** Clear. Obvious size and weight jumps. Headings feel like headings. The default for most projects.
- **7-8:** Dramatic. Headlines dominate the viewport. Large type scale ratio. Display fonts at 4-6rem. For editorial or statement designs.
- **9-10:** Type-as-visual. Headlines become the primary visual element via `clamp(4rem, 10vw, 15rem)`. For brutalist or high-impact designs.

**Typography rules (from impeccable + taste-skill):**
- Line-height is the base unit for all vertical spacing
- 5-size font scale with substantial contrast between levels
- Character measure: 45-75ch for body
- Tighten letter-spacing on large headlines (-0.02em to -0.04em)
- Body text: never pure black — use #111111 or project's tinted dark
- Fluid type via `clamp()` for marketing, fixed `rem` for apps

### COLOR_ECONOMY (1-10)
**Default:** 3
How many colors are in play.
- **1-2:** Monochrome. One hue plus tinted neutrals. Accent is the same hue at a different saturation.
- **3-4:** Restrained. Two hues maximum (e.g., warm neutrals + one accent). The 60-30-10 rule.
- **5-6:** Balanced. Three intentional hues. Each has a clear semantic role.
- **7-8:** Expressive. Multiple hues with purpose. For brand-heavy or playful designs.
- **9-10:** Bold. Full palette. Only for projects that explicitly want color as a primary design element.

**Color rules (from impeccable + taste-skill):**
- Tinted neutrals — pure gray is dead. Warm or cool tint matching the palette.
- OKLCH color space for perceptually uniform manipulation
- Alpha (opacity) as a design smell — if you're using rgba extensively, the palette needs work
- Dark mode is a separate design system, not inverted light mode

### GRID_DENSITY (1-10)
**Default:** 5
How much content per viewport.
- **1-3:** Sparse. Few elements per viewport. One idea per screen. For storytelling, luxury, landing pages.
- **4-6:** Balanced. Moderate content density. Cards, lists, sections without crowding.
- **7-8:** Dense. Maximum useful information per viewport. Bento grids, dashboards.
- **9-10:** Packed. Data-heavy interfaces, admin panels. Every pixel earns its place.

**Spatial rules (from impeccable):**
- 4pt base unit (not 8pt)
- Spacing scale: 8/16/24/32/48/64/96px
- Section spacing: 80-120px between major sections
- The Squint Test: blur your eyes — can you still see the hierarchy?
- Container queries over viewport queries where possible
- 44px minimum touch targets

### PERSONALITY
**Values:** neutral | warm | sharp | playful
**Default:** neutral

- **neutral:** Clean, professional. No particular voice. System fonts are acceptable for body.
- **warm:** Approachable, human, slightly informal. Rounded corners (8-12px), softer colors, generous spacing. Sentence case, conversational labels.
- **sharp:** Precise, technical, confident. Tight grid, bold type, high contrast. Swiss-style alignment. Monospace for labels/meta.
- **playful:** Energetic, creative, unexpected. Asymmetry, color, motion. Hand-drawn elements, organic shapes.

---

## Texture Profiles (from impeccable)

For projects with DESIGN_VARIANCE ≥ 6, consider applying a texture profile:

### Ethereal Glass
**Best for:** Tech, SaaS, developer tools.
- Frosted glass surfaces with `backdrop-blur`
- Light, airy spacing
- Monochrome + one accent
- Subtle depth through layering

### Editorial Luxury
**Best for:** Lifestyle, premium brands, portfolios.
- Strong serif headlines
- High-contrast black/white with one warm accent
- Generous whitespace (GRID_DENSITY 1-3 / sparse)
- Photography or illustration as primary visual

### Soft Structuralism
**Best for:** Consumer products, fintech, health.
- Rounded containers with subtle shadows
- Warm neutrals (cream, stone, sand)
- Friendly sans-serif type
- Card-based layouts with generous padding

---

## Label-to-range mapping

DESIGN-HEURISTICS.md uses human-readable labels. The agent maps them to numeric operating ranges when generating and critiquing variants.

| Parameter | Label | Range | Description |
|-----------|-------|-------|-------------|
| DESIGN_VARIANCE | safe | 1-3 | Conventional layouts, symmetric, predictable |
| | balanced | 4-6 | Mostly conventional with intentional moments of interest |
| | distinctive | 7-8 | Asymmetric bento, editorial splits, unexpected type |
| | experimental | 9-10 | Break conventions intentionally |
| MOTION_INTENSITY | none | 1-2 | Static only, hover color changes and focus rings |
| | micro-only | 3-4 | Hover transitions 150-200ms, subtle feedback |
| | sectional | 5-6 | Scroll-triggered reveals, staggered entrances |
| | page-level | 7-8 | Full-screen route transitions, motion blur |
| | cinematic | 9-10 | Parallax, 3D transforms, dramatic entrances |
| TYPE_CONTRAST | subtle | 1-3 | Small size jumps, similar weights, quiet |
| | clear | 4-6 | Obvious size/weight jumps, headings feel like headings |
| | dramatic | 7-8 | Headlines dominate viewport, large type scale |
| | type-as-visual | 9-10 | Headlines ARE the visual element |
| COLOR_ECONOMY | monochrome | 1-2 | One hue plus tinted neutrals |
| | restrained | 3-4 | Two hues max, 60-30-10 rule |
| | balanced | 5-6 | Three intentional hues with semantic roles |
| | expressive | 7-8 | Multiple hues with purpose |
| | bold | 9-10 | Full palette, color as primary element |
| GRID_DENSITY | sparse | 1-3 | Few elements per viewport, generous whitespace |
| | balanced | 4-6 | Moderate density, cards/lists without crowding |
| | dense | 7-8 | Maximum useful info per viewport, bento grids |
| | packed | 9-10 | Data-heavy, every pixel earns its place |
| PERSONALITY | neutral | — | Clean, professional, no particular voice |
| | warm | — | Approachable, rounded, generous spacing |
| | sharp | — | Precise, tight grid, high contrast |
| | playful | — | Asymmetry, color, motion, organic shapes |

When the heuristics doc says `GRID_DENSITY: sparse (1-3)`, the agent works within that range — picking exact values per variant to give meaningful choices (e.g., variant A at 2, variant B at 3).

When the "Push It Further" variant increases DESIGN_VARIANCE by +3, it bumps from the midpoint of the current range.

---

## How the agent uses these

1. **Read `docs/DESIGN-HEURISTICS.md`** — if it exists, it overrides defaults with project-specific values. Map text labels to numeric ranges using the table above.
2. **If no heuristics doc exists**, use defaults: DESIGN_VARIANCE balanced (4-6), MOTION_INTENSITY micro-only (3-4), TYPE_CONTRAST clear (4-6), COLOR_ECONOMY restrained (3-4), GRID_DENSITY balanced (4-6), PERSONALITY neutral.
3. **State active settings** before generating: "Designing with: DESIGN_VARIANCE balanced (4-6), MOTION_INTENSITY micro-only (3-4), TYPE_CONTRAST clear (4-6), COLOR_ECONOMY restrained (3-4), GRID_DENSITY balanced (4-6), PERSONALITY warm."
4. **Variants explore different settings.** E.g., Variant A at project defaults, Variant B pushes DESIGN_VARIANCE to distinctive (7-8), Variant C tries TYPE_CONTRAST at dramatic (7-8). This gives meaningful choices, not just layout rearrangements.
5. **Critique evaluates against settings.** If MOTION_INTENSITY is micro-only (3-4) but the variant has scroll-triggered animations, flag as inconsistent. If COLOR_ECONOMY is restrained (3-4) but the variant uses 4 hues, flag as exceeding budget.
