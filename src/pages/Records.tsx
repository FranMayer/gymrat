import { usePRRecords } from '@/app/hooks';
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
  const { loading, error, prsByExercise, weeklyVolumePR } = usePRRecords();

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
