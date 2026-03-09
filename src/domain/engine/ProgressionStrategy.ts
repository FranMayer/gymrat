/**
 * Estrategia de progresión de peso según el último entrenamiento.
 * Reglas: completar reps → +2.5%; superar reps → +5%; fallo 1-2 reps → mantener; fallo fuerte → -2%.
 */

import type { WorkoutLogEntry } from '../entities';

export interface IProgressionStrategy {
  calculateNextWeight(
    lastEntry: WorkoutLogEntry | null,
    targetReps: number,
    defaultWeightKg?: number | null
  ): number | null;
}

/**
 * Obtiene el peso de trabajo usado (mayor peso en los sets).
 */
function getCurrentWeight(entry: WorkoutLogEntry): number {
  if (entry.sets.length === 0) return 0;
  return Math.max(...entry.sets.map((s) => s.weightKg));
}

/**
 * Menor reps conseguidas en un set (set limitante).
 */
function getMinReps(entry: WorkoutLogEntry): number {
  if (entry.sets.length === 0) return 0;
  return Math.min(...entry.sets.map((s) => s.reps));
}

/**
 * Mayor reps conseguidas en un set (para ver si superó objetivo).
 */
function getMaxReps(entry: WorkoutLogEntry): number {
  if (entry.sets.length === 0) return 0;
  return Math.max(...entry.sets.map((s) => s.reps));
}

/**
 * Implementación por defecto de ProgressionStrategy.
 */
export class DefaultProgressionStrategy implements IProgressionStrategy {
  private static readonly COMPLETED_MULTIPLIER = 1.025;
  private static readonly EXCEEDED_MULTIPLIER = 1.05;
  private static readonly FAILED_BADLY_MULTIPLIER = 0.98;

  calculateNextWeight(
    lastEntry: WorkoutLogEntry | null,
    targetReps: number,
    defaultWeightKg?: number | null
  ): number | null {
    if (!lastEntry || lastEntry.sets.length === 0) {
      return defaultWeightKg ?? null;
    }

    const currentWeight = getCurrentWeight(lastEntry);
    if (currentWeight <= 0) return defaultWeightKg ?? null;

    const minReps = getMinReps(lastEntry);
    const maxReps = getMaxReps(lastEntry);

    if (minReps >= targetReps) {
      if (maxReps > targetReps) {
        return this.roundWeight(currentWeight * DefaultProgressionStrategy.EXCEEDED_MULTIPLIER);
      }
      return this.roundWeight(currentWeight * DefaultProgressionStrategy.COMPLETED_MULTIPLIER);
    }

    const repsShort = targetReps - minReps;
    if (repsShort <= 2) {
      return this.roundWeight(currentWeight);
    }

    return this.roundWeight(currentWeight * DefaultProgressionStrategy.FAILED_BADLY_MULTIPLIER);
  }

  private roundWeight(kg: number): number {
    return Math.round(kg * 2) / 2;
  }
}
