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
| 4 | Tier handling | Handle the tier-gated case gracefully | locked | variant |

## Page states

| # | State | Trigger | Renders | Dispatches | Exit | Status |
|---|-------|---------|---------|------------|------|--------|
| 1 | Loading | fetch in flight | skeleton cards | — | → Success / Error | locked |
| 2 | Success | habits returned | card stack | complete → optimistic streak++ | — | locked |

<!-- Page states covers only loading + success. The data contract in src/lib/api/habits.ts
     implies more: 401 unauthenticated, 403 tier_limit, 409 already_completed, 500 server,
     plus an empty (zero habits) case. Decision #4 "handle the tier-gated case gracefully"
     is a vague verb with no concrete render rule. -->

## API response shape
`fetchHabits()` → `200 Habit[]` | `401` | `403 tier_limit` | `500`. `completeHabit(id)` → `200 Habit` | `409 already_completed` | `5xx`. See `src/lib/api/habits.ts`.

## Next steps
Complete the Page states tree (run /spec-research HABIT-TRACKER) before implementing.
