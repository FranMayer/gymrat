import type { IRoutineGenerator } from '@/domain/services/IRoutineGenerator';
import type { IRoutineRepository, IUserSettingsRepository } from '@/domain/repositories';
import type { Objective, Level } from '@/domain/entities';

export interface GenerateAndSaveRoutineInput {
  objective: Objective;
  level: Level;
  daysPerWeek: 3 | 4 | 5 | 6;
  name?: string;
}

export interface GenerateAndSaveRoutineOutput {
  routineId: string;
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function generateAndSaveRoutine(
  generator: IRoutineGenerator,
  routineRepo: IRoutineRepository,
  userSettingsRepo: IUserSettingsRepository,
  input: GenerateAndSaveRoutineInput
): Promise<GenerateAndSaveRoutineOutput> {
  const routine = await generator.generate({
    objective: input.objective,
    level: input.level,
    daysPerWeek: input.daysPerWeek,
    name: input.name,
  });
  await routineRepo.save(routine);

  const current = await userSettingsRepo.get();
  await userSettingsRepo.save({
    aggressionMode: current?.aggressionMode ?? false,
    routineStartDate: todayISO(),
    activeRoutineId: routine.id,
  });

  return { routineId: routine.id };
}
