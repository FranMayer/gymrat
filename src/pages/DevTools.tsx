import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import {
  getOrCreateProfile,
  generateAndSaveRoutine,
  devResetDatabase,
  insertMockProgress,
  simulatePerformanceChange,
} from '@/usecases';
import { IS_DEV } from '@/lib';
import { prettyPrintJSON, logger } from '@/lib';
import type { UserProfile } from '@/domain/entities';
import type { Routine } from '@/domain/entities';
import type { WorkoutSession } from '@/domain/entities';
import styles from './DevTools.module.css';

export function DevTools() {
  const navigate = useNavigate();
  const { userProfileRepo, routineRepo, workoutLogRepo, routineGenerator, userSettingsRepo } =
    useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lastRoutine, setLastRoutine] = useState<Routine | null>(null);
  const [lastSession, setLastSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { profile: p } = await getOrCreateProfile(userProfileRepo);
      setProfile(p);
      const routines = await routineRepo.getAll();
      setLastRoutine(routines[0] ?? null);
      const sessions = await workoutLogRepo.getSessionsByDateRange('2000-01-01', '2100-12-31');
      setLastSession(sessions[0] ?? null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      logger.error('DevTools load error:', e);
    }
  }, [userProfileRepo, routineRepo, workoutLogRepo]);

  useEffect(() => {
    if (IS_DEV) load();
  }, [IS_DEV, load]);

  const run = async (label: string, fn: () => Promise<void>) => {
    setLoading(label);
    setError(null);
    try {
      await fn();
      logger.info(`DevTools: ${label} OK`);
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      logger.error(`DevTools ${label} error:`, e);
    } finally {
      setLoading(null);
    }
  };

  if (!IS_DEV) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className={styles.page}>
      <h1>DevTools</h1>
      <section className={styles.section}>
        <h2>Perfil actual</h2>
        <pre className={styles.pre}>{profile ? prettyPrintJSON(profile) : '—'}</pre>
      </section>
      <section className={styles.section}>
        <h2>Última rutina</h2>
        <pre className={styles.pre}>
          {lastRoutine ? prettyPrintJSON(lastRoutine) : '—'}
        </pre>
      </section>
      <section className={styles.section}>
        <h2>Último WorkoutLog</h2>
        <pre className={styles.pre}>
          {lastSession ? prettyPrintJSON(lastSession) : '—'}
        </pre>
      </section>
      {error && <p className={styles.error}>{error}</p>}
      <section className={styles.section}>
        <h2>Acciones</h2>
        <button
          type="button"
          className={styles.dangerButton}
          onClick={() =>
            run('Reset DB', () =>
              devResetDatabase(userProfileRepo, routineRepo, workoutLogRepo)
            )
          }
          disabled={loading !== null}
        >
          Resetear base de datos
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() =>
            run('Regenerar rutina', async () => {
              const objective = profile?.objective ?? 'tonificar';
              const level = profile?.level ?? 'principiante';
              await generateAndSaveRoutine(
                routineGenerator,
                routineRepo,
                userSettingsRepo,
                { objective, level, daysPerWeek: 4 }
              );
            })
          }
          disabled={loading !== null}
        >
          {loading === 'Regenerar rutina' ? '…' : 'Regenerar rutina manualmente'}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() =>
            run('Insertar mock', () =>
              insertMockProgress(routineRepo, workoutLogRepo, { sessionsCount: 3 })
            )
          }
          disabled={loading !== null}
        >
          {loading === 'Insertar mock' ? '…' : 'Insertar datos mock'}
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() =>
            run('Simular aumento', () =>
              simulatePerformanceChange(routineRepo, workoutLogRepo, {
                trend: 'up',
                sessionsCount: 4,
              })
            )
          }
          disabled={loading !== null}
        >
          Simular aumento de rendimiento
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={() =>
            run('Simular disminución', () =>
              simulatePerformanceChange(routineRepo, workoutLogRepo, {
                trend: 'down',
                sessionsCount: 4,
              })
            )
          }
          disabled={loading !== null}
        >
          Simular disminución de rendimiento
        </button>
      </section>
    </div>
  );
}
