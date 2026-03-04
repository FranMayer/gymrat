/**
 * Entidad: Registro de un entrenamiento realizado.
 * Almacena peso real, repeticiones y fecha por ejercicio/serie.
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
  /** Fecha del entrenamiento (ISO string) */
  date: string;
  /** Notas opcionales */
  notes?: string;
}

/** Agrupación por sesión de entrenamiento (una fecha, un día de rutina) */
export interface WorkoutSession {
  id: string;
  routineId: string;
  routineDayId: string;
  date: string;
  entries: WorkoutLogEntry[];
}
