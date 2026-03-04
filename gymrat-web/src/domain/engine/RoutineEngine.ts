/**
 * Motor de rutinas: genera una Routine usando VolumeStrategy y ProgressionStrategy
 * más historial de WorkoutLog. Desacoplado de repos e infra.
 */

import type { Routine, RoutineDay, RoutineExercise } from '../entities';
import type { UserProfile } from '../entities';
import type { WorkoutLogEntry } from '../entities';
import type { IVolumeStrategy } from './VolumeStrategy';
import type { IProgressionStrategy } from './ProgressionStrategy';

/** Entrada mínima de ejercicio para el catálogo (evita acoplar dominio a infra). */
export interface CatalogExercise {
  id: string;
  name: string;
  muscleGroup: string;
}

export interface RoutineEngineInput {
  profile: UserProfile;
  exerciseCatalog: CatalogExercise[];
  /** Última entrada de entrenamiento por exerciseId (la más reciente por ejercicio). */
  lastEntryByExercise: Map<string, WorkoutLogEntry>;
  /** Nombre opcional para la rutina. */
  name?: string;
}

const DAY_TEMPLATES_3: { name: string; muscleGroups: string[] }[] = [
  { name: 'Día A - Pecho y tríceps', muscleGroups: ['pectorales', 'tríceps'] },
  { name: 'Día B - Espalda y bíceps', muscleGroups: ['espalda', 'bíceps'] },
  { name: 'Día C - Piernas y hombros', muscleGroups: ['piernas', 'hombros', 'core'] },
];

const DAY_TEMPLATES_4: { name: string; muscleGroups: string[] }[] = [
  { name: 'Día A - Pecho', muscleGroups: ['pectorales'] },
  { name: 'Día B - Espalda', muscleGroups: ['espalda'] },
  { name: 'Día C - Piernas', muscleGroups: ['piernas'] },
  { name: 'Día D - Hombros y brazos', muscleGroups: ['hombros', 'bíceps', 'tríceps', 'core'] },
];

function randomId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export class RoutineEngine {
  constructor(
    private readonly volumeStrategy: IVolumeStrategy,
    private readonly progressionStrategy: IProgressionStrategy
  ) {}

  generate(input: RoutineEngineInput): Routine {
    const { profile, exerciseCatalog, lastEntryByExercise, name } = input;
    const volume = this.volumeStrategy.getVolume(profile.objective, profile.level);
    const templates = profile.level === 'avanzado' ? DAY_TEMPLATES_4 : DAY_TEMPLATES_3;
    const exercisesPerGroup = profile.level === 'principiante' ? 2 : 3;

    const days: RoutineDay[] = templates.map((tpl, dayIndex) => {
      const dayId = randomId();
      const exercises: RoutineExercise[] = [];
      let order = 0;

      for (const muscleGroup of tpl.muscleGroups) {
        const groupExercises = exerciseCatalog
          .filter((e) => e.muscleGroup === muscleGroup)
          .slice(0, exercisesPerGroup);

        for (const ex of groupExercises) {
          const lastEntry = lastEntryByExercise.get(ex.id) ?? null;
          const suggestedWeightKg = this.progressionStrategy.calculateNextWeight(
            lastEntry,
            volume.reps,
            null
          );

          exercises.push({
            exerciseId: ex.id,
            name: ex.name,
            sets: volume.sets,
            reps: volume.reps,
            suggestedWeightKg: suggestedWeightKg ?? null,
            order: order++,
          });
        }
      }

      return {
        id: dayId,
        name: tpl.name,
        order: dayIndex,
        exercises,
      };
    });

    const routineName =
      name?.trim() && name.length > 0
        ? name.trim().slice(0, 120)
        : `Rutina ${profile.objective} (${profile.level})`;

    return {
      id: randomId(),
      name: routineName,
      objective: profile.objective,
      level: profile.level,
      days,
      createdAt: new Date().toISOString(),
    };
  }
}
