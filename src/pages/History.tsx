import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import type { Routine } from '@/domain/entities';
import type { WorkoutSession } from '@/domain/entities';
import styles from './History.module.css';

export function History() {
  const { routineRepo, workoutLogRepo } = useApp();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    routineRepo.getAll().then(setRoutines);
    workoutLogRepo.getSessionsByDateRange('2000-01-01', '2100-12-31').then(setSessions);
  }, [routineRepo, workoutLogRepo]);

  return (
    <div className={styles.page}>
      <h1>Historial</h1>
      <section className={styles.section}>
        <h2>Rutinas guardadas</h2>
        {routines.length === 0 ? (
          <p className={styles.empty}>No hay rutinas. Genera una desde el menú.</p>
        ) : (
          <ul className={styles.list}>
            {routines.map((r) => (
              <li key={r.id}>
                <Link to={`/routines/${r.id}`} className={styles.link}>
                  {r.name}
                </Link>
                <span className={styles.meta}>
                  {r.objective} · {r.level} · {r.days.length} días
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className={styles.section}>
        <h2>Sesiones de entrenamiento</h2>
        {sessions.length === 0 ? (
          <p className={styles.empty}>Aún no hay sesiones registradas.</p>
        ) : (
          <ul className={styles.list}>
            {sessions.map((s) => (
              <li key={`${s.routineDayId}-${s.date}`}>
                <span className={styles.date}>{s.date}</span>
                <span className={styles.meta}>
                  {s.entries.length} ejercicio(s)
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
