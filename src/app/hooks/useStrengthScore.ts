import { useEffect, useState } from 'react';
import { useApp } from '@/app/AppContext';
import type { ExercisePR, UserProfile } from '@/domain/entities';

interface StrengthScoreState {
  loading: boolean;
  error: string | null;
  score: number;
}

const COMPOUND_EXERCISES = new Set<string>([
  'squat',
  'bench_press',
  'deadlift',
  'overhead_press',
]);

function computeStrengthScore(prs: ExercisePR[], profile: UserProfile | null): number {
  if (!profile || profile.weightKg <= 0) return 0;
  const bodyWeight = profile.weightKg;

  const maxByExercise = new Map<string, number>();
  for (const pr of prs) {
    if (pr.metric !== 'max_weight') continue;
    const prev = maxByExercise.get(pr.exerciseId) ?? 0;
    if (pr.value > prev) maxByExercise.set(pr.exerciseId, pr.value);
  }

  let raw = 0;
  maxByExercise.forEach((maxWeight, exerciseId) => {
    if (maxWeight <= 0) return;
    const ratio = maxWeight / bodyWeight;
    const factor = COMPOUND_EXERCISES.has(exerciseId) ? 2 : 1;
    raw += ratio * factor;
  });

  const scaled = raw * 100;
  if (!Number.isFinite(scaled) || scaled <= 0) return 0;
  return Math.max(0, Math.min(1000, Math.round(scaled)));
}

export function useStrengthScore(): StrengthScoreState {
  const { prRepo, userProfileRepo } = useApp();
  const [state, setState] = useState<StrengthScoreState>({
    loading: true,
    error: null,
    score: 0,
  });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [prs, profile] = await Promise.all([
          prRepo.getExercisePRs(),
          userProfileRepo.get(),
        ]);
        if (cancelled) return;
        const score = computeStrengthScore(prs, profile);
        setState({ loading: false, error: null, score });
      } catch (e) {
        if (cancelled) return;
        setState({
          loading: false,
          error: e instanceof Error ? e.message : 'Error calculando Strength Score',
          score: 0,
        });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [prRepo, userProfileRepo]);

  return state;
}

