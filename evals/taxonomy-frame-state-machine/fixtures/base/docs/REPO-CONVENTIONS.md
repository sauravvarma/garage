# Repo conventions

Architectural patterns, philosophy, and institutional knowledge for Streakly. Repo-wide — not feature-specific. Read before making structural decisions.

## Data flow — API to component

### Parser philosophy
API responses are reshaped at the `src/lib/api/` boundary into the types components consume (`Habit`, etc.). Components receive already-shaped data; they never touch raw envelopes or re-derive fields the API layer owns.

### State management
Svelte stores, one per feature under `src/features/<feature>/store.ts`. Stores are module singletons — never instantiate per-component or state leaks across routes. Async lives in the store (load/mutate functions call `src/lib/api/`), not in components.

## Routing

### Navigation model
SvelteKit file-based routing under `src/routes/`. Internal links use `<a href>`; SvelteKit intercepts for client-side nav automatically. No custom link wrapper.

### Route registration
Add a route by creating `src/routes/<path>/+page.svelte`. Feature logic and components live under `src/features/<feature>/` and are imported into the route file.

## Code splitting & SSR

SvelteKit load functions run on server + client; guard `localStorage`/`window` with `browser` from `$app/environment`. Feature pages are SSR'd by default; the skeleton/fallback pattern is a per-feature `*Skeleton.svelte` rendered while the store's status is `loading`.

## Analytics

Not yet wired. When added, events fire through a shared `src/lib/track.ts` — components don't call analytics SDKs directly.

## Asset handling

Static assets under `static/`; reference by absolute path (`/icons/flame.svg`). No CDN utility yet.

## Styling architecture

CSS custom properties only — defined in `src/app.css` from DESIGN-TOKENS, scoped Svelte `<style>` blocks per component. No Tailwind, no CSS-in-JS, no preprocessor. **All visual values must trace to a token in DESIGN-TOKENS.md — no orphan hex/px values.** Feature-scoped custom properties are allowed for genuinely one-off values, but anything reused by 2+ components graduates to a global token in DESIGN-TOKENS.

## Framework notes

<!-- /code-agent populates this as it discovers framework gotchas during implementation. -->

### SvelteKit store singletons
**Symptom:** state from one route bleeds into another.
**Most common actual cause:** a store instantiated inside a component instead of at module scope.
**Recovery:** define the store once in `store.ts` at module scope and import it; never `writable()` inside a component.

## Environment

Dev server seeds a logged-in user. `STREAKLY_TIER=premium npm run dev` seeds a premium user for testing gated states; default is `free`.

## Mock-driven development

Not in use yet. API responses come from the dev server's seeded fixtures.

## Naming & file layout

- Routes: `src/routes/<kebab>/+page.svelte`.
- Feature code: `src/features/<feature>/` — main component `<Feature>.svelte`, store `store.ts`, skeleton `<Feature>Skeleton.svelte`.
- Shared primitives: `src/lib/` (`api/`, `ui/`).
- Version-suffix policy: never on first implementation. No `V2` / `_new` suffixes.

## Primitive substitutions (for ports from other repos)

| # | Source primitive (streakly-legacy / React) | Target equivalent (this app / Svelte) | Rationale |
|---|---|---|---|
| 1 | `useSelector(state => state.X)` | subscribe to the feature Svelte store | Redux → Svelte stores |
| 2 | `<Redirect to="/login" />` | `redirect(302, '/login')` in a load function | SvelteKit redirect idiom |
| 3 | `useFlag('...')` | `session.tier()` check in `src/lib/api/session.ts` | flags collapse to tier gating |

## Backend-contract gotchas (for ports)

<!-- None recorded yet. -->

## Source-baggage drop list (for ports)

- Redux action-type string constants — replaced by direct store mutation.
- React-specific HOCs and `connect()` wrappers.
- Any `/experiments/` path segments or A/B wrappers from the legacy app.
