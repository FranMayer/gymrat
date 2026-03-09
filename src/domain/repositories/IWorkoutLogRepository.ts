import type { WorkoutLogEntry, WorkoutSession } from '../entities';

export interface IWorkoutLogRepository {
  saveEntry(entry: WorkoutLogEntry): Promise<void>;
  getEntriesByExercise(exerciseId: string): Promise<WorkoutLogEntry[]>;
  getSessionsByDateRange(from: string, to: string): Promise<WorkoutSession[]>;
  getEntriesByRoutineDay(routineDayId: string, date: string): Promise<WorkoutLogEntry[]>;
  /** Última entrada por exerciseId (para motor de progresión). */
  getLastEntryPerExercise(): Promise<Map<string, WorkoutLogEntry>>;
  clearAll(): Promise<void>;
}
