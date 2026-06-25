# Design heuristics — Streakly

Taste settings for this project, locked via /design-explore. Direction is settled: calm, dark, single-column, flame-motif accent.

| Dimension | Setting | Note |
|-----------|---------|------|
| Variance | Low | One layout idea, executed cleanly — not a gallery of options |
| Motion | Minimal | Only the flame "pop" on streak increment; layout never animates |
| Contrast | Medium-high | Streak count dominates; chrome recedes |
| Color economy | Tight | One accent (flame); success/danger reserved, never decorative |
| Density | Low | One habit per card, generous vertical rhythm |
| Personality | Quietly motivating | Encouraging, never gamified-loud |

Affordance rules:
- Completed-today uses `--color-success`; a broken streak uses `--color-danger`. Neither borrows `--color-accent`.
- The flame and the primary CTA share `--color-accent` (rest) / `--color-accent-press` (interaction).
