import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import { getOrCreateProfile } from '@/usecases';
import { calculateBMI } from '@/domain/entities';
import type { UserProfile, Routine, RoutineDay } from '@/domain/entities';
import type { UserSettings } from '@/domain/entities';
import styles from './Home.module.css';

function differenceInCalendarDays(dateLeft: Date, dateRight: Date): number {
  const left = new Date(dateLeft.getFullYear(), dateLeft.getMonth(), dateLeft.getDate());
  const right = new Date(dateRight.getFullYear(), dateRight.getMonth(), dateRight.getDate());
  return Math.floor((left.getTime() - right.getTime()) / (24 * 60 * 60 * 1000));
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function getActiveDay(routine: Routine, startDateISO: string): RoutineDay | null {
  if (routine.days.length === 0) return null;
  const start = new Date(startDateISO + 'T12:00:00');
  const today = new Date();
  const daysSinceStart = Math.max(0, differenceInCalendarDays(today, start));
  const totalDays = routine.days.length;
  const activeDayIndex = daysSinceStart % totalDays;
  return routine.days[activeDayIndex] ?? null;
}

export function Home() {
  const { userProfileRepo, routineRepo, userSettingsRepo } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeRoutine, setActiveRoutine] = useState<Routine | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    getOrCreateProfile(userProfileRepo).then(({ profile: p }) => setProfile(p));
  }, [userProfileRepo]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [routines, s] = await Promise.all([
        routineRepo.getAll(),
        userSettingsRepo.get(),
      ]);
      if (cancelled) return;
      setSettings(s ?? null);
      const routine =
        s?.activeRoutineId != null
          ? (await routineRepo.getById(s.activeRoutineId)) ?? routines[0] ?? null
          : routines[0] ?? null;
      setActiveRoutine(routine);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [routineRepo, userSettingsRepo]);

  const bmi = profile ? calculateBMI(profile.weightKg, profile.heightCm) : null;

  const startDateISO =
    settings?.routineStartDate ??
    activeRoutine?.createdAt?.slice(0, 10) ??
    todayISO();
  const activeDay =
    activeRoutine != null ? getActiveDay(activeRoutine, startDateISO) : null;
  const activeDayIndex =
    activeRoutine && activeDay
      ? activeRoutine.days.findIndex((d) => d.id === activeDay.id)
      : -1;
  const totalDays = activeRoutine?.days.length ?? 0;
  const dayLabel =
    totalDays > 0 && activeDayIndex >= 0
      ? `DÍA ${activeDayIndex + 1} de ${totalDays}`
      : null;

  return (
    <div className={styles.page}>
      <h1>Gymrat</h1>
      {profile && (
        <section className={styles.card}>
          <h2>Perfil</h2>
          <p>
            {profile.age} años · {profile.objective} · {profile.level}
          </p>
          {bmi != null && <p className={styles.bmi}>IMC: {bmi}</p>}
          <Link to="/profile" className={styles.button}>
            Editar perfil
          </Link>
        </section>
      )}

      <section className={styles.routineSection}>
        <h2 className={styles.routineSectionTitle}>HOY TOCA</h2>
        {activeRoutine ? (
          <>
            <div className={styles.routineCard}>
              {dayLabel && (
                <span className={styles.dayBadge}>{dayLabel}</span>
              )}
              {activeDay && (
                <>
                  <h3 className={styles.dayName}>{activeDay.name}</h3>
                  <ul className={styles.exerciseList}>
                    {activeDay.exercises.map((ex) => (
                      <li key={ex.exerciseId} className={styles.exerciseItem}>
                        <span className={styles.exerciseName}>{ex.name}</span>
                        <span className={styles.exerciseMeta}>
                          {ex.sets}×{ex.reps} reps
                          {ex.suggestedWeightKg != null
                            ? ` · ${ex.suggestedWeightKg} kg`
                            : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={`/routines/${activeRoutine.id}/log?dayId=${activeDay.id}`}
                    className={styles.routineCta}
                  >
                    Entrenar hoy
                  </Link>
                </>
              )}
            </div>
            <Link
              to={`/routines/${activeRoutine.id}`}
              className={styles.verRutinaCompleta}
            >
              Ver rutina completa →
            </Link>
          </>
        ) : (
          <div className={styles.routineEmpty}>
            <p className={styles.routineEmptyText}>No tenés rutina activa</p>
            <Link to="/generate" className={styles.routineEmptyCta}>
              Generar rutina
            </Link>
          </div>
        )}
      </section>

      <Link to="/generate" className={styles.buttonPrimary}>
        Generar nueva rutina
      </Link>
      <Link to="/history" className={styles.button}>
        Ver historial
      </Link>
    </div>
  );
}
