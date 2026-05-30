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

<!-- DRAFT — proposed by /spec-research 2026-05-26. Review and lock before /code-agent. -->
## Page states

| # | State | Trigger | Renders | Dispatches | Exit | Status |
|---|-------|---------|---------|------------|------|--------|
| 1 | Loading | fetch in flight | skeleton cards | — | → Success / Empty / Error | proposed |
| 2 | Empty | habits = [] | empty-state illustration + "Add your first habit" CTA | — | → Success | proposed |
| 3 | Success | habits returned | card stack | complete → optimistic streak++ | → AlreadyDone on 409 | proposed |
| 4 | Already done | complete returns 409 | card shows success check, button disabled | — | — | proposed |
| 5 | Tier limit | fetch returns 403 | gated banner + upgrade CTA | — | — | proposed |
| 6 | Unauthenticated | fetch returns 401 | redirect to /login | — | leaves route | proposed |
| 7 | Error | fetch returns 500 | error card + retry | retry → Loading | → Loading | proposed |
<!-- END DRAFT -->

<!-- The draft is present but every row is Status: proposed and the DRAFT markers are
     still in place. The user has NOT reviewed or locked these rows yet. -->

## Next steps
Review the proposed Page states above; lock the rows (remove DRAFT markers, set Status: locked) before implementing.
