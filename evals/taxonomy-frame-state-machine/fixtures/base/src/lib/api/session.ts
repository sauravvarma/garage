export type Tier = 'free' | 'premium';

// Dev server seeds tier from STREAKLY_TIER (default 'free').
export const session = {
  tier(): Tier {
    return (import.meta.env.STREAKLY_TIER as Tier) ?? 'free';
  },
  authHeader(): Record<string, string> {
    return { authorization: 'Bearer dev-token' };
  },
  // Free tier caps active habits at 3; beyond that the API returns 403 tier_limit.
  freeHabitLimit: 3,
};
