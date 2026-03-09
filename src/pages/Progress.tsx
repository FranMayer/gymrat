import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStreakState, useExerciseProgress } from '@/app/hooks';
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
  const { loading, error, state, level, progressPct, reset } = useStreakState();
  const {
    loading: chartLoading,
    error: chartError,
    series,
  } = useExerciseProgress();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [metric, setMetric] = useState<'maxWeight' | 'totalVolume' | 'maxReps'>('maxWeight');

  useEffect(() => {
    if (!selectedExerciseId && series.length > 0) {
      setSelectedExerciseId(series[0].exerciseId);
    }
  }, [series, selectedExerciseId]);

  const currentSeries =
    selectedExerciseId != null ? series.find((s) => s.exerciseId === selectedExerciseId) : undefined;
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
      <button
        type="button"
        className={styles.resetButton}
        onClick={async () => {
          if (window.confirm('¿Resetear racha y empezar de cero?')) {
            await reset();
          }
        }}
      >
        Resetear racha
      </button>
      <section className={styles.chartSection}>
        <h2 className={styles.sectionTitle}>Gráficos de progreso por ejercicio</h2>
        {chartError && <p className={styles.error}>{chartError}</p>}
        {chartLoading && !currentSeries && !chartError && (
          <p className={styles.secondary}>Cargando datos de entrenamientos...</p>
        )}
        {!chartLoading && series.length === 0 && !chartError && (
          <p className={styles.secondary}>
            Aún no hay datos suficientes. Registra algunos entrenamientos para ver los gráficos.
          </p>
        )}
        {currentSeries && (
          <>
            <div className={styles.chartControls}>
              <label className={styles.dropdownLabel}>
                Ejercicio
                <select
                  className={styles.dropdown}
                  value={selectedExerciseId ?? ''}
                  onChange={(e) => setSelectedExerciseId(e.target.value || null)}
                >
                  {series.map((s) => (
                    <option key={s.exerciseId} value={s.exerciseId}>
                      {s.exerciseName} ({s.sessionsCount})
                    </option>
                  ))}
                </select>
              </label>
              <div className={styles.metricChips}>
                <button
                  type="button"
                  className={
                    metric === 'maxWeight' ? styles.metricChipActive : styles.metricChip
                  }
                  onClick={() => setMetric('maxWeight')}
                >
                  Peso máx
                </button>
                <button
                  type="button"
                  className={
                    metric === 'totalVolume' ? styles.metricChipActive : styles.metricChip
                  }
                  onClick={() => setMetric('totalVolume')}
                >
                  Volumen
                </button>
                <button
                  type="button"
                  className={
                    metric === 'maxReps' ? styles.metricChipActive : styles.metricChip
                  }
                  onClick={() => setMetric('maxReps')}
                >
                  Reps máx
                </button>
              </div>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={currentSeries.points}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232327" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) =>
                      new Date(d).toLocaleDateString(undefined, { month: 'short', day: '2-digit' })
                    }
                    stroke="#6b7280"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#6b7280"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) =>
                      metric === 'totalVolume' ? v.toLocaleString() : String(v)
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: 6,
                      color: '#e5e7eb',
                      fontSize: 12,
                    }}
                    labelFormatter={(d) =>
                      new Date(d as string).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                      })
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey={
                      metric === 'maxWeight'
                        ? 'maxWeight'
                        : metric === 'totalVolume'
                        ? 'totalVolume'
                        : 'maxReps'
                    }
                    stroke="#f87171"
                    strokeWidth={2}
                    dot={{ r: 3, stroke: '#fca5a5', strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
