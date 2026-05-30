# Repo conventions

Architectural patterns, philosophy, and institutional knowledge for this project. These are repo-wide — not feature-specific. Read this before making structural decisions.

## Data flow — API to component

### Parser philosophy
<!-- How does data flow from API responses to component props? -->
<!-- Is there a deliberate reshaping layer (parser.js)? Or direct consumption? -->
<!-- Key principle: does the frontend shape data for its own needs, or mirror the API? -->

### State management
<!-- What library (Redux Toolkit, Zustand, etc.)? -->
<!-- How are reducers/stores registered? (Static? Dynamic injection?) -->
<!-- Async patterns: thunks, sagas, queries? -->
<!-- Cross-store dependencies: which stores read from other stores? -->

## Routing

### Navigation model
<!-- What's the central link/navigation wrapper? -->
<!-- How does the app decide: client-side nav vs full page load? -->
<!-- What flags or patterns control this? (e.g. isExternal) -->

### Route registration
<!-- How are routes defined? Static config, file-based, dynamic? -->
<!-- What's the pattern for adding a new page/route? -->

## Code splitting & SSR

<!-- How are pages/features loaded? (@loadable, React.lazy, etc.) -->
<!-- What's the SSR story? Full SSR, selective, client-only? -->
<!-- Are there patterns for skipping SSR on specific components? -->
<!-- What does the skeleton/fallback pattern look like? -->

## Analytics

<!-- How do tracking events flow? API-driven ga_data, hardcoded, or mixed? -->
<!-- Is there a shared tracking utility or does each component fire its own? -->
<!-- What's the contract: does the parser reshape analytics data or pass it through? -->

## Asset handling

<!-- How are images, icons, and static files resolved? -->
<!-- Is there a CDN/asset utility function? -->
<!-- Separate asset directories for different build targets? -->

## Styling architecture

<!-- Preprocessor: SCSS, PostCSS, CSS-in-JS? -->
<!-- Module system: CSS modules, BEM, scoped styles? -->
<!-- Token/variable files: where do shared values live? -->
<!-- Rule: all visual values must trace to tokens — no orphan hex/px values. -->
<!-- If tokens are auto-injected by sass-loader / style-loader, document that — engineers shouldn't @import them manually. -->
<!-- If feature-scoped CSS custom properties are allowed for unmapped values, document the policy and the graduation path to global tokens. -->

## Framework notes

<!-- Repo-specific framework gotchas with prescribed recovery. -->
<!-- Add to this section when something bites you — never write down a symptom without writing down the fix or the procedure to find it. -->
<!-- /code-agent populates this as it discovers framework issues during implementation. -->
<!-- Example heading — replace with real entries: -->
<!-- ### <FrameworkName> <issue title> -->
<!-- **Symptom:** ... -->
<!-- **What's already wired correctly:** ... (so the next reader doesn't waste time on the wrong hypothesis) -->
<!-- **Most common actual cause:** ... -->
<!-- **Recovery procedure:** numbered steps. -->

## Environment

<!-- Per-engineer machine setup. Local config files, secrets, env vars, dev server quirks. -->
<!-- Repo-specific only — global tooling notes belong elsewhere. -->
<!-- Document any gitignored files that the dev server needs (e.g. config.json, .env), where to source them, and the failure mode if missing. -->

## Mock-driven development

<!-- If this project uses checked-in API mocks (typically under docs/mocks/), document: -->
<!-- - Where they live and how they map to real endpoints. -->
<!-- - How they're loaded into the dev environment (e.g. parsed at module load and seeded into reducer initialState). -->
<!-- - The policy for keeping them in sync with the real API. -->
<!-- - Whether a TODO: API marker convention is in use to flag synthesised fields the backend should ship. -->

## Naming & file layout

<!-- Project-wide naming/structure conventions that apply to ALL features (greenfield + ports). -->
<!-- - Directory casing for pages, containers, widgets, components, flows. -->
<!-- - Main component file pattern, stylesheet pattern, skeleton suffix (no dot vs dot-separator). -->
<!-- - Reducer slice naming (camelCase root tracking the dir, createAsyncThunk type prefix, exported reducer name). -->
<!-- - Constants / analytics / parser file conventions (singular vs plural, tracking.js vs GAEvents.js, etc.). -->
<!-- - Version-suffix policy: when (if ever) is a `V2` / `_new` suffix allowed in this repo? Default: never on first implementation. -->

## Primitive substitutions (for ports from other repos)

<!-- Empty for greenfield projects. Populated when port-features land. -->
<!-- One row per substitution: source-repo primitive → target-repo equivalent, with rationale and example. -->
<!-- e.g. mweb's `Client_Only_Render` HOC → dweb's `@loadable/component` with `{ ssr: true, fallback: <Skeleton /> }`. -->

## Backend-contract gotchas (for ports)

<!-- Header / cookie / auth differences between source and target environments that would silently 4xx a verbatim port. -->
<!-- e.g. "Source backend accepts dweb's default platform headers; target backend rejects them with 400 — pass HACK_HEADERS in the API call." -->

## Source-baggage drop list (for ports)

<!-- Patterns from the source repo that should NEVER propagate forward. -->
<!-- e.g. `/experiments/` path segments, AB-test wrappers, version suffixes from a long-gone V1, mweb-only chrome. -->
<!-- This is the canonical list — /spec-research reads it during port-feature conformance checks. -->
