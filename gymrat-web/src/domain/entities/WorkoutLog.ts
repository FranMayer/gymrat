/**
 * Entidades: registros de entrenamiento.
 */

export interface WorkoutLogSet {
  setNumber: number;
  reps: number;
  weightKg: number;
}

export interface WorkoutLogEntry {
  id: string;
  routineId: string;
  routineDayId: string;
  exerciseId: string;
  exerciseName: string;
  sets: WorkoutLogSet[];
  date: string;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineDayId: string;
  date: string;
  entries: WorkoutLogEntry[];
}
