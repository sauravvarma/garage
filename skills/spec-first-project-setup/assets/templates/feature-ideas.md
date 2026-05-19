# [Feature]: ideas and decisions

## Route chrome
<!-- For every page/route feature doc, this section ensures the AI knows the full route context (header, footer, layout wrapper) — not just the main content area. -->
- **Route:** /[path]
- **Layout:** [Default / Custom]
- **Header variant:** [Full nav / Simplified / None]
- **Footer variant:** [Single-line / Expanded / None]
- **Target layout strategy:** [ROUTE_LAYOUT_STRATEGY]
<!-- One of: inherit | responsive | desktop-only | mobile-only.
     "inherit" = use the project default from DESIGN-LANGUAGE.md (most features).
     Override only when this route targets a different viewport set than the rest of
     the codebase (e.g. a mobile-only widget inside an otherwise-desktop app). Drives
     which viewports visual-qa and code-agent capture for this route. -->

## Decisions

| # | Question | Decision | Status | Type |
|---|----------|----------|--------|------|
| 1 | <!-- e.g. primary layout --> | <!-- e.g. bento grid --> | <!-- locked / open --> | <!-- direction / variant --> |

## Page states

<!--
The decision tree for this page: every distinct rendered state, not just the happy path. /code-agent refuses to implement until this table is filled in for features with more than one state; /visual-qa iterates QA across every row.

**Don't fill this in by hand.** Run `/spec-research [FEATURE]` — it reads the API contracts, source code (for ports), role gates, URL params, and adjacent specs, then proposes a draft table you review and lock. Faster, more thorough, and catches the adjacent gaps you'd otherwise miss (chart shape, unit definitions, taxonomy entries, stale-doc drift).

Common state families /spec-research walks through:
  - Loading / first paint (no data yet)
  - Fetching update (have prior data, refetching)
  - Success — primary data
  - Success — empty data (zero rows, no records, etc.)
  - Partial data (some fields missing, optional sections absent)
  - Error — recoverable (retry CTA)
  - Error — terminal (5xx, auth lost)
  - Role / permission gated (eligible / ineligible / not-yet-onboarded)
  - Stale-during-key-change (e.g. patient switch mid-fetch)
  - Network offline / SSE disconnected (where applicable)
  - Mutation pending / failed / optimistic-success (for pages with writes)

For ports: /spec-research mirrors the source's render branches in full, even deferred ones. Use `Status: deferred` if a state won't ship in this iteration — silent omission is the bug.
-->

| # | State | Trigger | Renders | Dispatches | Exit | Status |
|---|-------|---------|---------|------------|------|--------|
| 1 | <!-- e.g. eligible-loaded --> | <!-- e.g. eligibility.isEligible && data --> | <!-- ScoreBar + tabs + content --> | <!-- — --> | <!-- patient switch --> | <!-- shipped / deferred / open --> |

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
