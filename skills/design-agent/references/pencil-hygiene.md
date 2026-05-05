# Pencil Hygiene

Rules for producing `.pen` files that are accurate, maintainable, and don't waste tool calls. Applies to every mode of this skill — variant generation, critique, and mirror.

The companion reference is `pencil-rendering-quirks.md` (paint-time bugs and their workarounds). This file covers the *upstream* discipline that prevents most of those bugs from biting in the first place.

---

## The five hygiene rules

### 1. Components-first when structure repeats more than twice

Pencil supports `reusable: true` on any node, then instances via `{ type: "ref", ref: "<id>" }`. Use this. The trigger condition: any time you would type the same shape three or more times — table rows, parameter cards, navigation items, list items, plan cards, rail cards — promote it to a reusable component first, then instance it.

The instance pattern:

```js
// Define once, with reusable: true
rowTemplate = I(scratchFrame, { type: "frame", name: "BodySystemRow", reusable: true, ... })
// Bind every overridable descendant
rowName    = I(rowTemplate, { type: "text", id: "rowName", ... })
rowIcon    = I(rowTemplate, { type: "frame", id: "rowIcon", ... })
rowValue   = I(rowTemplate, { type: "text", id: "rowValue", ... })

// Instance with overrides
heart = I(table, { type: "ref", ref: rowTemplate, descendants: {
  rowName:  { content: "Heart Health" },
  rowIcon:  { fill: { type: "image", url: "./assets/heart-health.png", mode: "fit" } },
  rowValue: { content: "11/14" },
}})
```

The cost of *not* doing this is paid every time you need to change a property: a 14-row table becomes 14 update calls instead of one update to the template that propagates. Same for the right rail when it's identical across 6 frames.

The judgment call: components-first is the default. The exception is one-off content that genuinely never repeats (a hero illustration, a page title). Don't over-component.

### 2. Bind every descendant ID you might reference later

When inserting nested structures, give every node you might need to update later a stable name in the binding map:

```js
// Bad — anonymous children, you'll grep for them later
I(row, { type: "frame", width: 24, height: 24, fill: "#FFE6DA" })
I(row, { type: "text", content: "Heart Health" })

// Good — named bindings, addressable forever
icon = I(row, { type: "frame", width: 24, height: 24, fill: "#FFE6DA" })
name = I(row, { type: "text", content: "Heart Health" })
```

The cost is a few characters per insert. The savings are entire `batch_get` round trips later. If you're going to update an icon's fill or a text's content in a later batch, the ID needs to exist as a binding from the moment you create the node.

When in doubt, bind it. Anonymous nodes are write-once.

### 3. Trust `batch_get`, verify with screenshot only at the end

The render path lags. Fresh inserts often paint blank in `get_screenshot` for a turn or two even when `batch_get` confirms the data. See `pencil-rendering-quirks.md` for the full diagnostic signature.

Operational rule: after `batch_design`, verify the *structure* with `batch_get` (cheap, accurate). Only call `get_screenshot` for a final visual check after a meaningful batch is complete — not as a per-op debugging tool. If a screenshot looks blank but `batch_get` shows the data, the renderer is lagging, not broken. Move on.

If the screenshot still looks wrong after `batch_get` confirms the data and the document has been re-opened, you've hit a real quirk — switch to clone-and-modify per the quirks reference.

### 4. Design tokens become Pencil variables, once

Before any frame work, read the project's design tokens (CSS variables, theme constants, design system docs) and declare them in the `.pen` file's `variables` block:

```js
// Once at the top of the .pen build
variables: {
  "coral-deep":    { type: "color",  value: "#FF6C30" },
  "ink":           { type: "color",  value: "#1A1A1F" },
  "body-md":       { type: "number", value: 13 },
  "space-row":     { type: "number", value: 12 },
}

// Used everywhere via $-prefix references
I(row, { type: "text", content: "...", fill: "$ink", fontSize: "$body-md" })
```

The cost is one upfront pass. The savings: token changes propagate automatically, and you stop typing `#FF6C30` and `13` and `Inter` in every op.

If the project has no formal token doc, do a quick scan of the SCSS/styled-components and synthesize a starter set. Even an imperfect token map beats hardcoding values everywhere.

### 5. Real assets, not placeholders

When the shipped UI uses real images and real SVG icons, mirror them faithfully. Don't draw approximations.

For images (photos, illustrations, body-system icons): pull URLs from the source-of-truth (mock JSON, API responses, CMS), download them via `~/vault/tools/scripts/extract-mock-assets.py` to `design/assets/`, and reference via image fills:

```js
fill: { type: "image", url: "./assets/heart-health.png", mode: "fit" }
```

For SVG icons defined in the React/Vue/etc component source: extract the `geometry`, `viewBox`, `strokeWidth`, and stroke caps/joins via `~/vault/tools/scripts/extract-icon-paths.js`, and create reusable icon components in Pencil:

```js
// One-time definition, reusable
chevronDown = I(iconLib, {
  type: "path",
  reusable: true,
  geometry: "M4 6l4 4 4-4",
  viewBox: [0, 0, 16, 16],
  width: 16, height: 16,
  stroke: { fill: "$ink", thickness: 1.75, cap: "round", join: "round" },
})

// Used as instances everywhere
I(expandRow, { type: "ref", ref: chevronDown, width: 12, height: 12 })
```

Do not use emoji glyphs (🌐, 👨‍⚕️) or arrow characters (↓, →, ›) as icon substitutes. They render inconsistently across systems and look like AI shortcuts in a portfolio piece. The two-minute extraction pass is always worth it.

---

## How the rules interact with rendering quirks

Components-first (rule 1) and clone-and-modify (the quirks-reference workaround) reinforce each other. A reusable component is a known-good template you instance via `ref` — which is structurally similar to the clone-from-known-template pattern that dodges the fresh-paint quirk. Lean on both.

If you build components first and use ID-binding discipline, most of the "screenshot blank" debugging cycles disappear because you're not making fresh structural inserts in the first place — you're either defining once-and-reusing, or updating existing nodes via `U()`.

---

## When to apply

Every mode of `/design-agent`:

- **Variant generation:** components first for any structure that recurs across variants. Token variables for all colors/sizes/spacing. Real assets if the variant is meant to evaluate fidelity.
- **Critique:** check the existing frame against these rules. A frame that hardcodes hex values everywhere or hand-draws icons is a frame that will rot — flag it in the report.
- **Mirror mode:** the rules become a hard pipeline (see SKILL.md Mirror Mode section). The whole point of mirror mode is faithful reproduction, which fails without all five.

---

## When you discover a sixth rule

Add it here with: the rule, the cost of skipping it, and one concrete example of what the failure mode looks like in a `.pen` file. Don't add hypothetical rules — only ones you've watched fail in practice.
