import type { IRoutineGenerator } from '@/domain/services/IRoutineGenerator';
import type { IRoutineRepository } from '@/domain/repositories';
import type { Objective, Level } from '@/domain/entities';

export interface GenerateAndSaveRoutineInput {
  objective: Objective;
  level: Level;
  name?: string;
}

export interface GenerateAndSaveRoutineOutput {
  routineId: string;
}

export async function generateAndSaveRoutine(
  generator: IRoutineGenerator,
  routineRepo: IRoutineRepository,
  input: GenerateAndSaveRoutineInput
): Promise<GenerateAndSaveRoutineOutput> {
  const routine = await generator.generate({
    objective: input.objective,
    level: input.level,
    name: input.name,
  });
  await routineRepo.save(routine);
  return { routineId: routine.id };
}
