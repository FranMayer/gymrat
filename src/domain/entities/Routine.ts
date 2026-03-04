/**
 * Entidades relacionadas con rutinas generadas y ejercicios.
 */

import type { Objective, Level } from './types';

/** Un ejercicio dentro de un día de rutina */
export interface RoutineExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  /** Peso sugerido en kg (placeholder hasta tener lógica avanzada) */
  suggestedWeightKg: number | null;
  /** Orden dentro del día */
  order: number;
}

/** Un día de la rutina (ej: "Día A - Pecho y tríceps") */
export interface RoutineDay {
  id: string;
  name: string;
  order: number;
  exercises: RoutineExercise[];
}

/** Rutina completa generada */
export interface Routine {
  id: string;
  name: string;
  objective: Objective;
  level: Level;
  days: RoutineDay[];
  /** Fecha de creación (ISO string) */
  createdAt: string;
}
