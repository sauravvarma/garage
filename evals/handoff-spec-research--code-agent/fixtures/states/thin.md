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

<!-- No ## Page states section. The decision table is locked, but the decision tree
     (what renders given which inputs: loading / empty / error / tier-gated / already-done)
     has never been enumerated. Run /spec-research HABIT-TRACKER to derive it. -->

## Next steps
Implement the habits page once the Page states tree is derived and locked.
