# Pencil Rendering Quirks

Pencil MCP is the design tool the agent uses to read and write `.pen` files. It has two known rendering quirks that silently waste long debugging sessions if you don't know about them. Both are about the gap between what `batch_get` / `snapshot_layout` report and what `get_screenshot` actually paints.

**Diagnostic signature — recognize this fast:**
- You inserted a node via `batch_design`. The operation reported success.
- `batch_get` shows the node with the right properties.
- `snapshot_layout` shows it at the expected position.
- `get_screenshot` shows blank where it should be — or shows it offset from where snapshot said.

If you see this pattern, stop trying to fix the insert. Switch to one of the workarounds below.

---

## Quirk 1: Fresh inserts into cloned sheets often don't paint

**What happens:** When you clone an existing frame with `C()` and then insert new children into the clone with `I()`, the new children frequently fail to render. They show up in `batch_get` and `snapshot_layout` with sensible positions, but `get_screenshot` paints them as empty white. Re-opening the document does not fix it.

**What does work:** Modifying *copied* descendants via `U()` paints reliably. So the working pattern is:

1. Find an existing widget in the file that matches the structural shape you need (e.g. a row template, a card, a list item). Locate it via `batch_get` with `patterns`.
2. `C(srcId, parentId, {})` to clone it into the new location. **Important:** `C()` requires a third argument. Calling `C(srcId, parentId)` errors with `Cannot use 'in' operator to search for 'descendants'`. Pass `{}` if you have no overrides.
3. `M(childId, copyId, position)` to reorder children inside the copy if the layout direction needs to change (e.g. swap "icon-left, text-right" to "text-left, icon-right").
4. `U()` on copied descendants to swap text content, fontSize, fontWeight, fill, icon name, etc. These updates DO paint.
5. Hide unwanted parts via `U(id, {enabled: false})` rather than deleting and re-inserting.

If a frame needs brand-new structure with no existing template, try inserting into the document root or a non-cloned ancestor first, then `M()` it into place. Or build the structure once in a scratch frame at the edge of the canvas, then clone it where you actually need it.

**Why this matters for variant generation:** The agent's natural impulse is to write rich `batch_design` blocks with many fresh `I()` calls. In cloned-sheet contexts that path silently produces invisible widgets. Lead with `C()` from a known-good template instead.

---

## Quirk 2: +50px y-offset on siblings of certain status-bar-bearing frames

**What happens:** When a parent frame has `layout: "none"` and contains a child that itself wraps a status bar (like the iPhone canvas template used in mobile designs), siblings inserted *after* that status-bar-bearing child render at +50px in y. The stored `y` value is what you set; the rendered position is `y + 50`. `snapshot_layout` reports the rendered position (so it shows the offset), `batch_get` reports the stored value (so it doesn't).

**Workaround:** Compensate in stored coordinates. If the spec says "scrim at y=0, sheet at y=280", store `y: -50` and `y: 230`. Verify with `snapshot_layout` — it should now show y=0 and y=280 as the rendered values.

This is unreliable enough that it's better to avoid the situation entirely: prefer Quirk 1's clone approach. Cloning a known-good frame inherits its working positioning and dodges the offset.

---

## What to do when both quirks are biting at once

1. Find a sibling frame that already renders correctly (e.g. another variant in the same proposal group).
2. Clone the entire frame with `C()`.
3. Modify the copy via `U()` and `M()`. Avoid `D()`-then-`I()` cycles inside the copy.
4. If you need to add a child that has no structural analog, clone an existing child of the source frame (not the entire frame), and adapt it.

The general rule: **lean on copy-and-modify, not insert-from-scratch.** The renderer is friendlier to descendants that have rendered before.

---

## Don't fight the renderer

If you've spent more than 2–3 round trips trying to make a fresh insert paint, stop and switch strategies. The diagnostic signature (data correct, screenshot blank) means the renderer has decided not to paint that node, and continuing to tweak its properties won't change its mind. Clone something that works and modify it.

When you discover a third Pencil quirk that fits this same shape (data says yes, screenshot says no), add it to this file with: the trigger condition, the workaround, and one sentence on why it matters for the agent's loop.
