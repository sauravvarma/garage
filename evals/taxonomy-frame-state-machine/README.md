# taxonomy — frame-state-machine eval suite

Regression suite for the **`DESIGN-TAXONOMY.md` frame state machine** (garage v1.6.0+): three axes (lifecycle / origin / sync), six lifecycle states, and invariants **I1–I4**. It guards that every reader skill — `/design-agent` (Phase 0c), `/code-agent` (comp read), `/visual-qa` (Phase 0d) — **proceeds** on a valid taxonomy and **blocks (surfaces, never guesses)** on a violation.

Sibling of `handoff-spec-research--code-agent/`; same base+overlay philosophy, extended to design comps.

## Why a CLI, not the desktop app

`.pen` files are encrypted and only the Pencil engine can read them. The **desktop MCP binds to the active editor** (shared, GUI-owned, mutable state) and can silently write into the wrong open file — unfit for automation. The **Pencil CLI** (`@pencil.dev/cli`) runs the same engine **fully headless on an explicit path**, so the entire suite — author, read, render, grade — is scriptable with no GUI and no active-editor hazard. `PENCIL_CLI_KEY` covers CI auth.

## Layout

```
taxonomy-frame-state-machine/
  README.md                 ← you are here
  cases.json                ← reader × snapshot → expected proceed/block
  run-taxonomy-suite.sh      ← composes workdirs + extracts .pen inventory via CLI (no LLM)
  fixtures/
    _lib/pen-build.sh         ← headless CLI authoring helper (fixtures-as-code)
    base/                     ← shared Streakly project (locked IDEAS doc; taxonomy is the only variable)
    snapshots/<id>/
      build/streakly.build.txt   ← CLI commands that GENERATE the .pen (source of truth)
      design/streakly.pen        ← generated, committed
      docs/DESIGN-TAXONOMY.md     ← the artifact index for this snapshot (mirrors the .pen)
  runs/                     ← gitignored; composed workdirs + benchmark.json
```

## Snapshots = points in a project's life

| Snapshot | State | Tests |
|---|---|---|
| `T3-shipped` | **valid** steady state (1 `[final]`+Synced, 1 `[anchor]`, deprecated losers) | readers must **not** block (negative control) |
| `V1-double-final` | **invalid**: two `[final]` for one Artifact Name (non-atomic promotion) | **I1** → readers must block |
| `T1-explore` | _pending_ — `[explore]` + `[concept]` A/B/C, no anchor/final | no reference anchor yet; I3 holds |
| `T2-direction-locked` | _pending_ — `[anchor]` + `[proposal]` `[variant]`s, no `[final]` | reference = anchor only |
| `T4-mirror` | _pending_ — `[mirror]` `[anchor]` baselines + `[final]` | mirror-baseline role; I2 |
| `V2-pen-index-drift` | _pending_ — `.pen` has two `[final]`, index shows one | cross-check `.pen` vs index |

## Fixtures-as-code

Each snapshot's `.pen` is **generated** from its `build/streakly.build.txt` — never hand-saved:

```bash
fixtures/_lib/pen-build.sh fixtures/snapshots/T3-shipped/build/streakly.build.txt \
                           fixtures/snapshots/T3-shipped/design/streakly.pen
```

CLI gotchas the helper encapsulates (memory `pencil-cli-headless-authoring-recipe`): `batch_design`'s param is `input:` (not `operations:`); `save()` is async (settle before EOF; `exit()` doesn't save); globals don't persist across `batch_design` calls (one snippet per build). **Frame IDs are reassigned on each build** — after regenerating a `.pen`, refresh its index's `ID/Frame` column from a `batch_get` read.

## How to run

1. **Prepare workdirs** (composes base+overlay; extracts each `.pen`'s frame inventory to `design/streakly.frames.txt` via the CLI):
   ```bash
   ./run-taxonomy-suite.sh                 # all built cases
   ./run-taxonomy-suite.sh V1-code-agent-blocks   # subset
   ```
2. **Execute each case** in a fresh, isolated subagent: run the named skill against `prompt.txt` with `workdir/` as CWD. The reader checks invariants from `docs/DESIGN-TAXONOMY.md`; `design/streakly.frames.txt` is the text projection of the `.pen` for cases that compare frames to the index. No desktop Pencil required.
3. **Grade** each expectation pass/fail into `runs/<stamp>/benchmark.json` (same shape as the handoff suite). A case passes only if every expectation passes.

## Tiers

- **Tier 1 (automated):** invariant / routing / proceed-vs-block — gradeable from the markdown index (+ `frames.txt`). CI-friendly, no GUI.
- **Tier 2 (live):** real `.pen` geometry / composition fidelity — via `pencil --in … --export …png`. Flagged per case.

## When to run

Before merging changes to the taxonomy template (`spec-first-project-setup/assets/templates/design-taxonomy.md`) or to any reader's invariant-handling (`design-agent` Phase 0c, `code-agent` comp read, `visual-qa` Phase 0d).
