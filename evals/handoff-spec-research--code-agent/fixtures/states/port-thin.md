# Habit Tracker: ideas and decisions (port from streakly-legacy)

Porting the habits page from the legacy React SPA into this SvelteKit app. Source: `streakly-legacy/src/pages/HabitTrackerPage.jsx` (provided at `_port_source/HabitTrackerLegacy.jsx`).

## Route chrome
- **Route:** /habits
- **Layout:** Default
- **Header variant:** Simplified
- **Footer variant:** None
- **Target layout strategy:** inherit

## Decisions

| # | Question | Decision | Status | Type |
|---|----------|----------|--------|------|
| 1 | Port fidelity | Port faithfully; preserve legacy render branches unless explicitly deferred | locked | variant |
| 2 | State mapping | Map Redux `habits` slice → Svelte store per REPO-CONVENTIONS port rule #1 | locked | variant |
| 3 | Flag mapping | Legacy `useFlag('multi_habit')` → tier check in `src/lib/api/session.ts` (port rule #3) | locked | variant |

## Page states

| # | State | Trigger | Renders | Dispatches | Exit | Status |
|---|-------|---------|---------|------------|------|--------|
| 1 | Loading | fetch in flight | skeleton cards | — | → Success | locked |
| 2 | Success | habits returned | card stack | complete → streak++ | — | locked |

<!-- No ## Source mirror block. The Page states table lists only 2 of the legacy page's
     7 render branches. The legacy source (HabitTrackerLegacy.jsx) also has: 401 redirect,
     403 upgrade-banner-with-readonly-list, 500 error+retry, empty state, 409 already-done,
     and a premium-gated reorder affordance. None are reconciled here. -->

## Next steps
Reconcile against the legacy source (run /spec-research HABIT-TRACKER) before porting.
