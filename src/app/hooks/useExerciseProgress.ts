import { useEffect, useState } from 'react';
import { useApp } from '@/app/AppContext';
import type { WorkoutSession, WorkoutLogEntry } from '@/domain/entities';

export type ExerciseMetricKey = 'maxWeight' | 'totalVolume' | 'maxReps';

export interface ExerciseMetricPoint {
  date: string;
  maxWeight: number;
  totalVolume: number;
  maxReps: number;
}

export interface ExerciseSeries {
  exerciseId: string;
  exerciseName: string;
  sessionsCount: number;
  points: ExerciseMetricPoint[];
}

export interface UseExerciseProgressState {
  loading: boolean;
  error: string | null;
  series: ExerciseSeries[];
}

function aggregateSessions(sessions: WorkoutSession[]): ExerciseSeries[] {
  const byExercise = new Map<
    string,
    { name: string; sessionsCount: number; points: ExerciseMetricPoint[] }
  >();

  const ensure = (entry: WorkoutLogEntry) => {
    const existing = byExercise.get(entry.exerciseId);
    if (existing) return existing;
    const created = {
      name: entry.exerciseName,
      sessionsCount: 0,
      points: [] as ExerciseMetricPoint[],
    };
    byExercise.set(entry.exerciseId, created);
    return created;
  };

  for (const session of sessions) {
    for (const entry of session.entries) {
      const holder = ensure(entry);
      holder.sessionsCount += 1;
      const maxWeight = entry.sets.reduce((m, s) => Math.max(m, s.weightKg), 0);
      const maxReps = entry.sets.reduce((m, s) => Math.max(m, s.reps), 0);
      const totalVolume = entry.sets.reduce(
        (sum, s) => sum + s.weightKg * s.reps,
        0
      );
      holder.points.push({
        date: session.date,
        maxWeight,
        totalVolume,
        maxReps,
      });
    }
  }

  const series: ExerciseSeries[] = [];
  byExercise.forEach((value, exerciseId) => {
    const points = [...value.points].sort((a, b) => a.date.localeCompare(b.date));
    series.push({
      exerciseId,
      exerciseName: value.name,
      sessionsCount: value.sessionsCount,
      points,
    });
  });

  return series.sort((a, b) => b.sessionsCount - a.sessionsCount);
}

export function useExerciseProgress(): UseExerciseProgressState {
  const { workoutLogRepo } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [series, setSeries] = useState<ExerciseSeries[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const sessions = await workoutLogRepo.getSessionsByDateRange(
          '2000-01-01',
          '2100-12-31'
        );
        if (!cancelled) {
          setSeries(aggregateSessions(sessions));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error cargando progreso');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [workoutLogRepo]);

  return { loading, error, series };
}

