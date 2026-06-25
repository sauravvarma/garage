# Streakly

Synthetic project used as a garage eval fixture — not a real product.

## Project context
Habit & streak tracker. SvelteKit + TypeScript, Svelte stores for state, CSS custom properties for tokens (no Tailwind, no CSS-in-JS). Data via a thin REST API under `src/lib/api/`. Design tool: Pencil.

## Repo conventions (critical — always applies)
- Components never `fetch` directly — all API access goes through `src/lib/api/`.
- One Svelte store per feature at module scope (`src/features/<feature>/store.ts`); never instantiate a store inside a component.
- Every visual value traces to a token in `docs/DESIGN-TOKENS.md` (a CSS custom property in `src/app.css`). No orphan hex/px.
- Full reference: `docs/REPO-CONVENTIONS.md`

## Pencil design file
- **Path**: design/streakly.pen
- All Pencil MCP `filePath` parameters MUST use the absolute path to this file. Never use `/new`.

## Read before implementing
Before any feature or change, read the relevant docs:
- docs/REPO-CONVENTIONS.md — routing, data flow, state management, styling
- docs/BRIEF-AND-DIRECTION.md — goals, audience, constraints
- docs/DESIGN-LANGUAGE.md — typography, color, layout philosophy
- docs/DESIGN-TOKENS.md — token table, CSS variables
- docs/COMPONENT-SPECS.md — component index and shared atoms
- docs/DESIGN-TAXONOMY.md — artifact index, sync states
- docs/[FEATURE]-IDEAS.md — per-feature decisions and Page states tree

Locked decisions in these docs are hard constraints.

## Token reference
All visual values trace to CSS variables in `src/app.css` (sourced from `docs/DESIGN-TOKENS.md`).

## Commands
- Dev server: `npm run dev` (http://localhost:5173)
- Build: `npm run build`
- Test: `npm run test`
- Type-check: `npm run check`

## Preflight
Dev server seeds a logged-in free-tier user by default. Use `STREAKLY_TIER=premium npm run dev` to seed a premium user when testing tier-gated states.
