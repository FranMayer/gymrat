/**
 * Puerto: contrato para persistencia de registros de entrenamiento.
 */

import type { WorkoutLogEntry, WorkoutSession } from '../entities';

export interface IWorkoutLogRepository {
  saveEntry(entry: WorkoutLogEntry): Promise<void>;
  getEntriesByExercise(exerciseId: string): Promise<WorkoutLogEntry[]>;
  getSessionsByDateRange(from: string, to: string): Promise<WorkoutSession[]>;
  getEntriesByRoutineDay(routineDayId: string, date: string): Promise<WorkoutLogEntry[]>;
  /** Borra todos los registros de entrenamiento (útil para reset en dev). */
  clearAll(): Promise<void>;
}
