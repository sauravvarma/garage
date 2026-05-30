// streakly-legacy/src/pages/HabitTrackerPage.jsx
// Source-of-truth render branches for the habits page in the legacy React SPA.
import { useSelector, useDispatch } from 'react-redux';
import { useFlag } from '../lib/flags';

export default function HabitTrackerPage() {
  const dispatch = useDispatch();
  const { status, habits, error } = useSelector((s) => s.habits);
  const canUseMultiHabit = useFlag('multi_habit'); // premium-gated

  // Branch 1: loading
  if (status === 'loading') return <SkeletonCards count={3} />;

  // Branch 2: unauthenticated → redirect
  if (error?.status === 401) return <Redirect to="/login" />;

  // Branch 3: tier limit (free user past 3 habits)
  if (error?.status === 403) {
    return (
      <UpgradeBanner reason="habit_limit">
        {habits.length > 0 && <HabitList habits={habits} readOnly />}
      </UpgradeBanner>
    );
  }

  // Branch 4: hard error
  if (error) return <ErrorCard onRetry={() => dispatch(fetchHabits())} />;

  // Branch 5: empty
  if (habits.length === 0) return <EmptyState onAdd={() => dispatch(openNewHabitSheet())} />;

  // Branch 6: success — with a premium-only reorder affordance
  return (
    <HabitList
      habits={habits}
      reorderable={canUseMultiHabit}
      onComplete={(id) => dispatch(completeHabit(id))}
      onAlreadyDone={(id) => dispatch(showAlreadyDoneToast(id))} // Branch 7: 409 handling
    />
  );
}
