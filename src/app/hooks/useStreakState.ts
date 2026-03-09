import { useEffect, useState } from 'react';
import { useApp } from '@/app/AppContext';
import type { StreakState } from '@/domain/entities';
import { levelForDays, progressToNextLevel } from './streakLevels';

export interface StreakVM {
  loading: boolean;
  error: string | null;
  state: StreakState | null;
  level: string;
  progressPct: number;
}

export function useStreakState(): StreakVM {
  const { streakRepo } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<StreakState | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const s = await streakRepo.get();
        if (!cancelled) setState(s);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Error cargando streak');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [streakRepo]);

  const days = state?.currentStreakDays ?? 0;
  return {
    loading,
    error,
    state,
    level: levelForDays(days),
    progressPct: progressToNextLevel(days),
  };
}
