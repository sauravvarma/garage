# garage

A five-skill engineering pod for Claude Code. Brainstorm a direction, generate variants, implement, verify visually — the full lifecycle, with handoffs that prevent silent assumptions.

```
spec-first-project-setup  →  design-explore  →  design-agent  →  code-agent  →  visual-qa
        scaffold                discover           generate         build           verify
```

Each skill owns one slice of the lifecycle. They cooperate through hard preflight contracts: `code-agent` refuses to implement features with open decisions; `design-agent` refuses to design without a locked direction; `visual-qa` runs against the project's spec, not its own assumptions. The pipeline is opinionated by design — it makes invalid intermediate states unrepresentable.

## What's in the pod

| Skill | Stage | Owns |
|---|---|---|
| `/spec-first-project-setup` | Scaffold | `docs/`, `CLAUDE.md`, `.claude/rules/`, design directory skeleton |
| `/design-explore` | Discover direction | `docs/DESIGN-HEURISTICS.md`, "Direction chosen" entries in feature docs |
| `/design-agent` | Generate production variants | Pencil frames, design rationale entries, decision locks |
| `/code-agent` | Implement | Code (refuses on open decisions) |
| `/visual-qa` | Verify | `.claude/visual-qa-checklist.md`, spec-vs-rendered-code reports |

Read [PHILOSOPHY.md](./PHILOSOPHY.md) for the beliefs and contracts that drive the design.

## Prerequisites

- **Claude Code** (CLI, desktop, or web)
- **Pencil MCP** — required for `design-explore` and `design-agent`. The other three skills work without it.
- **Playwright** — required for `visual-qa`. One-time project setup; the skill deliberately doesn't auto-install (was npm-coupled, broke on pnpm/yarn/bun/Python/Go projects). When `visual-qa` runs and Playwright is missing, it tells you exactly what to install.

The pod has no other runtime dependencies. Skills are pure markdown + small reference files; the only executable code is `visual-qa/scripts/capture.js` (a 35-line Playwright wrapper).

## Install

Add as a marketplace, then install:

```
/plugin marketplace add sauravvarma/garage
/plugin install garage
```

Update later with `git pull` on the marketplace clone, or `/plugin marketplace update garage`.

## Quick start — the contact-page lifecycle

```
T0:  /spec-first-project-setup
     → asks: project name, type (design/code/enterprise), design tool, features
     → creates docs/, CLAUDE.md, design/, .claude/rules/

T1:  /design-explore "what should the contact page feel like?"
     → aesthetic interview, generates 3-5 concepts
     → user picks one → writes docs/DESIGN-HEURISTICS.md
     → appends "Direction chosen" to docs/CONTACT-IDEAS.md

T2:  /design-agent "design the contact page"
     → preflight passes (heuristics + feature decisions exist)
     → generates 2-3 Pencil variants in [proposal] group
     → user picks one → renames frame to [final]
     → appends "Design rationale" to docs/CONTACT-IDEAS.md, locks decisions

T3:  /code-agent "implement the contact page"
     → preflight passes (CLAUDE.md, REPO-CONVENTIONS, COMPONENT-SPECS, locked decisions)
     → reads the [final] Pencil frame for spacing/composition
     → implements per spec, marks DESIGN-TAXONOMY sync state Synced

T4:  /visual-qa
     → reads breakpoints from spec
     → captures screenshots, compares against tokens + design comp
     → reports passes/warnings/failures per breakpoint
```

A skill at any stage will refuse to run if its prerequisites are missing — and tell you exactly which sibling skill to invoke first.

## The lock-state contract

`docs/[FEATURE]-IDEAS.md` carries a decision table whose rows progress `open → locked`. Each row has a `Type`: `direction` (overall aesthetic, taste settings) or `variant` (composition within a locked direction).

| State | Routing |
|---|---|
| `DESIGN-HEURISTICS.md` missing OR open `direction` rows | `/design-explore` |
| `DESIGN-HEURISTICS.md` present, only `variant` rows open | `/design-agent` |
| All rows locked | `/code-agent` |

The hierarchy is mostly one-way. `design-explore` Mode 5 Pivot is the only path that explicitly reopens locked direction decisions, and it leaves an audit trail in `DESIGN-HEURISTICS.md`.

## Escape hatches

The pipeline is strict by default. Two flags relax it:

- `/design-explore "<intent>" --ephemeral` — concepts and reports go to `/tmp/`, project state untouched. For "what if" exploration that doesn't commit to anything.
- `/design-agent "<intent>" --use-defaults` — proceed when `DESIGN-HEURISTICS.md` is missing, using safe/balanced fallbacks. Trade-off recorded in the report.

Both flags are trailing convention but accepted anywhere in the prompt.

## Skipping skills

The pod doesn't insist on its own completeness:

- **Code-only projects** (no design surface) — use `spec-first-project-setup` (code-only mode) + `code-agent`. Skip the rest.
- **Design-only projects** (no code yet) — use `spec-first-project-setup` + `design-explore` + `design-agent`. Implement later.
- **Mid-project adoption** — run `spec-first-project-setup` to scaffold the docs around an existing codebase. Skills that require artifacts they don't see will block with a checklist.

## What this pod is not

- Not an orchestrator. Skills are specialists; users (or future orchestrators) compose them. None of them decides "what to work on next."
- Not a substitute for taste. `design-explore` runs an aesthetic interview; it doesn't replace knowing what feels right.
- Not stack-specific. `code-agent` and `visual-qa` work for any frontend (React, Vue, Svelte, Astro, Python templating, Go templ, Rust). The design family is Pencil-coupled today; forking for Figma/Sketch is plausible (see PHILOSOPHY.md "How to extend or fork").
- Not a CI tool. `visual-qa` runs interactively against a local dev server. For CI screenshot diffing, use a snapshot-diff tool.

## License

MIT — see [LICENSE](./LICENSE).

## Philosophy

The pod is built on four engineering beliefs (docs are the spec; design and code stay in sync; every visual value traces to a token; breakpoints are discrete modes) and five cooperation contracts (the lifecycle, the lock-state hierarchy, the preflight pattern, the ownership map, the append-only rule). [PHILOSOPHY.md](./PHILOSOPHY.md) explains all nine in detail, plus when to break them.
