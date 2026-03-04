import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import { logWorkout, finalizeWorkoutSession } from '@/usecases';
import type { Routine } from '@/domain/entities';
import type { WorkoutLogSet } from '@/domain/entities';
import styles from './LogWorkout.module.css';

export function LogWorkout() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const dayId = searchParams.get('dayId');
  const navigate = useNavigate();
  const { routineRepo, workoutLogRepo, prRepo, streakRepo } = useApp();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [entries, setEntries] = useState<Record<string, { reps: string; weightKg: string }[]>>({});

  useEffect(() => {
    if (id) routineRepo.getById(id).then(setRoutine);
  }, [id, routineRepo]);

  const day = routine?.days.find((d) => d.id === dayId);
  if (!routine || !day) return <p>Cargando…</p>;

  const updateSet = (
    exerciseId: string,
    setIndex: number,
    field: 'reps' | 'weightKg',
    value: string
  ) => {
    setEntries((prev) => {
      const arr = [...(prev[exerciseId] ?? [])];
      arr[setIndex] = { ...arr[setIndex], [field]: value };
      return { ...prev, [exerciseId]: arr };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    for (const ex of day.exercises) {
      const setsData =
        entries[ex.exerciseId] ?? Array.from({ length: ex.sets }, () => ({ reps: '', weightKg: '' }));
      const sets: WorkoutLogSet[] = setsData.map((s, i) => ({
        setNumber: i + 1,
        reps: parseInt(s.reps, 10) || 0,
        weightKg: parseFloat(s.weightKg) || 0,
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
    navigate(`/routines/${id}`);
  };

  return (
    <div className={styles.page}>
      <h1>Registrar entrenamiento</h1>
      <div className={styles.field}>
        <label>Fecha</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      {day.exercises.map((ex) => {
        const setsData =
          entries[ex.exerciseId] ?? Array.from({ length: ex.sets }, () => ({ reps: '', weightKg: '' }));
        return (
          <div key={ex.exerciseId} className={styles.exerciseCard}>
            <h3>{ex.name}</h3>
            {setsData.map((_, i) => (
              <div key={i} className={styles.setRow}>
                <span>Serie {i + 1}</span>
                <input
                  type="number"
                  placeholder="Reps"
                  value={setsData[i]?.reps}
                  onChange={(e) => updateSet(ex.exerciseId, i, 'reps', e.target.value)}
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Peso (kg)"
                  value={setsData[i]?.weightKg}
                  onChange={(e) => updateSet(ex.exerciseId, i, 'weightKg', e.target.value)}
                />
              </div>
            ))}
          </div>
        );
      })}
      <button
        type="button"
        className={styles.saveButton}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Guardando…' : 'Guardar entrenamiento'}
      </button>
    </div>
  );
}
