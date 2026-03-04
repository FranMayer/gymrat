import type { Objective, Level } from '../entities';
import type { Routine } from '../entities';

export interface GenerateRoutineInput {
  objective: Objective;
  level: Level;
  name?: string;
}

export interface IRoutineGenerator {
  generate(input: GenerateRoutineInput): Promise<Routine>;
}
