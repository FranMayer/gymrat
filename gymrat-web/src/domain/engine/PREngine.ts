import type { WorkoutLogEntry, WorkoutSession } from '../entities';
import type { ExercisePR, PRMetricType, WeeklyVolumePR } from '../entities';

function calculateExerciseVolume(entry: WorkoutLogEntry): number {
  return entry.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
}

function startOfWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // days since Monday
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function nextId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export class PREngine {
  evaluateExercisePRsForSession(
    session: WorkoutSession,
    existingPRs: ExercisePR[]
  ): ExercisePR[] {
    const newPRs: ExercisePR[] = [];
    const byExercise = new Map<string, ExercisePR[]>();
    for (const pr of existingPRs) {
      const list = byExercise.get(pr.exerciseId) ?? [];
      list.push(pr);
      byExercise.set(pr.exerciseId, list);
    }

    for (const entry of session.entries) {
      const existing = byExercise.get(entry.exerciseId) ?? [];
      const volume = calculateExerciseVolume(entry);
      const maxWeight = entry.sets.reduce((m, s) => Math.max(m, s.weightKg), 0);
      const maxReps = entry.sets.reduce((m, s) => Math.max(m, s.reps), 0);

      const metrics: { metric: Exclude<PRMetricType, 'weekly_volume'>; value: number }[] = [
        { metric: 'max_weight', value: maxWeight },
        { metric: 'max_reps', value: maxReps },
        { metric: 'max_volume', value: volume },
      ];

      for (const { metric, value } of metrics) {
        if (value <= 0) continue;
        const current = existing.find((p) => p.metric === metric);
        if (!current || value > current.value) {
          newPRs.push({
            id: nextId('pr'),
            exerciseId: entry.exerciseId,
            metric,
            value,
            date: entry.date,
            workoutLogEntryId: entry.id,
          });
        }
      }
    }

    return newPRs;
  }

  evaluateWeeklyVolumePRForSession(
    session: WorkoutSession,
    existingWeekly: WeeklyVolumePR | null
  ): WeeklyVolumePR | null {
    const totalVolume = session.entries.reduce(
      (sum, e) => sum + calculateExerciseVolume(e),
      0
    );
    if (totalVolume <= 0) return null;
    const weekStart = startOfWeek(session.date);
    if (!existingWeekly || totalVolume > existingWeekly.totalVolume) {
      return {
        id: existingWeekly?.id ?? nextId('wpr'),
        weekStart,
        totalVolume,
      };
    }
    return null;
  }
}

