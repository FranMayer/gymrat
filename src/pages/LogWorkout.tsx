import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import { logWorkout, finalizeWorkoutSession } from '@/usecases';
import type { Routine } from '@/domain/entities';
import type { WorkoutLogSet } from '@/domain/entities';
import styles from './LogWorkout.module.css';

export type SetInput = {
  id: string;
  weight: string;
  reps: string;
};

export type ExerciseInput = {
  exerciseId: string;
  sets: SetInput[];
};

type EntriesState = Record<string, SetInput[]>;

type ExerciseStatus = 'pending' | 'inProgress' | 'completed';

function buildInitialEntries(day: NonNullable<Routine['days'][0]>): EntriesState {
  const state: EntriesState = {};
  for (const ex of day.exercises) {
    state[ex.exerciseId] = Array.from({ length: ex.sets }, () => ({
      id: crypto.randomUUID(),
      weight: ex.suggestedWeightKg != null ? String(ex.suggestedWeightKg) : '',
      reps: ex.reps ? String(ex.reps) : '',
    }));
  }
  return state;
}

function updateSet(
  prev: EntriesState,
  exerciseId: string,
  setId: string,
  field: 'weight' | 'reps',
  value: string
): EntriesState {
  const sets = prev[exerciseId];
  if (!sets) return prev;
  return {
    ...prev,
    [exerciseId]: sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
  };
}

function getExerciseStatus(entries: EntriesState, exerciseId: string): ExerciseStatus {
  const sets = entries[exerciseId] ?? [];
  if (sets.length === 0) return 'pending';
  const withReps = sets.filter((s) => (parseInt(s.reps, 10) || 0) > 0).length;
  if (withReps === 0) return 'pending';
  if (withReps === sets.length) return 'completed';
  return 'inProgress';
}

export function LogWorkout() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const dayId = searchParams.get('dayId');
  const { routineRepo, workoutLogRepo, prRepo, streakRepo } = useApp();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [entries, setEntries] = useState<EntriesState>({});
  const exerciseCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const prevCompletedCount = useRef<number>(0);

  useEffect(() => {
    if (id) routineRepo.getById(id).then(setRoutine);
  }, [id, routineRepo]);

  const day = routine?.days.find((d) => d.id === dayId);

  useEffect(() => {
    if (!day) return;
    setEntries(buildInitialEntries(day));
  }, [day]);

  const handleUpdateSet = useCallback(
    (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
      setEntries((prev) => updateSet(prev, exerciseId, setId, field, value));
    },
    []
  );

  const handleSave = async () => {
    if (!routine || !day) return;
    setSaving(true);
    for (const ex of day.exercises) {
      const setsData = entries[ex.exerciseId] ?? [];
      const sets: WorkoutLogSet[] = setsData.map((s, i) => ({
        setNumber: i + 1,
        reps: parseInt(s.reps, 10) || 0,
        weightKg: parseFloat(s.weight) || 0,
      }));
      await logWorkout(workoutLogRepo, {
        routineId: routine.id,
        routineDayId: day.id,
        exerciseId: ex.exerciseId,
        exerciseName: ex.name,
        sets,
        date,
      });
    }
    await finalizeWorkoutSession(
      {
        workoutLogRepo,
        prRepo,
        streakRepo,
      },
      {
        routineId: routine.id,
        routineDayId: day.id,
        date,
      }
    );
    setSaving(false);
    setIsFinished(true);
  };

  if (!routine || !day) return <p>Cargando…</p>;

  const totalExercises = day.exercises.length;
  const statuses = day.exercises.map((ex) => getExerciseStatus(entries, ex.exerciseId));
  const completedExercises = statuses.filter((s) => s === 'completed').length;
  const progressPercent =
    totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  useEffect(() => {
    if (completedExercises <= prevCompletedCount.current || completedExercises >= totalExercises)
      return;
    prevCompletedCount.current = completedExercises;
    const nextPendingIndex = day.exercises.findIndex(
      (ex) => getExerciseStatus(entries, ex.exerciseId) !== 'completed'
    );
    if (nextPendingIndex === -1) return;
    const nextEx = day.exercises[nextPendingIndex];
    const el = nextEx ? exerciseCardRefs.current[nextEx.exerciseId] : null;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [completedExercises, totalExercises, entries, day.exercises]);

  useEffect(() => {
    prevCompletedCount.current = completedExercises;
  }, [day?.id]);

  return (
    <div className={styles.page}>
      <h1>Registrar entrenamiento</h1>

      {!isFinished && (
        <>
          <div className={styles.progressBlock}>
            <div className={styles.progressSummary}>
              Progreso: {completedExercises} / {totalExercises} ejercicios completados
            </div>
            <div className={styles.progressBarTrack}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${progressPercent}%` }}
                role="progressbar"
                aria-valuenow={completedExercises}
                aria-valuemin={0}
                aria-valuemax={totalExercises}
              />
            </div>
            <ul className={styles.exerciseStatusList} aria-label="Estado de ejercicios">
              {day.exercises.map((ex) => {
                const status = getExerciseStatus(entries, ex.exerciseId);
                const icon =
                  status === 'completed' ? '✅' : status === 'inProgress' ? '🔄' : '⭕';
                const label =
                  status === 'completed'
                    ? 'Completado'
                    : status === 'inProgress'
                      ? 'En progreso'
                      : 'Pendiente';
                return (
                  <li
                    key={ex.exerciseId}
                    className={styles.exerciseStatusItem}
                    data-status={status}
                  >
                    <span className={styles.exerciseStatusIcon} aria-hidden>
                      {icon}
                    </span>
                    <span className={styles.exerciseStatusName}>{ex.name}</span>
                    <span className={styles.exerciseStatusLabel}>{label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className={styles.field}>
            <label>Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </>
      )}

      {day.exercises.map((ex) => {
        const setsData = entries[ex.exerciseId] ?? [];
        const status = getExerciseStatus(entries, ex.exerciseId);
        const icon =
          status === 'completed' ? '✅' : status === 'inProgress' ? '🔄' : '⭕';
        const setCardRef = (el: HTMLDivElement | null) => {
          exerciseCardRefs.current[ex.exerciseId] = el;
        };

        return (
          <div
            key={ex.exerciseId}
            ref={setCardRef}
            className={styles.exerciseCard}
            data-status={isFinished ? 'completed' : status}
          >
            <h3>
              <span className={styles.exerciseCardIcon} aria-hidden>
                {icon}
              </span>
              {ex.name}
            </h3>
            {setsData.map((set, index) => (
              <div key={set.id} className={styles.setRow}>
                <span>Serie {index + 1}</span>
                <input
                  type="number"
                  placeholder="Reps"
                  value={set.reps}
                  onChange={(e) =>
                    handleUpdateSet(ex.exerciseId, set.id, 'reps', e.target.value)
                  }
                  disabled={isFinished}
                  readOnly={isFinished}
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Peso (kg)"
                  value={set.weight}
                  onChange={(e) =>
                    handleUpdateSet(ex.exerciseId, set.id, 'weight', e.target.value)
                  }
                  disabled={isFinished}
                  readOnly={isFinished}
                />
              </div>
            ))}
          </div>
        );
      })}

      {isFinished ? (
        <p className={styles.finishedMessage}>Entrenamiento finalizado</p>
      ) : (
        <button
          type="button"
          className={styles.saveButton}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Guardando…' : 'Guardar entrenamiento'}
        </button>
      )}
    </div>
  );
}
