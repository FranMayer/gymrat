import type { Objective, Level, Routine } from '../entities';

export interface GenerateRoutineInput {
  objective: Objective;
  level: Level;
  /** Días de entrenamiento por semana que se usarán para el split. */
  daysPerWeek: 3 | 4 | 5 | 6;
  name?: string;
}

export interface IRoutineGenerator {
  generate(input: GenerateRoutineInput): Promise<Routine>;
}
