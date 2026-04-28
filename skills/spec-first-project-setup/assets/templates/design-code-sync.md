# Design ↔ code sync gates

This rule fires whenever you create or modify a `.pen` file (Gate 1) or change code in component directories (Gate 2). Both gates exist to keep design comps and code from drifting silently.

## Gate 1 — Design artifact gate

Triggered when creating or modifying `.pen` files (or other design tool files).

- **D1. Taxonomy lookup** — read `docs/DESIGN-TAXONOMY.md` artifact index. Identify which row(s) this work maps to. If none exists, add one before proceeding.
- **D2. Frame naming** — every frame must follow the naming convention from `DESIGN-TAXONOMY.md`: `[label] Artifact — Letter: Description`. Proposal groups must be date-stamped. No unnamed or default frames.
- **D3. Cleanup** — delete default/empty frames from `open_document`. No stray frames.
- **D4. Index update** — after creating frames, update artifact index with: one row per frame (not per artifact when variants exist), actual frame ID, correct lifecycle label, description matching the frame name.
- **D5. Confirm** — every frame traces to an index row, IDs match, no strays, labels correct.

## Gate 2 — Code change gate

Triggered when modifying code in component directories.

- **C1. Artifact check** — does this code map to a `Final` artifact in the index? If not, the work may be ahead of design.
- **C2. Design impact check** — is this change material (layout, structure, content) or trivial (bug fix, perf, refactor with no visual diff)?
- **C3. Design tool update** — for material changes, update the design comp in [DESIGN_TOOL] (`[FILE_PATH]`) before/with the code change.
   - If the design tool MCP is not connected, mark the artifact `Out of sync` in the index and surface it to the user with a one-line note.
- **C4. Index update** — update sync state in `docs/DESIGN-TAXONOMY.md` artifact index (`Synced` / `Out of sync` / `Not started`).
- **C5. Token check** — every visual value in the change traces to a token in `docs/DESIGN-TOKENS.md` (CSS variable / theme constant). No orphan hex/px values.
- **C6. Confirm** — design and code match, index reflects current state, no orphan values.

Substitute `[DESIGN_TOOL]` and `[FILE_PATH]` with the project's design tool name and absolute design file path (from `CLAUDE.md`).
