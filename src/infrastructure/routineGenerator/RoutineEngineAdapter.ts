/**
 * Adaptador que implementa IRoutineGenerator usando RoutineEngine.
 * Obtiene perfil e historial de logs y delega la generación al engine.
 */

import type { UserProfile } from '@/domain/entities';
import type { IUserProfileRepository, IWorkoutLogRepository } from '@/domain/repositories';
import type { IRoutineGenerator } from '@/domain/services/IRoutineGenerator';
import type { Routine } from '@/domain/entities';
import type { RoutineEngine, CatalogExercise } from '@/domain/engine';

export class RoutineEngineAdapter implements IRoutineGenerator {
  constructor(
    private readonly engine: RoutineEngine,
    private readonly exerciseCatalog: CatalogExercise[],
    private readonly userProfileRepo: IUserProfileRepository,
    private readonly workoutLogRepo: IWorkoutLogRepository
  ) {}

  async generate(input: Parameters<IRoutineGenerator['generate']>[0]): Promise<Routine> {
    let profile = await this.userProfileRepo.get();
    if (!profile) {
      profile = this.defaultProfileFromInput(input);
    }

    const lastEntryByExercise = await this.workoutLogRepo.getLastEntryPerExercise();

    return this.engine.generate({
      profile,
      exerciseCatalog: this.exerciseCatalog,
      lastEntryByExercise,
      name: input.name,
      daysPerWeek: input.daysPerWeek,
    });
  }

  private defaultProfileFromInput(input: Parameters<IRoutineGenerator['generate']>[0]): UserProfile {
    return {
      id: 'default_profile',
      age: 25,
      sex: 'otro',
      heightCm: 170,
      weightKg: 70,
      objective: input.objective,
      level: input.level,
      updatedAt: new Date().toISOString(),
    };
  }
}
