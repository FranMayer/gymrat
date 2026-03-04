/**
 * Claves de localStorage para persistencia.
 * Separadas por entidad para evitar colisiones.
 */

export const STORAGE_KEYS = {
  user: 'gymrat_user',
  routines: 'gymrat_routines',
  workoutLogs: 'gymrat_workout_logs',
  exercisePRs: 'gymrat_exercise_prs',
  weeklyVolumePR: 'gymrat_weekly_volume_pr',
  streakState: 'gymrat_streak_state',
  userSettings: 'gymrat_user_settings',
} as const;
