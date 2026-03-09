import { useApp } from '@/app/AppContext';
import { usePRRecords, useStrengthScore } from '@/app/hooks';
import type { ExercisePR } from '@/domain/entities';
import styles from './Records.module.css';

function formatDate(s: string) {
  try {
    return new Date(s).toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return s;
  }
}

function metricLabel(metric: ExercisePR['metric']) {
  switch (metric) {
    case 'max_weight':
      return 'Max peso';
    case 'max_reps':
      return 'Max reps';
    case 'max_volume':
      return 'Max volumen';
    default:
      return metric;
  }
}

export function Records() {
  const { prRepo } = useApp();
  const { loading, error, prsByExercise, weeklyVolumePR } = usePRRecords();
  const {
    loading: scoreLoading,
    error: scoreError,
    score,
  } = useStrengthScore();

  const labelForScore = (value: number): string => {
    if (value < 200) return 'Novato';
    if (value < 400) return 'Intermedio';
    if (value < 600) return 'Avanzado';
    if (value < 800) return 'Elite';
    return 'Legendario';
  };

  const thresholds = [0, 200, 400, 600, 800, 1000];
  let currentIndex = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (score >= thresholds[i]) {
      currentIndex = i;
      break;
    }
  }
  const currentMin = thresholds[currentIndex] ?? 0;
  const nextThreshold = thresholds[currentIndex + 1] ?? 1000;
  const progressToNext =
    nextThreshold > currentMin ? (score - currentMin) / (nextThreshold - currentMin) : 0;

  if (loading) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>Records</h1>
        <p className={styles.secondary}>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>Records</h1>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  const exerciseIds = Object.keys(prsByExercise);
  const empty = exerciseIds.length === 0 && !weeklyVolumePR;

  if (empty) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>Records</h1>
        <p className={styles.empty}>Aún no hay PRs. Registra entrenamientos para ver tus récords.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Records</h1>
      <section className={styles.strengthSection}>
        <div className={styles.strengthCard}>
          <div className={styles.strengthHeader}>
            <span className={styles.strengthLabelText}>Strength Score</span>
            {!scoreLoading && <span className={styles.strengthLevel}>{labelForScore(score)}</span>}
          </div>
          <div className={styles.strengthMain}>
            {scoreLoading ? (
              <span className={styles.secondary}>Calculando...</span>
            ) : scoreError ? (
              <span className={styles.error}>{scoreError}</span>
            ) : (
              <span className={styles.strengthScore}>{score}</span>
            )}
          </div>
          <div className={styles.strengthProgressBar}>
            <div
              className={styles.strengthProgressFill}
              style={{ width: `${Math.round(Math.max(0, Math.min(1, progressToNext)) * 100)}%` }}
            />
          </div>
          <div className={styles.strengthRange}>
            <span>{currentMin}</span>
            <span>{nextThreshold}</span>
          </div>
        </div>
      </section>
      <button
        type="button"
        className={styles.resetButton}
        onClick={async () => {
          const ok = window.confirm(
            '¿Resetear todos los PRs (records de ejercicios y volumen semanal)?'
          );
          if (!ok) return;
          await prRepo.clearAll();
          window.location.reload();
        }}
      >
        Resetear PRs
      </button>

      {weeklyVolumePR && (
        <section className={styles.weeklySection}>
          <h2 className={styles.sectionTitle}>PR semanal (volumen)</h2>
          <div className={styles.weeklyCard}>
            <span className={styles.weeklyValue}>{weeklyVolumePR.totalVolume.toLocaleString()}</span>
            <span className={styles.secondary}>
              kg · semana del {formatDate(weeklyVolumePR.weekStart)}
            </span>
          </div>
        </section>
      )}

      <section className={styles.listSection}>
        <h2 className={styles.sectionTitle}>Por ejercicio</h2>
        <ul className={styles.list}>
          {exerciseIds.map((exerciseId) => (
            <li key={exerciseId} className={styles.card}>
              <h3 className={styles.exerciseId}>{exerciseId}</h3>
              <ul className={styles.prList}>
                {(prsByExercise[exerciseId] ?? []).map((pr) => (
                  <li key={pr.id} className={styles.prRow}>
                    <span className={styles.metric}>{metricLabel(pr.metric)}</span>
                    <span className={styles.value}>
                      {pr.metric === 'max_reps' ? pr.value : `${pr.value} kg`}
                    </span>
                    <span className={styles.date}>{formatDate(pr.date)}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
