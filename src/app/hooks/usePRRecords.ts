import { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/app/AppContext';
import type { ExercisePR, WeeklyVolumePR } from '@/domain/entities';

export type PRByExerciseId = Record<string, ExercisePR[]>;

export interface UsePRRecordsState {
  loading: boolean;
  error: string | null;
  prsByExercise: PRByExerciseId;
  weeklyVolumePR: WeeklyVolumePR | null;
}

export function usePRRecords(): UsePRRecordsState {
  const { prRepo } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exercisePRs, setExercisePRs] = useState<ExercisePR[]>([]);
  const [weekly, setWeekly] = useState<WeeklyVolumePR | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [prs, weeklyPR] = await Promise.all([
          prRepo.getExercisePRs(),
          prRepo.getWeeklyVolumePR(),
        ]);
        if (!cancelled) {
          setExercisePRs(prs);
          setWeekly(weeklyPR);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error cargando PRs');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [prRepo]);

  const prsByExercise = useMemo<PRByExerciseId>(() => {
    const grouped: PRByExerciseId = {};
    for (const pr of exercisePRs) {
      if (!grouped[pr.exerciseId]) grouped[pr.exerciseId] = [];
      grouped[pr.exerciseId].push(pr);
    }
    return grouped;
  }, [exercisePRs]);

  return { loading, error, prsByExercise, weeklyVolumePR: weekly };
}
