/**
 * Entidades: rutinas y ejercicios.
 */

import type { Objective, Level } from './types';

export interface RoutineExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps: number;
  suggestedWeightKg: number | null;
  order: number;
}

export interface RoutineDay {
  id: string;
  name: string;
  order: number;
  exercises: RoutineExercise[];
}

export interface Routine {
  id: string;
  name: string;
  objective: Objective;
  level: Level;
  days: RoutineDay[];
  createdAt: string;
}
