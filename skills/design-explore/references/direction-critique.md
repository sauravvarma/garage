# Direction Critique Framework

Lightweight critique for exploratory work. This is NOT the full 10-dimension production critique from `/design-agent`. Exploration critique asks different questions — it evaluates **potential and direction**, not **compliance and polish**.

---

## When to use

- Critiquing loose exploration concepts (not production variants)
- Evaluating external references (screenshots, competitor sites)
- Comparing directions to help the user choose
- Self-critiquing during the exploration process

---

## The six questions

For each concept or reference, answer these six questions:

### 1. What tradition is this drawing from?

Name it explicitly. Every design — intentionally or not — sits in a tradition. Naming it makes the conversation concrete.

- "This is drawing from Swiss/International Typographic Style — strict grid, asymmetric layout, type-dominant hierarchy."
- "This is generic SaaS — centered hero, card grid, blue accent. No identifiable tradition beyond 'what most websites look like.'"

If you can't name a tradition, it's probably generic. That's useful signal.

### 2. What's the signature move?

Identify the ONE design decision that defines this concept. If you removed it, would the concept collapse into something generic?

- "The signature move is the extreme type scale — the headline fills 60% of the viewport, everything else is quiet."
- "The signature move is the asymmetric split — content lives in the left 40%, the right 60% is breathing room."
- "There is no signature move — this concept doesn't have a defining characteristic."

No signature move = the concept needs more development or should be cut.

### 3. What's conventional about it?

Identify where the concept follows the most common path. This isn't necessarily bad — conventions exist for good reasons. But naming them prevents the illusion of originality.

- "The header is completely conventional — sticky, logo left, nav right. That's fine for this project."
- "The card grid in the features section is the most common layout for this content type. It works, but it's also what every competitor does."

### 4. What's the weakest spatial relationship?

Look at how elements relate to each other in space. Find the relationship that feels unresolved:

- Where the eye has nowhere to rest between two competing elements
- Where spacing feels arbitrary rather than intentional
- Where an element is "orphaned" — floating without clear connection to its neighbors
- Where two elements are close enough to feel grouped but not close enough to be clearly grouped

This is the most technical of the six questions. It requires looking at the actual spatial composition, not just the concept.

### 5. What would break it out?

Suggest ONE specific change that would make this concept more distinctive. Not a list of improvements — one move.

- "Rotate the section labels 90° and pin them to the left margin. It would give the whole layout a Swiss-poster quality."
- "Remove all images and make the typography do ALL the visual work. The images are currently generic and diluting the type treatment."
- "Double the whitespace between sections. Right now the sections crowd each other. Giving them room to breathe would make the 'calm surface' intent real."

### 6. What's the unasked question?

Identify a design tension the concept hasn't resolved — something the creator may not have considered:

- "This concept hasn't decided whether it wants to be a reading experience or a browsing experience. The layout says browse, but the content depth says read."
- "The mobile version of this composition will collapse the asymmetry. Has the designer considered what the signature move translates to at 375px?"
- "The animation intent is ambitious, but what happens when prefers-reduced-motion is active? The concept might lose its personality entirely."

---

## Comparing directions

When the user is choosing between 2-3 directions, don't just critique each one independently. Also answer:

### Which direction has more creative potential?

Not which is better now — which has more room to grow? Some concepts are polished but exhausted. Others are rough but full of unexplored space.

### Which direction is harder to execute badly?

Some concepts have a narrow success corridor — they're brilliant when done perfectly but fall apart with any compromise. Others are robust — they work at 70% execution. For a user working with AI tools, the robust direction may be the better choice.

### Where do the directions overlap?

Identify shared elements between directions. These might be non-negotiable requirements hiding as aesthetic choices. If all three concepts have left-aligned type, maybe that's not a preference — it's a constraint.

### What would you steal from each?

If you had to merge the best of each direction into one, what survives? This often reveals the user's actual priorities more clearly than asking them to choose.

---

## Critique tone

Exploration critique should be:

- **Conversational**, not clinical — "This has a real Swiss-poster quality that I think works" not "Composition score: 7/10"
- **Specific**, not vague — name the element, the relationship, the spatial quality
- **Constructive**, not evaluative — "What would break it out" not "This is weak"
- **Opinionated**, not neutral — take a position. "I think Direction B has the most potential because..." The user can disagree, and the disagreement is productive.

Do NOT:
- Use numerical scores
- Use pass/fail ratings
- Run the full 10-dimension production critique rubric
- Treat exploration work as if it should be production-ready
