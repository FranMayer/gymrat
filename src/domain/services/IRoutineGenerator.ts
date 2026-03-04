/**
 * Puerto: contrato del motor de generación de rutinas.
 * Permite sustituir la implementación por reglas simples, IA, etc.
 */

import type { Objective, Level } from '../entities';
import type { Routine } from '../entities';

export interface GenerateRoutineInput {
  objective: Objective;
  level: Level;
  /** Nombre opcional para la rutina */
  name?: string;
}

export interface IRoutineGenerator {
  generate(input: GenerateRoutineInput): Promise<Routine>;
}
