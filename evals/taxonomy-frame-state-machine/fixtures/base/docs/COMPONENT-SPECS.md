# Component specs

Code component index and shared atoms. Keep in sync with `src/`.

## Shared atoms

| Atom | Purpose | Spec | Rationale |
|------|---------|------|-----------|
| `fetchHabits` / `completeHabit` / `ApiError` | habits data access | `src/lib/api/habits.ts` | components never `fetch` directly |
| `session` | tier + auth header + `freeHabitLimit` | `src/lib/api/session.ts` | single source for tier gating |

The UI atom layer (cards, buttons, skeletons) is **not yet built**. Features create their own components under `src/features/<feature>/`; promote a primitive to `src/lib/ui/` once 2+ features share it.

## Component tree: (none yet)

<!-- No feature UI implemented yet. The Habit Tracker (src/features/habits/) is the
     first feature scheduled for implementation; its component tree will be filled in
     by /code-agent once the HABIT-TRACKER-IDEAS.md Page states tree is locked. -->
