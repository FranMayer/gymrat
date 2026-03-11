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
  /** Días de entrenamiento por semana. Controla el split de la rutina. */
  daysPerWeek: 3 | 4 | 5 | 6;
}

type DayTemplate = { name: string; muscleGroups: string[] };

const DAY_TEMPLATES_3: DayTemplate[] = [
  // Push / Pull / Legs
  { name: 'Día A - Push (pecho / hombros / tríceps)', muscleGroups: ['pectorales', 'hombros', 'tríceps'] },
  { name: 'Día B - Pull (espalda / bíceps / core)', muscleGroups: ['espalda', 'bíceps', 'core'] },
  { name: 'Día C - Piernas y core', muscleGroups: ['piernas', 'core'] },
];

const DAY_TEMPLATES_4: DayTemplate[] = [
  // Pecho+Tríceps / Espalda+Bíceps / Piernas / Hombros+Core
  { name: 'Día A - Pecho y tríceps', muscleGroups: ['pectorales', 'tríceps'] },
  { name: 'Día B - Espalda y bíceps', muscleGroups: ['espalda', 'bíceps'] },
  { name: 'Día C - Piernas y core', muscleGroups: ['piernas', 'core'] },
  { name: 'Día D - Hombros y core', muscleGroups: ['hombros', 'core'] },
];

const DAY_TEMPLATES_5: DayTemplate[] = [
  // Pecho / Espalda / Piernas / Hombros / Brazos+Core
  { name: 'Día 1 - Pecho', muscleGroups: ['pectorales', 'tríceps'] },
  { name: 'Día 2 - Espalda', muscleGroups: ['espalda', 'bíceps'] },
  { name: 'Día 3 - Piernas', muscleGroups: ['piernas', 'core'] },
  { name: 'Día 4 - Hombros', muscleGroups: ['hombros', 'core'] },
  { name: 'Día 5 - Brazos y core', muscleGroups: ['bíceps', 'tríceps', 'core'] },
];

const DAY_TEMPLATES_6: DayTemplate[] = [
  // Push A / Pull A / Legs A / Push B / Pull B / Legs B
  { name: 'Día 1 - Push A', muscleGroups: ['pectorales', 'hombros', 'tríceps'] },
  { name: 'Día 2 - Pull A', muscleGroups: ['espalda', 'bíceps', 'core'] },
  { name: 'Día 3 - Piernas A', muscleGroups: ['piernas', 'core'] },
  { name: 'Día 4 - Push B', muscleGroups: ['pectorales', 'hombros', 'tríceps'] },
  { name: 'Día 5 - Pull B', muscleGroups: ['espalda', 'bíceps', 'core'] },
  { name: 'Día 6 - Piernas B', muscleGroups: ['piernas', 'core'] },
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
    const { profile, exerciseCatalog, lastEntryByExercise, name, daysPerWeek } = input;
    const volume = this.volumeStrategy.getVolume(profile.objective, profile.level);
    const normalizedDays: 3 | 4 | 5 | 6 =
      daysPerWeek === 3 || daysPerWeek === 4 || daysPerWeek === 5 || daysPerWeek === 6
        ? daysPerWeek
        : 4;

    let templates: DayTemplate[];
    switch (normalizedDays) {
      case 3:
        templates = DAY_TEMPLATES_3;
        break;
      case 4:
        templates = DAY_TEMPLATES_4;
        break;
      case 5:
        templates = DAY_TEMPLATES_5;
        break;
      case 6:
        templates = DAY_TEMPLATES_6;
        break;
      default:
        templates = DAY_TEMPLATES_4;
        break;
    }

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

      // Garantizar entre 4 y 7 ejercicios por día siempre que el catálogo lo permita
      let normalizedExercises = exercises;
      if (normalizedExercises.length > 7) {
        normalizedExercises = normalizedExercises.slice(0, 7);
      }

      return {
        id: dayId,
        name: tpl.name,
        order: dayIndex,
        exercises: normalizedExercises,
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
