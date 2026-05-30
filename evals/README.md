# garage — eval suite

Durable, committed regression baselines for the garage skill pod. **This directory is part of the repo but inert at plugin-install time** — Claude Code's loader only scans `skills/ commands/ agents/ hooks/ .mcp.json`, so nothing here is ever loaded as a skill or adds runtime surface. It travels with the skills it guards so the baseline runs on anyone's checkout.

## Why this exists

garage isn't six independent skills — it's a pipeline with hard handoffs over a **shared artifact layer** (the `docs/[FEATURE]-IDEAS.md` decision tree). The interesting regressions aren't "is the code good"; they're protocol failures across that layer:

- code-agent silently codes the happy path instead of refusing on a thin spec
- code-agent treats an unreviewed `/spec-research` **draft** as if it were locked
- code-agent's depth gate becomes over-eager and refuses a perfectly complete spec
- spec-research emits something code-agent can't consume (wrong table shape, or worse, code)
- a port loses render branches because nobody mirrored the source

The suite pins the **expected behavior at each handoff** so a change to one skill can't quietly break the contract another skill depends on.

## Layout

```
evals/
  README.md                              ← you are here
  handoff-spec-research--code-agent/      ← first handoff under test
    cases.json                            ← case definitions (10 cases, 7 behaviors + 1 guard)
    run-handoff-suite.sh                  ← composes isolated workdirs (does NOT call an LLM)
    fixtures/
      base/                               ← shared synthetic project (Streakly habit tracker)
      states/*.md                         ← IDEAS-doc overlays; the ONLY variable per case
      ports/HabitTrackerLegacy.jsx        ← legacy source for the port cases
    runs/                                 ← gitignored; prepared workdirs + benchmark.json land here
```

The fixture model is **base + overlay**: every case is the same `base/` project with exactly one `states/*.md` copied to `docs/HABIT-TRACKER-IDEAS.md`. To see what an agent was given for a case, diff that one file. The base API (`src/lib/api/habits.ts`) deliberately implies 5+ branches (401/403/409/500 + empty) — that's what makes the "inadequate page states" cases bite.

## How to run a baseline

1. **Prepare workdirs** (isolated, one per case):
   ```bash
   ./handoff-spec-research--code-agent/run-handoff-suite.sh           # all cases
   ./handoff-spec-research--code-agent/run-handoff-suite.sh C4-locked-proceeds   # a subset
   ```
   This writes `runs/<timestamp>/<case-id>/workdir/` plus `prompt.txt` and `case.json` per case, and a `manifest.json`.

2. **Execute each case.** For each prepared case, run the named skill against `prompt.txt` with that case's `workdir/` as the working directory. Run cases in **separate, isolated agent sessions** (a fresh subagent per case) so no case contaminates another. Capture: the agent's transcript and the post-run `git status`/files-modified inside `workdir/`.

   Contamination controls (carried over from the iteration runs):
   - Synthetic project + fresh domain (Streakly), different stack from any real repo (SvelteKit/Svelte stores/CSS vars).
   - Per-case isolated workdir — no shared writes.
   - Prompts never name the skill that *should* be routed to, only the skill under test.

3. **Grade into `benchmark.json`.** Score each expectation in `case.json` pass/fail with one line of evidence, in the same shape as `skills-workspace/iteration-*/benchmark.json`. Write `runs/<timestamp>/benchmark.json`. A case passes only if every expectation passes.

## When to run

- **Before merging any change to `spec-research` or `code-agent`** (the two skills under test here), or to their shared contract (the IDEAS-doc Page-states template in `spec-first-project-setup`).
- After editing either skill's description — triggering/refusal phrasing is part of what these cases check.
- As a pre-release sweep across the pod.

## Baseline status

| Run | Date | Pass rate | Notes |
| --- | --- | --- | --- |
| baseline | 2026-05-27 | 10/10 cases · 40/40 checks | Green on behavior. Surfaced **F1** (medium): spec-research emits inconsistent Status tokens (`proposed`/`shipped`/`draft`) for unlocked rows; template vocabulary disagrees with code-agent's gate. See `handoff-spec-research--code-agent/baseline-benchmark.json` → `findings`. |

The committed reference baseline lives at `handoff-spec-research--code-agent/baseline-benchmark.json` (same shape as `skills-workspace/iteration-*/benchmark.json`). Re-run and compare against it after touching either skill; raw per-run output goes to the gitignored `runs/`.

## Extending to other handoffs

This directory covers spec-research ↔ code-agent. Add sibling directories for the other pipeline seams as they're prioritized — e.g. `handoff-design-agent--code-agent/`, `handoff-code-agent--visual-qa/` — reusing the same base+overlay + `run-*.sh` pattern. Keep one shared synthetic project per handoff so fixtures stay diffable.
