# Design Anti-patterns

Adapted from taste-skill (leonxlnx), impeccable (open-horizon-labs), and page-design-guide-mcp (chihebnabil). These are specific, battle-tested patterns that make designs look AI-generated or unintentional.

## AI Slop — the critical gate

**The test (from impeccable):** "If you showed this to someone and said 'AI made this,' would they believe you immediately? If yes, that's the problem."

If 3+ of these are present in a variant, it's a FAIL — rework before evaluating anything else.

### Visual fingerprints of AI-generated work

| Pattern | Why it's a tell | What to do instead |
|---------|----------------|-------------------|
| Purple/blue gradient on white | The single most common AI aesthetic | Use the project's defined palette. No gradients unless the design language calls for them. |
| Inter, Roboto, Arial as display font | These are body/system fonts, not personality fonts | Use distinctive display fonts: Geist, Outfit, Cabinet Grotesk, or the project's defined display family. |
| Everything centered | Feels like PowerPoint, not a designed page | Left-align as default. Center only headlines or single-line elements. |
| Three equal cards in a row | The most generic AI layout | Vary card sizes (bento), use asymmetric grids, or break the pattern with a featured card. |
| Pure black (#000000) | Real designers use near-blacks | Use #111111, #1a1a1a, or tinted darks that match the palette. |
| Neon glows without purpose | Decorative, not functional | Glow only on focus/active states, and only if the design language calls for it. |
| Gratuitous glassmorphism/blur | Overused AI trend | Blur only for functional overlays or transitions, not resting states. |
| Oversized H1 with no typographic subtlety | Big text ≠ good hierarchy | Use the type scale. Hierarchy comes from size + weight + color + spacing together. |
| Round percentages (50%, 100%, 200%) | Feels artificial | Use organic numbers (47.2%, 98.6%, 214%) — they feel measured, not made up. |
| Custom cursors | Almost never adds value, often harms usability | Use system cursors. Pointer for links, default for everything else. |

### Copy fingerprints

| Pattern | Why it's a tell |
|---------|----------------|
| "Unleash", "Elevate", "Seamlessly", "Empower" | AI copywriting cliches |
| "We leverage cutting-edge technology" | Says nothing specific |
| "Your journey starts here" | Generic hero copy |
| Perfect symmetry in testimonials/stats | Real data is messy |

---

## Layout anti-patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Symmetry everywhere | Static, lifeless, feels generated | Intentional asymmetry creates energy and guides the eye |
| Same spacing everywhere | No hierarchy — everything feels equally important | Larger gaps between groups, smaller within groups |
| Full-width elements that don't need it | Text becomes unreadable, layout loses structure | Constrain to max-width (680-720px for text, project-defined for cards) |
| Orphan elements | Single item alone at bottom of a grid row | Fill the row, give the orphan intentional prominence, or restructure |
| Nav competing with content | Navigation draws more attention than the page | Nav should be findable but quiet |
| Auto-playing carousels | Users don't interact with them; content gets missed | Static grid or user-controlled tabs |
| Hamburger menu on desktop | Hides navigation that has room to be visible | Show full nav on desktop; hamburger only on mobile |

---

## Typography anti-patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Too many font sizes | Hierarchy becomes noise | Max 5 sizes in the type scale |
| Heading sizes too close to body | H3 looks like large body text | Ensure substantial contrast between levels (at least 1.25x ratio) |
| All caps body text | Hard to read beyond 2-3 lines | All caps only for labels, badges, short metadata |
| Italic for emphasis in UI | Italic is for editorial tone, not emphasis | Use font-weight for emphasis |
| Serif in dashboards/data interfaces | Serifs are for editorial/reading, not UI | Sans-serif for interfaces; serif for long-form reading |
| Text below 16px for body | Unreadable on mobile | 16px minimum for body text, 14px minimum for secondary |
| Justified text on the web | Uneven word spacing | Left-align body text |
| Centered body text (>3 lines) | Hard to track line starts | Center headlines only; left-align paragraphs |

---

## Color anti-patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Blue as the only accent | Most common AI default | Use the project's defined accent |
| More than 3 hues | Visual noise without clear hierarchy | 60-30-10 rule: dominant + secondary + accent |
| Color as the only differentiator | Fails for color-blind users (~8% of men) | Pair color with shape, size, icon, or text |
| Accent color at rest | If accent is for interaction, using it at rest dilutes its meaning | Reserve accent for hover/focus/active only |
| Pure gray neutrals | Feels lifeless and institutional | Tint neutrals warm or cool to match the palette |
| Dark mode as inverted light mode | Looks wrong — different surfaces need different treatment | Design dark mode separately with its own token set |

---

## Interaction anti-patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Everything animates | Nothing is emphasized when everything moves | Motion should be purposeful — one bold move, not twenty subtle ones |
| Hover changes layout | Content shifts, breaks reading flow | Hover changes appearance (color, shadow, opacity) not size or position |
| Focus rings removed | Accessibility failure, keyboard users can't navigate | Style focus rings to fit the design — `focus-visible` for keyboard only |
| Transitions too slow | Hover > 200ms feels sluggish, page > 500ms feels broken | Hover: 150-200ms. Page transitions: 300-500ms. |
| Drop shadows without purpose | Decorative noise | Shadows indicate elevation. If it's not elevated, no shadow. |
| Hover on elements that aren't clickable | Confusing affordance — looks clickable but isn't | Only apply hover effects to interactive elements |
| Loading spinners instead of skeletons | Feels slower, provides no content preview | Skeleton screens that match the final layout shape |

---

## Outdated patterns (2026)

From page-design-guide-mcp:

| Pattern | Status |
|---------|--------|
| Flat design without depth | Outdated — use subtle shadows and layering |
| Skeuomorphism | Dead — no fake leather or paper textures |
| Page-load popups | Hostile UX — never |
| Auto-play video with sound | Hostile UX — never |
| Stock office photos | Use illustrations, abstract shapes, or no imagery |
| Social media icon walls | One line of icons in the footer, not a section |
