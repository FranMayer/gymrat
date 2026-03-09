import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import type { Routine } from '@/domain/entities';
import styles from './RoutineDetail.module.css';

export function RoutineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { routineRepo } = useApp();
  const [routine, setRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    if (id) routineRepo.getById(id).then(setRoutine);
  }, [id, routineRepo]);

  if (!routine) return <p>Cargando…</p>;

  return (
    <div className={styles.page}>
      <h1>{routine.name}</h1>
      <p className={styles.meta}>
        {routine.objective} · {routine.level}
      </p>
      {routine.days.map((day) => (
        <section key={day.id} className={styles.dayCard}>
          <h2>{day.name}</h2>
          <ul className={styles.exerciseList}>
            {day.exercises.map((ex) => (
              <li key={ex.exerciseId}>
                <strong>{ex.name}</strong>
                <span>
                  {ex.sets} × {ex.reps} reps
                  {ex.suggestedWeightKg != null ? ` · ${ex.suggestedWeightKg} kg` : ''}
                </span>
              </li>
            ))}
          </ul>
          <Link
            to={`/routines/${routine.id}/log?dayId=${day.id}`}
            className={styles.logLink}
          >
            Registrar entrenamiento
          </Link>
        </section>
      ))}
      <button type="button" className={styles.backButton} onClick={() => navigate(-1)}>
        Volver
      </button>
    </div>
  );
}
