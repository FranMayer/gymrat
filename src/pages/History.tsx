import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import type { Routine } from '@/domain/entities';
import type { WorkoutSession } from '@/domain/entities';
import styles from './History.module.css';

export function History() {
  const { routineRepo, workoutLogRepo, prRepo } = useApp();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);

  useEffect(() => {
    routineRepo.getAll().then(setRoutines);
    workoutLogRepo.getSessionsByDateRange('2000-01-01', '2100-12-31').then(setSessions);
  }, [routineRepo, workoutLogRepo]);

  const handleDeleteRoutine = async (id: string) => {
    const ok = window.confirm(
      '¿Eliminar esta rutina? No se borrarán las sesiones de entrenamiento ya registradas.'
    );
    if (!ok) return;
    await routineRepo.delete(id);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

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
              <li key={r.id} className={styles.listItem}>
                <div className={styles.itemMain}>
                  <Link to={`/routines/${r.id}`} className={styles.link}>
                    {r.name}
                  </Link>
                  <span className={styles.meta}>
                    {r.objective} · {r.level} · {r.days.length} días
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => handleDeleteRoutine(r.id)}
                >
                  Eliminar
                </button>
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
      <section className={styles.section}>
        <h2>Acciones avanzadas</h2>
        <button
          type="button"
          className={styles.dangerButton}
          onClick={async () => {
            const ok = window.confirm(
              '¿Borrar TODAS las sesiones de entrenamiento? Esto no toca rutinas ni PRs.'
            );
            if (!ok) return;
            await workoutLogRepo.clearAll();
            setSessions([]);
          }}
        >
          Borrar todas las sesiones
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={async () => {
            const ok = window.confirm(
              '¿Resetear todos los PRs (records de ejercicios y volumen semanal)?'
            );
            if (!ok) return;
            await prRepo.clearAll();
          }}
        >
          Resetear PRs
        </button>
      </section>
    </div>
  );
}
