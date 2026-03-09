export type PRMetricType = 'max_weight' | 'max_reps' | 'max_volume' | 'weekly_volume';

export interface ExercisePR {
  id: string;
  exerciseId: string;
  metric: Exclude<PRMetricType, 'weekly_volume'>;
  value: number;
  date: string;
  workoutLogEntryId: string;
}

export interface WeeklyVolumePR {
  id: string;
  weekStart: string;
  totalVolume: number;
}

export interface StreakState {
  currentStreakDays: number;
  longestStreakDays: number;
  lastTrainingDate: string | null;
}

export type RecommendationType =
  | 'keep_pushing'
  | 'consider_deload'
  | 'focus_weak_muscle'
  | 'increase_volume'
  | 'reduce_volume';

export interface MuscleBreakdown {
  muscleGroup: string;
  volume: number;
  percentage: number;
}

export interface SessionComparison {
  hasPrevious: boolean;
  previousDate?: string;
  volumeDeltaPct?: number;
  repsDeltaPct?: number;
}

export interface PostWorkoutSummary {
  sessionId: string;
  routineId: string;
  routineDayId: string;
  date: string;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  mainMuscles: MuscleBreakdown[];
  comparison: SessionComparison;
  recommendation: {
    type: RecommendationType;
    messageKey: string;
    params?: Record<string, unknown>;
  };
}

export interface UserSettings {
  aggressionMode: boolean;
}

