# Habit Tracker: ideas and decisions

The main screen: a list of the user's habits, each showing its current streak, with a tap-to-complete affordance.

## Route chrome
- **Route:** /habits
- **Layout:** Default
- **Header variant:** Simplified
- **Footer variant:** None
- **Target layout strategy:** inherit

## Decisions

| # | Question | Decision | Status | Type |
|---|----------|----------|--------|------|
| 1 | Primary layout | Vertical stack of cards, one per habit | locked | variant |
| 2 | Card content | Habit name, current streak count, flame icon | locked | variant |
| 3 | Complete affordance | Tapping a card's complete button marks the habit done for today | locked | variant |
| 4 | Streak emphasis | Streak count uses `--font-size-display`; flame uses `--color-accent` | locked | variant |
| 5 | Tier limit behavior | Free tier capped at 3 habits; 403 shows an upgrade banner, not an error | locked | variant |

## Page states

| # | State | Trigger | Renders | Dispatches | Exit | Status |
|---|-------|---------|---------|------------|------|--------|
| 1 | Loading | fetch in flight | 3 skeleton cards | — | → Success / Empty / TierLimit / Error | locked |
| 2 | Empty | habits = [] | empty illustration + "Add your first habit" CTA (`--color-accent`) | tapCTA → new-habit sheet | → Success | locked |
| 3 | Success | habits returned, ≥1 | vertical card stack; per card: name, streak (`--font-size-display`), flame (`--color-accent`), complete button | complete → optimistic streak++, POST /complete | → AlreadyDone (409) / Error | locked |
| 4 | Already done | complete returns 409 | card flips to success check (`--color-success`), button disabled until tomorrow | — | — | locked |
| 5 | Tier limit | fetch returns 403 | upgrade banner (`--color-accent` CTA) above any returned cards | tapUpgrade → /upgrade | leaves route | locked |
| 6 | Unauthenticated | fetch returns 401 | immediate redirect to /login | — | leaves route | locked |
| 7 | Error | fetch returns 500 | full-card error state + retry button | retry → Loading | → Loading | locked |

## API response shape
`fetchHabits()` → `200 Habit[]` | `401` | `403 tier_limit` | `500`. `completeHabit(id)` → `200 Habit` | `409 already_completed` | `5xx`. See `src/lib/api/habits.ts`.

## Known caveats / follow-ups
- None yet.

## Next steps
Implement: store + page + per-state rendering, tokens from DESIGN-TOKENS, API via src/lib/api.
