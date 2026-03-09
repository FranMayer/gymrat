import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import type { Routine } from '@/domain/entities';
import { EXERCISE_CATALOG } from '@/infrastructure/routineGenerator/exerciseCatalog';
import type { CatalogExerciseExtended } from '@/infrastructure/routineGenerator/exerciseCatalog';
import styles from './RoutineDetail.module.css';

function getCatalogExercise(exerciseId: string): CatalogExerciseExtended | undefined {
  return EXERCISE_CATALOG.find((e) => e.id === exerciseId);
}

export function RoutineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { routineRepo } = useApp();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

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
            {day.exercises.map((ex, idx) => {
              const itemKey = `${day.id}-${ex.exerciseId}-${idx}`;
              const isExpanded = expandedKey === itemKey;
              const catalogEx = getCatalogExercise(ex.exerciseId);
              return (
                <li key={itemKey} className={styles.exerciseItem}>
                  <button
                    type="button"
                    className={styles.exerciseTrigger}
                    onClick={() => setExpandedKey(isExpanded ? null : itemKey)}
                    aria-expanded={isExpanded}
                  >
                    <strong>{ex.name}</strong>
                    <span className={styles.exerciseMeta}>
                      {ex.sets} × {ex.reps} reps
                      {ex.suggestedWeightKg != null ? ` · ${ex.suggestedWeightKg} kg` : ''}
                    </span>
                    <span className={styles.chevron} aria-hidden>
                      {isExpanded ? '▼' : '▶'}
                    </span>
                  </button>
                  <div
                    className={styles.exerciseDetailWrapper}
                    data-expanded={isExpanded}
                    aria-hidden={!isExpanded}
                  >
                    <div className={styles.exerciseDetail}>
                      {catalogEx ? (
                        <>
                          <p className={styles.exerciseDescription}>{catalogEx.description}</p>
                          {catalogEx.muscles?.length > 0 && (
                            <div className={styles.muscleChips}>
                              {catalogEx.muscles.map((m, i) => (
                                <span
                                  key={m}
                                  className={
                                    i === 0 ? styles.muscleChipPrimary : styles.muscleChipSecondary
                                  }
                                >
                                  {m}
                                </span>
                              ))}
                            </div>
                          )}
                          {(catalogEx.difficulty || catalogEx.category) && (
                            <div className={styles.badges}>
                              {catalogEx.difficulty && (
                                <span className={styles.badge}>{catalogEx.difficulty}</span>
                              )}
                              {catalogEx.category && (
                                <span className={styles.badge}>{catalogEx.category}</span>
                              )}
                            </div>
                          )}
                          {catalogEx.tips?.length > 0 && (
                            <ul className={styles.tipsList}>
                              {catalogEx.tips.map((tip) => (
                                <li key={tip}>{tip}</li>
                              ))}
                            </ul>
                          )}
                        </>
                      ) : (
                        <p className={styles.exerciseDescription}>
                          Sin información adicional en el catálogo para este ejercicio.
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
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
