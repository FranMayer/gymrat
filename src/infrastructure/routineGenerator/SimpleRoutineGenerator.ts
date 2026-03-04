/**
 * Motor de generación de rutinas con reglas simples (sin IA).
 * Asigna días por grupo muscular y series/repeticiones según objetivo y nivel.
 * Reglas alineadas con enfoque por objetivo (ver comentarios por objetivo).
 * Extensible: se puede sustituir por un servicio que use IA o reglas más complejas.
 */

import type { Objective, Level } from '@/domain/entities';
import type { Routine, RoutineDay, RoutineExercise } from '@/domain/entities';
import type { GenerateRoutineInput, IRoutineGenerator } from '@/domain/services/IRoutineGenerator';
import { EXERCISE_CATALOG } from './exerciseCatalog';

const OBJECTIVES: Objective[] = ['tonificar', 'adelgazar', 'ganar_masa'];
const LEVELS: Level[] = ['principiante', 'intermedio', 'avanzado'];

/**
 * Configuración de series x reps por objetivo y nivel.
 * - ganar_masa: 4–5 series, 6–8 reps → peso alto.
 * - tonificar: 3–4 series, 10–12 reps → volumen.
 * - adelgazar: 3 series, 12–15 reps → resistencia (+ cardio recomendado fuera del generador).
 */
const SETS_REPS: Record<Objective, Record<Level, { sets: number; reps: number }>> = {
  ganar_masa: {
    principiante: { sets: 4, reps: 8 },
    intermedio: { sets: 4, reps: 7 },
    avanzado: { sets: 5, reps: 6 },
  },
  tonificar: {
    principiante: { sets: 3, reps: 12 },
    intermedio: { sets: 4, reps: 11 },
    avanzado: { sets: 4, reps: 10 },
  },
  adelgazar: {
    principiante: { sets: 3, reps: 15 },
    intermedio: { sets: 3, reps: 14 },
    avanzado: { sets: 3, reps: 12 },
  },
};

/** Plantillas de días: grupos musculares por día (para rutina 3 días) */
const DAY_TEMPLATES_3: { name: string; muscleGroups: string[] }[] = [
  { name: 'Día A - Pecho y tríceps', muscleGroups: ['pectorales', 'tríceps'] },
  { name: 'Día B - Espalda y bíceps', muscleGroups: ['espalda', 'bíceps'] },
  { name: 'Día C - Piernas y hombros', muscleGroups: ['piernas', 'hombros', 'core'] },
];

/** Para nivel avanzado, 4 días */
const DAY_TEMPLATES_4: { name: string; muscleGroups: string[] }[] = [
  { name: 'Día A - Pecho', muscleGroups: ['pectorales'] },
  { name: 'Día B - Espalda', muscleGroups: ['espalda'] },
  { name: 'Día C - Piernas', muscleGroups: ['piernas'] },
  { name: 'Día D - Hombros y brazos', muscleGroups: ['hombros', 'bíceps', 'tríceps', 'core'] },
];

function randomId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Valida que objective y level sean valores permitidos; evita datos inseguros o inesperados. */
function validateInput(input: GenerateRoutineInput): { objective: Objective; level: Level } {
  const objective = OBJECTIVES.includes(input.objective) ? input.objective : 'tonificar';
  const level = LEVELS.includes(input.level) ? input.level : 'principiante';
  return { objective, level };
}

export class SimpleRoutineGenerator implements IRoutineGenerator {
  async generate(input: GenerateRoutineInput): Promise<Routine> {
    const { objective, level } = validateInput(input);
    const name = typeof input.name === 'string' && input.name.trim().length > 0
      ? input.name.trim().slice(0, 120)
      : undefined;
    const { sets, reps } = SETS_REPS[objective][level];
    const templates = level === 'avanzado' ? DAY_TEMPLATES_4 : DAY_TEMPLATES_3;
    const exercisesPerGroup = level === 'principiante' ? 2 : level === 'intermedio' ? 3 : 3;

    const days: RoutineDay[] = templates.map((tpl, dayIndex) => {
      const dayId = randomId();
      const exercises: RoutineExercise[] = [];
      let order = 0;
      for (const mg of tpl.muscleGroups) {
        const groupExercises = EXERCISE_CATALOG.filter((e) => e.muscleGroup === mg).slice(
          0,
          exercisesPerGroup
        );
        for (const ex of groupExercises) {
          exercises.push({
            exerciseId: ex.id,
            name: ex.name,
            sets,
            reps,
            suggestedWeightKg: null,
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

    const routine: Routine = {
      id: randomId(),
      name: name ?? `Rutina ${objective} (${level})`,
      objective,
      level,
      days,
      createdAt: new Date().toISOString(),
    };
    return routine;
  }
}

