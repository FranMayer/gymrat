import type { WorkoutSession } from '../entities';
import type { PostWorkoutSummary, SessionComparison, MuscleBreakdown } from '../entities';

function calculateTotalVolume(session: WorkoutSession): number {
  return session.entries.reduce(
    (sum, e) =>
      sum +
      e.sets.reduce((s, set) => s + set.weightKg * set.reps, 0),
    0
  );
}

function calculateTotalSets(session: WorkoutSession): number {
  return session.entries.reduce((sum, e) => sum + e.sets.length, 0);
}

function calculateTotalReps(session: WorkoutSession): number {
  return session.entries.reduce(
    (sum, e) => sum + e.sets.reduce((s, set) => s + set.reps, 0),
    0
  );
}

function safeDeltaPct(current: number, previous: number | undefined): number | undefined {
  if (previous === undefined || previous <= 0) return undefined;
  return (current - previous) / previous;
}

export class SummaryEngine {
  generate(
    session: WorkoutSession,
    previousSession: WorkoutSession | null
  ): PostWorkoutSummary {
    const totalVolume = calculateTotalVolume(session);
    const totalSets = calculateTotalSets(session);
    const totalReps = calculateTotalReps(session);

    const prevVolume = previousSession ? calculateTotalVolume(previousSession) : undefined;
    const prevReps = previousSession ? calculateTotalReps(previousSession) : undefined;

    const comparison: SessionComparison = {
      hasPrevious: !!previousSession,
      previousDate: previousSession?.date,
      volumeDeltaPct: safeDeltaPct(totalVolume, prevVolume),
      repsDeltaPct: safeDeltaPct(totalReps, prevReps),
    };

    const mainMuscles: MuscleBreakdown[] = []; // Para futura ampliación con catálogo muscular

    const recommendation = this.buildRecommendation(
      totalVolume,
      totalReps,
      comparison
    );

    return {
      sessionId: session.id,
      routineId: session.routineId,
      routineDayId: session.routineDayId,
      date: session.date,
      totalVolume,
      totalSets,
      totalReps,
      mainMuscles,
      comparison,
      recommendation,
    };
  }

  private buildRecommendation(
    totalVolume: number,
    totalReps: number,
    comparison: SessionComparison
  ): PostWorkoutSummary['recommendation'] {
    if (!comparison.hasPrevious || comparison.volumeDeltaPct === undefined) {
      return {
        type: 'keep_pushing',
        messageKey: 'summary.keep_pushing',
      };
    }

    const volDelta = comparison.volumeDeltaPct;
    if (volDelta >= 0.05) {
      return {
        type: 'keep_pushing',
        messageKey: 'summary.keep_pushing_progress',
        params: { volumeDeltaPct: volDelta },
      };
    }

    if (volDelta <= -0.05) {
      return {
        type: 'consider_deload',
        messageKey: 'summary.consider_deload',
        params: { volumeDeltaPct: volDelta },
      };
    }

    return {
      type: 'keep_pushing',
      messageKey: 'summary.keep_steady',
      params: { volume: totalVolume, reps: totalReps },
    };
  }
}

