# Exploration Techniques

Methods for divergent creative work. These techniques fight the regression-to-mean that makes AI design outputs feel generic.

---

## Technique 1: Sensory Metaphor Prompting

Instead of describing components, describe the feeling of the space.

### How it works

Replace component language with spatial, sensory, and emotional language:

| Instead of | Try |
|-----------|-----|
| "A hero section with a headline" | "The first thing you feel when the page loads is weight — a confident presence that doesn't need to shout" |
| "A card grid for projects" | "Projects arranged like specimens in a collector's cabinet — each precious, deliberately placed" |
| "A minimal contact page" | "A quiet room with one chair and a window. Everything says: sit down, let's talk" |
| "A blog listing page" | "A bookshelf where you can tell which books are well-loved by their worn spines" |

### Vocabulary by dimension

**Weight:** heavy, light, anchored, floating, grounded, airy, dense, sparse
**Temperature:** warm, cool, cold, heated, ambient, clinical, cozy
**Texture:** smooth, rough, polished, raw, woven, crisp, soft, grainy
**Rhythm:** steady, syncopated, flowing, staccato, breathing, pulsing
**Light:** bright, dim, glowing, shadowed, diffused, focused, ambient
**Scale:** intimate, vast, monumental, compressed, expansive, tight

### The translation step

After generating the sensory description, translate each quality into a design decision:

- "Heavy" → large type, dark backgrounds, thick borders, minimal whitespace
- "Warm" → cream/amber palette, rounded forms, generous padding, humanist type
- "Syncopated rhythm" → varied section heights, alternating layouts, unexpected breaks

---

## Technique 2: Genre Subversion

Name a genre, then contradict one of its core properties. The contradiction creates originality.

### Pattern

"[Genre] but [contradiction]"

### Examples

| Genre + contradiction | What it produces |
|----------------------|-----------------|
| "Brutalist but warm" | Raw structural grid, visible borders — but cream palette, rounded type, generous padding |
| "Swiss precision but chaotic content" | Strict grid with mathematical proportions — but content that overflows, overlaps, breaks the grid intentionally |
| "Japanese minimalism but information-dense" | Extreme whitespace philosophy — but each element carries maximum information in minimum space |
| "Editorial magazine but no images" | Dramatic type compositions, pull quotes, varied column widths — but typography is the ONLY visual element |
| "Dashboard but beautiful" | Data density and utility — but crafted typography, considered color, and moments of delight |
| "Art Deco but digital-native" | Geometric ornament and luxury materials — but implemented with CSS Grid, variable fonts, and responsive behavior |

### Why it works

Each genre has strong expectations. Fulfilling expectations produces recognition but not interest. Breaking ONE expectation while fulfilling the rest creates tension — and tension is what makes design memorable.

### Rules

- Subvert only ONE property at a time. Two subversions create confusion, not tension.
- The subversion should be in the *surface quality*, not the *structural principle*. Keep the spatial logic of the genre; change its material quality.
- Name the tension explicitly: "The tension here is: Swiss structure holds messy, human content."

---

## Technique 3: Anti-Example Driven Exploration

Close off the obvious to force the model into less-traveled territory.

### How it works

1. **Catalog the anti-examples:** List everything the user doesn't want. Be specific.
2. **Identify what each anti-example was solving:** Every common pattern exists because it solves a problem. Name the problem.
3. **Find alternative solutions:** Solve the same problems without the banned patterns.

### Example

User: "NOT a typical SaaS landing page"

**Catalog:**
- No centered hero
- No three-feature cards
- No gradient backgrounds
- No "Start free trial" CTA
- No testimonial carousel

**What each solves:**
- Centered hero → establishes brand and value prop immediately
- Three-feature cards → communicates key differentiators
- Gradient backgrounds → creates visual interest on text-heavy pages
- CTA → drives conversion
- Testimonial carousel → builds trust

**Alternatives:**
- Value prop → asymmetric split with type-dominant left panel
- Key differentiators → single scrolling narrative that unfolds each benefit
- Visual interest → texture, photography, typographic treatment
- Conversion → persistent sidebar or bottom bar (not hero-level)
- Trust → inline quotes within the narrative, not a separate section

### The expanding anti-example list

Start every exploration with the AI slop anti-examples as baseline closures:
- No purple/blue gradients on white
- No Inter/Roboto as display type
- No everything-centered
- No three equal cards in a row
- No pure black
- No neon glows
- No oversized H1 without typographic subtlety
- No generic stock-photo aesthetic

Then add the user's specific anti-examples on top. This stack gets carried through the entire session.

---

## Technique 4: Sequential Decomposition

Don't design everything at once. Work through one dimension at a time, each building on the last.

### The sequence

**Round 1: Spatial composition only**
- No color, no type choices, no content
- Just rectangles, shapes, and proportions
- "Where does the eye go? Where is the weight? Where is the breathing room?"
- Generate 3-4 compositions as abstract layouts

**Round 2: Typography layer**
- Pick the strongest composition from Round 1
- Add type decisions: scale, weight, families, measure
- "Does the type reinforce the hierarchy the composition established?"
- No color yet — work in grayscale

**Round 3: Color layer**
- Pick the strongest type treatment from Round 2
- Add color: palette, application, semantic roles
- "Does color reinforce or fight the hierarchy?"
- This is where the design becomes emotionally specific

**Round 4: Motion and interaction layer**
- Pick the strongest color treatment from Round 3
- Add: hover states, transitions, scroll behavior
- "Does motion add meaning or just decoration?"

### Why it works

Each dimension gets full creative attention. When you design everything at once, the easiest dimension (usually color) dominates and the hardest (usually spatial composition) gets shortchanged. Sequential work forces composition to be right before anything else layers on.

### When to skip

- If the user already has a strong composition idea, skip to Round 2
- If the design system locks color and type, jump straight to composition
- If this is an iteration (not fresh exploration), work the specific dimension that needs change

---

## Technique 5: The "Make It Uncomfortable" Follow-Up

After generating safe concepts, deliberately push past comfort.

### How it works

Take the strongest concept from a round and ask:
- "What would make a traditional UX designer uncomfortable about this — but a graphic designer excited?"
- "Where is this concept playing it safe? Push that specific element 3x further."
- "What would this look like if it were designed by [specific provocative designer] instead of a committee?"

### Provocative reframes

| Safe version | Uncomfortable push |
|-------------|-------------------|
| "Generous whitespace" | "So much whitespace that the content feels like a whisper in a cathedral" |
| "Asymmetric layout" | "The layout is so asymmetric that the right half of the page is nearly empty — and that emptiness is the point" |
| "Bold headline" | "The headline is the entire viewport. You scroll past it like walking past a building-sized mural" |
| "Subtle animation" | "One element moves so slowly you're not sure it's moving — then after 30 seconds, you notice" |

### Rules

- Only push ONE element per uncomfortable version
- The push should feel intentional, not broken
- Present both the safe and uncomfortable versions — let the user calibrate

---

## Technique 6: Comparative Pairs

Present two opposing concepts and ask the user to react. Their reaction reveals preferences they can't articulate directly.

### Useful pairs

| Pair A | Pair B | What it reveals |
|--------|--------|----------------|
| "A library — books shelved, everything in its place" | "A studio — materials spread out, work in progress visible" | Order vs. creative energy |
| "A single spotlight on a dark stage" | "Morning light through a big window, everything visible" | Drama vs. accessibility |
| "A handwritten letter" | "A printed broadsheet" | Intimacy vs. authority |
| "A Japanese garden" | "A European formal garden" | Organic asymmetry vs. structured symmetry |
| "A tool that gets out of the way" | "A tool that teaches you as you use it" | Minimal vs. opinionated |

### How to use

- Present 2-3 pairs at the start of discovery
- The user doesn't have to pick one — "A bit of both" or "A for this section, B for that section" is useful signal
- Use their reactions to narrow down which design traditions and techniques to explore
- Revisit pairs when the user is stuck between two directions

---

## Technique 7: Constraint Stacking

Add constraints until creativity is forced.

### Starter constraints

Pick 3-5 from this list:
- Only one typeface (use weight and size for hierarchy)
- Only two colors (including one near-black or near-white)
- No images of any kind
- Maximum 3 elements per viewport
- No rounded corners
- No shadows
- No borders — only whitespace for separation
- All text left-aligned
- Content must work at 320px and 2560px without media queries
- Every interactive element must work with keyboard alone

### Why it works

Unconstrained prompts produce unconstrained (generic) results. Each constraint closes off a familiar path and forces invention. The best constraints remove the easiest solution to a common problem.

### The paradox

More constraints → more creative output. This is counterintuitive but consistent. A prompt with 5 constraints produces more original work than "design something beautiful."
