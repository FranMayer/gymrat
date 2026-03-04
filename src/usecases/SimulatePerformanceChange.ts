/**
 * Caso de uso (dev): inserta sesiones mock que simulan mejora o empeoramiento de rendimiento.
 * Aumento: pesos crecientes en el tiempo. Disminución: pesos decrecientes.
 */

import type { WorkoutLogSet } from '@/domain/entities';
import type { IRoutineRepository, IWorkoutLogRepository } from '@/domain/repositories';

export type PerformanceTrend = 'up' | 'down';

export interface SimulatePerformanceChangeInput {
  trend: PerformanceTrend;
  /** Número de sesiones a generar (cada una con peso mayor o menor que la anterior) */
  sessionsCount?: number;
}

function dateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function simulatePerformanceChange(
  routineRepo: IRoutineRepository,
  workoutLogRepo: IWorkoutLogRepository,
  input: SimulatePerformanceChangeInput
): Promise<void> {
  const routines = await routineRepo.getAll();
  const routine = routines[0];
  if (!routine || routine.days.length === 0) return;
  const day = routine.days[0];
  const count = input.sessionsCount ?? 4;
  const baseWeight = 20;
  const step = 2.5;
  for (let s = 0; s < count; s++) {
    const date = dateDaysAgo(s);
    const weightOffset = input.trend === 'up' ? s * step : -s * step;
    const weight = Math.max(5, baseWeight + weightOffset);
    for (const ex of day.exercises) {
      const sets: WorkoutLogSet[] = [
        { setNumber: 1, reps: ex.reps, weightKg: weight },
        { setNumber: 2, reps: ex.reps - 1, weightKg: weight - 1 },
        { setNumber: 3, reps: ex.reps - 2, weightKg: weight - 2 },
      ];
      await workoutLogRepo.saveEntry({
        id: `sim_${input.trend}_${ex.exerciseId}_${date}_${s}_${Date.now()}`,
        routineId: routine.id,
        routineDayId: day.id,
        exerciseId: ex.exerciseId,
        exerciseName: ex.name,
        sets,
        date,
      });
    }
  }
}
