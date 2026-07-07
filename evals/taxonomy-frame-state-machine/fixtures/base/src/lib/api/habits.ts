import { session } from './session';

export type Habit = {
  id: string;
  name: string;
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  lastCompletedAt: string | null;
};

// GET /api/habits → 200 Habit[] | 401 (no session) | 403 (tier-gated beyond free limit) | 500
export async function fetchHabits(): Promise<Habit[]> {
  const res = await fetch('/api/habits', { headers: session.authHeader() });
  if (res.status === 401) throw new ApiError('unauthenticated', 401);
  if (res.status === 403) throw new ApiError('tier_limit', 403);
  if (!res.ok) throw new ApiError('server', res.status);
  return res.json();
}

// POST /api/habits/:id/complete → 200 Habit | 409 (already completed today) | 5xx
export async function completeHabit(id: string): Promise<Habit> {
  const res = await fetch(`/api/habits/${id}/complete`, {
    method: 'POST',
    headers: session.authHeader(),
  });
  if (res.status === 409) throw new ApiError('already_completed', 409);
  if (!res.ok) throw new ApiError('server', res.status);
  return res.json();
}

export class ApiError extends Error {
  constructor(public kind: string, public status: number) {
    super(kind);
  }
}
