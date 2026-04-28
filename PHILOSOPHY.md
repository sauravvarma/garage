# Philosophy

This document explains the beliefs the `garage` pod is built on, the contracts the skills enforce when they cooperate, and the situations where the rules should be broken. It is not required reading to *use* the pod — the skills work without it. It is required reading to *modify* the pod, or to understand why something blocked you when you expected it to "just work."

The document has three parts:

1. **Foundation** — engineering beliefs that predate this pod and apply beyond it.
2. **The pod's contract** — how the five skills cooperate, and what each one owns.
3. **Working with the pod** — when to skip the pipeline, when to break the rules, how to extend.

---

## Part 1: Foundation

These four beliefs are not specific to the garage pod — they are how the author thinks engineering should work in any codebase that values its long-term health. The pod *enforces* them; you can adopt them without the pod.

### Docs are the spec, not reference material

When a project has a `docs/` directory describing how a feature should look or behave, those docs are not aspirational notes or onboarding material. They are the binding specification. Code that ships must match them. Design comps that get approved must match them. If the spec is wrong, the *spec* gets updated first, and the implementation follows.

This sounds obvious. It almost never holds in practice, because the path of least resistance is to write the code first and update the doc "later" (which becomes never). The pod fights this by gating implementation on the spec being present and unambiguous: `code-agent` will refuse to implement a feature whose `[FEATURE]-IDEAS.md` has open decisions. It's a small daily friction in service of a much larger long-term invariant: the docs are always trustworthy because the code can't ship without them.

The corollary: when you read a spec and it disagrees with reality, the spec wins until you change it. Don't quietly bend the implementation to match what the code actually does — that's how specs rot.

### Design and code stay in sync — debt is visible, never hidden

A change to the code is not done when it compiles. It is done when the design comp, the tracking doc (`DESIGN-TAXONOMY.md`), and the code all agree, OR when the disagreement is *recorded* as a known sync debt. The crime is not having out-of-sync artifacts. The crime is having out-of-sync artifacts that nobody can see.

Three states are valid:
- **Synced** — design comp, code, and tracking doc all agree.
- **Out of sync** — they disagree, and the tracking doc says so explicitly.
- **Not started** — design exists, code doesn't yet (or vice versa).

The state that's not valid is "they disagree silently." If you change the code in a way that affects layout, you either update the design comp, or you mark the artifact `Out of sync` in the taxonomy. Either is fine. Doing neither is debt that's invisible to everyone except whoever next discovers the discrepancy and has to investigate.

### Every visual value traces to a token

Every color, spacing, shadow, radius, font size, and border in the codebase must trace to a named token. Hex codes, pixel literals, and magic numbers that exist in only one component are forbidden — not because they're ugly, but because they erase the *intent* of the value. `#1a73e8` could be the brand color, an accent, or a typo. `--color-primary` is unambiguous.

When you encounter a value that doesn't have a token, the answer is to *add* the token, not inline the raw value and move on. If the project's token system has semantic roles (e.g. `surface` vs `accent`, `rest` vs `interaction`), respect them — don't apply a token outside its semantic lane just because the color happens to match.

### Discrete breakpoints, not gradients

A spec that lists three breakpoints (mobile, tablet, desktop) defines three *modes* — not a continuous spectrum to interpolate across. Each mode has its own scroll direction, grid topology, cell-size derivation, layout strategy. Adding a fourth breakpoint between two existing ones, or scaling values smoothly between them, violates the spec even if the result looks fine.

This belief is what `visual-qa` checks at every captured breakpoint. It's also why the design skills resist "responsive blending" — when you ask for a layout that works "between tablet and desktop," the answer is to define a fourth mode, not to fudge the existing two.

---

## Part 2: The pod's contract

The five skills don't just coexist — they cooperate through specific contracts. Understanding these contracts is the difference between using the pod fluently and being surprised by it.

### The lifecycle

```
T0: spec-first-project-setup    →  scaffolds docs/, CLAUDE.md, design/, .claude/rules/
T1: design-explore              →  discovers direction, writes DESIGN-HEURISTICS.md
T2: design-agent                →  generates production variants in Pencil
T3: code-agent                  →  implements per locked spec
T4: visual-qa                   →  verifies rendered code matches the spec
```

Each stage assumes the previous stages have completed. The pod surfaces missing prerequisites instead of inventing them. A teammate who runs `code-agent` on a brand-new project gets routed back to `spec-first-project-setup`. A teammate who runs `design-agent` on a project that hasn't run `design-explore` gets routed there.

### The lock-state hierarchy

`docs/[FEATURE]-IDEAS.md` contains a decision table whose rows progress from `open` to `locked`. The `Type` column distinguishes `direction` decisions (the project's overall aesthetic, taste settings, design language) from `variant` decisions (specific compositional choices within a locked direction).

Routing follows the hierarchy:

- **DESIGN-HEURISTICS.md missing** OR any open `direction` decision → direction itself isn't locked. Route to `design-explore`.
- **DESIGN-HEURISTICS.md present**, open decisions are all `variant` → variant choices within a locked direction. Route to `design-agent`.
- **All decisions locked** → ready to implement. Route to `code-agent`.

The hierarchy is mostly one-way. Once a direction is locked, it stays locked unless `design-explore` Mode 5 explicitly Pivots — in which case affected `direction` rows are *re-opened* as a documented event, not silently flipped. The audit trail matters: a Pivot writes a `Reaffirmations` or `Direction revised` entry into `DESIGN-HEURISTICS.md` so the same doubt doesn't resurface unexamined.

### The preflight pattern

Each skill that *reads* state runs a preflight check before doing work. The shape is the same across the pod:

1. Verify required artifacts exist.
2. If anything required is missing, stop and present a checklist with two paths: run `spec-first-project-setup` (default) OR proceed with assumptions and flag them as you go.
3. Wait for the user to choose.

Preflight is not a politeness — it's the mechanism that prevents the pod from inventing values silently. A skill that proceeds without its inputs produces output that *looks* correct but encodes hallucinations as fact. Preflight makes this impossible by construction.

The two non-blocking exceptions are well-defined:
- `design-agent --use-defaults` — proceed when `DESIGN-HEURISTICS.md` is missing, using safe/balanced fallbacks from `references/taste-tuning.md`. Documented in the report.
- `design-explore --ephemeral` — run the entire skill against `/tmp/`, leaving project state untouched. For genuine "what if" exploration.

Both are explicit opt-ins. The default is always: missing inputs → block.

### The ownership map

| Artifact | Created by | Updated by | Read by |
|---|---|---|---|
| `CLAUDE.md` | `spec-first` | `spec-first` (re-runs append) | all four downstream |
| `docs/REPO-CONVENTIONS.md` | `spec-first` | manual + `spec-first` re-runs | `code-agent` |
| `docs/COMPONENT-SPECS.md` | `spec-first` | `code-agent` (when adding atoms) | `code-agent` |
| `docs/BRIEF-AND-DIRECTION.md` | `spec-first` | manual | `design-explore`, `design-agent` |
| `docs/DESIGN-LANGUAGE.md` | `spec-first` | `design-explore` Mode 5 Pivot | `design-agent`, `visual-qa` |
| `docs/DESIGN-TOKENS.md` | `spec-first` | `design-explore` Pivot, manual | `design-agent`, `visual-qa`, `code-agent` |
| `docs/DESIGN-TAXONOMY.md` | `spec-first` | `design-agent` (artifact index), `code-agent` (sync state) | `design-agent`, `visual-qa` |
| `docs/DESIGN-HEURISTICS.md` | `design-explore` | `design-explore` Tweak/Pivot, Reaffirm | `design-agent` |
| `docs/[FEATURE]-IDEAS.md` | `spec-first` (skeleton), `design-explore` (direction + variations) | `design-agent` (rationale + decision locks) | `code-agent` |
| `.claude/rules/design-code-sync.md` | `spec-first` | manual | (loaded as project rule) |

The map answers a single question: **when an artifact is wrong, who fixes it?** The owner. Skills that *read* an artifact don't get to silently update it during normal operation — that path is always explicit (a Pivot, a re-run, a manual edit).

### The append-only rule

Most artifacts in the pod grow rather than get rewritten. `[FEATURE]-IDEAS.md` accumulates "Direction chosen" entries, "Design rationale" sections, "Implementation notes" — each new section is dated and additive. `DESIGN-HEURISTICS.md` accumulates `Reaffirmations` and `Direction revised` entries. `DESIGN-TAXONOMY.md`'s artifact index gains rows; existing rows have their `Sync state` updated but their identity (frame ID, label) doesn't change retroactively.

The rule exists because the *history* of decisions matters. A teammate joining the project six months in needs to understand not just what was decided, but what was considered and rejected, and when the direction changed. Overwriting destroys that. Appending preserves it.

The exception is the design comp itself (Pencil frames). Those *do* get replaced — but the artifact index in `DESIGN-TAXONOMY.md` records the lifecycle (`[draft]` → `[final]` → `[deprecated]`), so the history of that comp is recoverable even if the file isn't.

---

## Part 3: Working with the pod

### When to skip the pipeline

The pipeline is opinionated. Sometimes the opinion is wrong for the situation. Three legitimate ways to step outside it:

- **`design-explore --ephemeral`** — for genuine "what if" sessions where committing to anything would feel premature. Concepts go to `/tmp/`, the project doesn't notice. Use this when you're three coffees deep on a Saturday and want to riff without polluting the docs.
- **`design-agent --use-defaults`** — when you need to generate variants but `design-explore` hasn't run yet (or never will, for this project). The defaults aren't great, but they're better than blocking. The trade-off is recorded in the report so the user knows the variants are unanchored.
- **`code-agent` "Proceed without"** — when the user explicitly tells the agent to skip preflight. This should be rare and the agent will flag every assumption it had to make. Use it for one-off scripts, prototypes that won't ship, or projects where the spec genuinely doesn't apply.

### When to break the rules

The rules in this document encode a default. Defaults are wrong in specific cases:

- **A spec is wrong, and you know it.** Don't bend the implementation to match. Update the spec first, push the change, then implement against the new spec. The lock-state ratchet is to prevent *silent* skipping of the spec, not to prevent updates to it.
- **Tokens don't yet exist for a value, and adding them would require ten-stakeholder consensus.** Inline the value, mark a `// TODO: tokenize once T-9999 lands` comment with a trigger condition, and move on. The token-discipline rule has a five-gate test for comments precisely so that this kind of deferred work has a recorded re-entry point.
- **The pod's lifecycle doesn't match your project's reality.** If you're working on a backend service with no design surface, `design-explore` and `design-agent` and `visual-qa` are dead weight. Use `spec-first-project-setup` (which has a code-only project mode) and `code-agent` standalone. The pod doesn't insist on its own completeness.
- **The user is in a hurry and the cost of preflight outweighs the benefit.** Accept "Proceed without" and flag assumptions. Friction is a cost; sometimes the trade is worth it.

The meta-rule: every rule in this document exists because its absence has produced a specific failure mode the author has seen multiple times. If you're considering breaking a rule, you're saying you've judged that the failure mode it prevents doesn't apply here. That's a real judgment, not a license. Make sure you can name what you'd be losing.

### How to extend or fork

The pod is intentionally small (5 skills) and the contracts between skills are explicit (preflight + ownership map). To add a sixth skill:

1. **Decide what artifact it owns.** A new skill that doesn't own any output is probably a function call disguised as a skill — keep it inline.
2. **Define its preflight.** What does it require? What's recommended? What's optional? Use the same shape the existing five use.
3. **Update the ownership map** in this file.
4. **Update sibling skills' routing language** if your new skill should be the destination for a previously-unrouted state.

To fork the pod for a different stack (Figma instead of Pencil, Cypress instead of Playwright, etc.): the design family of skills is the most Pencil-coupled. `spec-first-project-setup`, `code-agent`, and `visual-qa` are mostly tool-agnostic — `visual-qa` deliberately so. A Figma fork would primarily replace `design-explore` and `design-agent` and update the Pencil-specific sections in `spec-first-project-setup` Step 11 and the `design-code-sync.md` template.

---

The pod is one person's opinions about how to build software, fossilized into a workflow. Take what's useful; ignore what isn't.
