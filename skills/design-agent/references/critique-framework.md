# Design Critique Framework

Structured evaluation for design variants. Adapted from impeccable (open-horizon-labs) and design-critique-mcp (haasonsaas). Run every dimension on each variant. Surface all signals — do not resolve conflicts.

## Output format

For each variant, produce:

1. **Anti-Patterns Verdict** — PASS or FAIL (this is the gate; if FAIL, variant needs rework)
2. **Overall Impression** — 2-3 sentences on the dominant feeling
3. **What's Working** — 2-3 specific things that are strong
4. **Priority Issues** — 3-5 issues, each with:
   - **What:** The specific problem
   - **Why:** Why it matters
   - **Fix:** Concrete suggestion
5. **Minor Observations** — Things to consider but not blocking
6. **Questions for the Human** — Ambiguities only the human can resolve

---

## Dimension 1: AI Slop Detection (CRITICAL — evaluate first)

This is the most important check. If a variant looks AI-generated, everything else is moot.

**The test:** "If you showed this to someone and said 'AI made this,' would they believe you immediately? If yes, that's the problem."

**Fingerprints of AI-generated work:**
- Purple/blue gradient on white background
- Inter, Roboto, or system fonts as display type
- Everything centered with identical spacing
- Three equal cards in a row (the most generic AI layout)
- Neon glows, gratuitous glassmorphism
- Pure black (#000000) — real designers use near-blacks (#111111, #1a1a1a)
- Oversized H1s with no typographic subtlety
- Generic stock-photo aesthetic
- AI copywriting cliches ("Unleash", "Elevate", "Seamlessly")
- Custom cursors, decorative blobs without purpose
- "Organic" percentages replaced with round numbers (47.2% feels real, 50% feels fake)

**Verdict:** If 3+ fingerprints are present → FAIL. Rework before evaluating other dimensions.

---

## Dimension 2: Visual Hierarchy

- Is there exactly one dominant element per viewport?
- Does size create hierarchy? (Primary should be 2-3x larger than secondary)
- Does color saturation reinforce hierarchy? (Most important = most saturated)
- Does position follow natural scan patterns? (Top-left = highest priority in LTR)
- Are there competing focal points? (If two elements fight for attention, one must be demoted)

---

## Dimension 3: Composition & Balance

Adapted from design-critique-mcp's composition analyzer:

- **Grid alignment:** Do elements snap to a consistent grid? Are spacings consistent (std deviation < 30% of average)?
- **Visual weight distribution:** Compare left/right halves. Is the balance symmetric, asymmetric-with-intention, or accidental?
- **Spacing consistency:** Is whitespace ratio between 30-80%? (Below = cramped, above = empty)
- **Rule of thirds:** Do key elements align with intersection points of a 3x3 grid?
- **Proportion:** Do element sizes relate to each other through a clear scale (type scale, spacing scale, golden ratio)?

---

## Dimension 4: Typography as Communication

Adapted from design-critique-mcp's typography analyzer and impeccable's typography reference:

- **Type scale:** Do sizes follow the project's defined scale? Maximum 5 distinct sizes.
- **Weight contrast:** Clear jump between heading (600+) and body (400). If H3 looks like large body text, hierarchy is broken.
- **Line height as base unit:** Line-height should drive all vertical spacing (multiples of line-height for margins/padding).
- **Character measure:** Body text between 45-75 characters per line. Headlines can be wider.
- **Font loading:** Are custom fonts specified? Would a fallback be obvious? (No Inter/Roboto as display type)
- **OpenType features:** Are available features used? (Tabular numbers for data, proper fractions, etc.)

---

## Dimension 5: Color with Purpose

Adapted from design-critique-mcp's color analyzer:

- **Harmony:** Does the palette follow a recognizable scheme? (Complementary, analogous, triadic, split-complementary)
- **60-30-10 rule:** ~60% dominant background, ~30% secondary, ~10% accent. If accent exceeds 10%, it stops being an accent.
- **Tinted neutrals:** Pure gray (#808080) is dead. Neutrals should have a slight warm or cool tint that matches the palette.
- **Semantic compliance:** Do colors match their defined roles in the token system? Rest colors at rest, interaction colors only on interaction.
- **WCAG contrast:** Body text ≥ 4.5:1 (AA), large text ≥ 3:1. AAA (7:1) preferred for body.
- **Color blindness safety:** Key information must be distinguishable under protanopia, deuteranopia, and tritanopia. deltaE > 10 between meaningful colors.

---

## Dimension 6: Information Architecture

- Does the page structure match the content type? (Editorial content → single column, comparison → cards/table, overview → bento)
- Is navigation findable but quiet? (Nav should not compete with content)
- Can the user answer "where am I?" and "what can I do?" within 3 seconds?
- Are related items grouped by proximity? Unrelated items separated by whitespace?

---

## Dimension 7: Emotional Resonance

- Does the design evoke the intended feeling from BRIEF-AND-DIRECTION?
- Does the resting state feel appropriate to the project's personality? (Calm? Sharp? Warm? Playful?)
- Is there a moment of delight or surprise without being gimmicky?
- Would the target audience (from the brief) feel this was made for them?

---

## Dimension 8: Interaction States & Affordances

Adapted from impeccable's interaction-design reference:

- **Eight states accounted for:** Default, hover, focus, active, disabled, loading, error, success. Not all apply to every element, but interactive elements need at least default + hover + focus.
- **Focus-visible:** Keyboard focus rings present and styled (never removed for aesthetics).
- **Hover doesn't shift layout:** Hover changes appearance (color, shadow, border) not size or position.
- **Touch targets:** ≥ 44px on mobile breakpoints.
- **Affordance clarity:** Interactive elements look interactive. Non-interactive elements don't look clickable.

---

## Dimension 9: Spacing & Spatial Design

Adapted from impeccable's spatial-design reference:

- **Base unit:** 4pt base (not 8pt). Semantic token naming for spacing (compact, normal, spacious — not px values).
- **Section spacing:** 80-120px between major sections. Scale: 8/16/24/32/48/64/96px.
- **The Squint Test:** Blur your eyes and look at the layout. Can you still see the hierarchy? If everything blurs into a uniform mass, spacing isn't creating structure.
- **Cards are not required.** Not every content block needs a card wrapper. Whitespace and typography can create grouping without borders.
- **Optical adjustments:** Mathematical centering isn't always visual centering. Text with ascenders/descenders may need optical correction.

---

## Dimension 10: Responsiveness

- Does the layout adapt at each defined breakpoint as a **distinct mode** (not gradual scaling)?
- Are breakpoints content-driven (where the layout breaks) not device-driven (arbitrary px values)?
- Does the mobile version prioritize content hierarchy over desktop layout preservation?
- Are safe areas respected? (`env(safe-area-inset-*)` for notched devices)
- Input method detection: hover states only apply on devices that support hover (`@media (hover: hover)`).
