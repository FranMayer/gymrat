import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import type { Routine, RoutineExercise } from '@/domain/entities';
import { EXERCISE_CATALOG } from '@/infrastructure/routineGenerator/exerciseCatalog';
import type { CatalogExerciseExtended } from '@/infrastructure/routineGenerator/exerciseCatalog';
import styles from './RoutineDetail.module.css';

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  pectorales: 'Pecho',
  espalda: 'Espalda',
  hombros: 'Hombros',
  bíceps: 'Bíceps',
  tríceps: 'Tríceps',
  piernas: 'Piernas',
  core: 'Core',
};

const MUSCLE_GROUP_IDS = ['pectorales', 'espalda', 'hombros', 'bíceps', 'tríceps', 'piernas', 'core'];

function getCatalogExercise(exerciseId: string): CatalogExerciseExtended | undefined {
  return EXERCISE_CATALOG.find((e) => e.id === exerciseId);
}

export function RoutineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { routineRepo } = useApp();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<{
    dayId: string;
    exercise: RoutineExercise;
    muscleGroup: string;
  } | null>(null);
  const [replaceSearch, setReplaceSearch] = useState('');
  const [replaceMuscle, setReplaceMuscle] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) routineRepo.getById(id).then(setRoutine);
  }, [id, routineRepo]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const filteredCatalog = useMemo(() => {
    const q = replaceSearch.trim().toLowerCase();
    const muscle = replaceMuscle ?? undefined;
    return EXERCISE_CATALOG.filter((e) => {
      const matchQuery = !q || e.name.toLowerCase().includes(q) || e.muscleGroup.toLowerCase().includes(q);
      const matchMuscle = !muscle || e.muscleGroup === muscle;
      return matchQuery && matchMuscle;
    });
  }, [replaceSearch, replaceMuscle]);

  const chipOrder = useMemo(() => {
    if (!replaceTarget?.muscleGroup) return MUSCLE_GROUP_IDS;
    const first = replaceTarget.muscleGroup;
    const rest = MUSCLE_GROUP_IDS.filter((k) => k !== first);
    return [first, ...rest];
  }, [replaceTarget?.muscleGroup]);

  const handleReplace = (newEx: CatalogExerciseExtended) => {
    if (!routine || !replaceTarget) return;
    const updated: Routine = {
      ...routine,
      days: routine.days.map((d) => {
        if (d.id !== replaceTarget.dayId) return d;
        return {
          ...d,
          exercises: d.exercises.map((ex) =>
            ex.order === replaceTarget.exercise.order
              ? {
                  exerciseId: newEx.id,
                  name: newEx.name,
                  sets: replaceTarget.exercise.sets,
                  reps: replaceTarget.exercise.reps,
                  suggestedWeightKg: replaceTarget.exercise.suggestedWeightKg,
                  order: replaceTarget.exercise.order,
                  replaced: true,
                }
              : ex
          ),
        };
      }),
    };
    routineRepo.save(updated).then(() => {
      setRoutine(updated);
      setReplaceTarget(null);
      setReplaceSearch('');
      setReplaceMuscle(null);
      setToastMessage('Ejercicio reemplazado ✓');
    });
  };

  if (!routine) return <p>Cargando…</p>;

  return (
    <div className={styles.page}>
      {toastMessage && (
        <div className={styles.toast} role="status">
          {toastMessage}
        </div>
      )}
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
                    <span className={styles.exerciseTriggerTitle}>
                      <strong>{ex.name}</strong>
                      {ex.replaced && <span className={styles.modifiedBadge}>modificado</span>}
                    </span>
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
                          <button
                            type="button"
                            className={styles.replaceButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplaceTarget({
                                dayId: day.id,
                                exercise: ex,
                                muscleGroup: catalogEx.muscleGroup,
                              });
                              setReplaceSearch('');
                              setReplaceMuscle(null);
                            }}
                          >
                            Reemplazar ejercicio
                          </button>
                        </>
                      ) : (
                        <>
                          <p className={styles.exerciseDescription}>
                            Sin información adicional en el catálogo para este ejercicio.
                          </p>
                          <button
                            type="button"
                            className={styles.replaceButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setReplaceTarget({
                                dayId: day.id,
                                exercise: ex,
                                muscleGroup: 'pectorales',
                              });
                              setReplaceSearch('');
                              setReplaceMuscle(null);
                            }}
                          >
                            Reemplazar ejercicio
                          </button>
                        </>
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

      {replaceTarget && (
        <div
          className={styles.replaceBackdrop}
          onClick={() => {
            setReplaceTarget(null);
            setReplaceSearch('');
            setReplaceMuscle(null);
          }}
          aria-hidden
        />
      )}
      {replaceTarget && (
        <div className={styles.replaceDrawer} role="dialog" aria-modal="true" aria-label="Reemplazar ejercicio">
          <div className={styles.replaceDrawerHandle} aria-hidden />
          <h3 className={styles.replaceDrawerTitle}>Reemplazar ejercicio</h3>
          <input
            type="search"
            className={styles.replaceSearch}
            placeholder="Buscar ejercicio..."
            value={replaceSearch}
            onChange={(e) => setReplaceSearch(e.target.value)}
            autoFocus
          />
          <div className={styles.replaceChips}>
            <button
              type="button"
              className={!replaceMuscle ? styles.replaceChipActive : styles.replaceChip}
              onClick={() => setReplaceMuscle(null)}
            >
              Todos
            </button>
            {chipOrder.map((mg) => (
              <button
                key={mg}
                type="button"
                className={replaceMuscle === mg ? styles.replaceChipActive : styles.replaceChip}
                onClick={() => setReplaceMuscle(mg)}
              >
                {MUSCLE_GROUP_LABELS[mg] ?? mg}
              </button>
            ))}
          </div>
          <ul className={styles.replaceList}>
            {filteredCatalog.map((ex) => (
              <li key={ex.id}>
                <button
                  type="button"
                  className={styles.replaceCard}
                  onClick={() => handleReplace(ex)}
                >
                  <span className={styles.replaceCardName}>{ex.name}</span>
                  <span className={styles.replaceCardMuscle}>
                    {MUSCLE_GROUP_LABELS[ex.muscleGroup] ?? ex.muscleGroup}
                  </span>
                  <span className={styles.replaceCardBadge}>{ex.difficulty}</span>
                </button>
              </li>
            ))}
          </ul>
          {filteredCatalog.length === 0 && (
            <p className={styles.replaceEmpty}>Ningún ejercicio coincide con el filtro.</p>
          )}
          <button
            type="button"
            className={styles.replaceCancel}
            onClick={() => {
              setReplaceTarget(null);
              setReplaceSearch('');
              setReplaceMuscle(null);
            }}
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
