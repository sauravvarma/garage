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
