# [Feature]: ideas and decisions

## Route chrome
<!-- For every page/route feature doc, this section ensures the AI knows the full route context (header, footer, layout wrapper) — not just the main content area. -->
- **Route:** /[path]
- **Layout:** [Default / Custom]
- **Header variant:** [Full nav / Simplified / None]
- **Footer variant:** [Single-line / Expanded / None]

## Decisions

| # | Question | Decision | Status | Type |
|---|----------|----------|--------|------|
| 1 | <!-- e.g. primary layout --> | <!-- e.g. bento grid --> | <!-- locked / open --> | <!-- direction / variant --> |

## Design variations

<!-- Each variation MUST have a substantive description — not just a name. The description defines the layout concept (spatial pattern, hierarchy approach, content flow). The design agent uses these descriptions to build distinct variants. Vague or missing descriptions produce variants that collapse into permutations of each other. -->

### Variation A — "[name]"
<!-- Layout pattern (F-pattern / Z-pattern / single-column / split-screen / bento / etc.), what dominates the viewport, how content flows, what makes this approach distinct. 2-3 sentences minimum. -->

### Variation B — "[name]"
<!-- Same depth. Different spatial concept, not just a rearrangement of A. -->

## Grid / layout system (if applicable)
<!-- Breakpoints, cell sizing, responsive rules -->

## API response shape

<!-- Filled in by /spec-first-project-setup Step 2 if mocks were provided. -->
<!-- If empty, /code-agent will populate this when first reading the API response. -->

## Parser implementation

<!-- /code-agent populates this as patterns emerge during implementation. -->
<!-- Examples of what belongs here: -->
<!-- - Field-mapping conventions specific to this feature -->
<!-- - Status / category derivation rules from the response -->
<!-- - Widget-bag → widgetsByType map pattern (when responses are arrays of typed widgets) -->
<!-- - Synthesised fields with TODO: API markers — list them so the team knows what to ship from the backend -->

## Next steps
<!-- What to try in the design tool, what to implement first -->
