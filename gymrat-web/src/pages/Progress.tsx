import { useStreakState } from '@/app/hooks';
import { nextThreshold } from '@/app/hooks/streakLevels';
import styles from './Progress.module.css';

function formatDate(s: string | null) {
  if (!s) return '—';
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

function levelLabel(level: string): string {
  switch (level) {
    case 'Rat':
      return 'Rat';
    case 'AlphaRat':
      return 'Alpha Rat';
    case 'WarRat':
      return 'War Rat';
    case 'ApexRat':
      return 'Apex Rat';
    default:
      return level;
  }
}

export function Progress() {
  const { loading, error, state, level, progressPct } = useStreakState();
  const next = nextThreshold(state?.currentStreakDays ?? 0);

  if (loading) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>Progress</h1>
        <p className={styles.secondary}>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrap}>
        <h1 className={styles.title}>Progress</h1>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  const current = state?.currentStreakDays ?? 0;
  const longest = state?.longestStreakDays ?? 0;

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Progress</h1>

      <section className={styles.streakSection}>
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{current}</span>
            <span className={styles.statLabel}>Racha actual (días)</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{longest}</span>
            <span className={styles.statLabel}>Racha más larga</span>
          </div>
        </div>
        {state?.lastTrainingDate != null && (
          <p className={styles.lastDate}>Último entrenamiento: {formatDate(state.lastTrainingDate)}</p>
        )}
      </section>

      <section className={styles.levelSection}>
        <h2 className={styles.sectionTitle}>Nivel</h2>
        <div className={`${styles.badge} ${styles[`badge-${level}`]}`}>
          {levelLabel(level)}
        </div>
        {level !== 'ApexRat' && (
          <>
            <p className={styles.nextLevel}>
              Siguiente: {levelLabel(next.level)} a {next.minDays} días
            </p>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.round(progressPct * 100)}%` }}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
