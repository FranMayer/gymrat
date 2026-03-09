import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import { getOrCreateProfile, generateAndSaveRoutine } from '@/usecases';
import type { Objective, Level } from '@/domain/entities';
import styles from './GenerateRoutine.module.css';

const OBJECTIVES: Objective[] = ['tonificar', 'adelgazar', 'ganar_masa'];
const LEVELS: Level[] = ['principiante', 'intermedio', 'avanzado'];

export function GenerateRoutine() {
  const navigate = useNavigate();
  const { userProfileRepo, routineRepo, routineGenerator, userSettingsRepo } = useApp();
  const [objective, setObjective] = useState<Objective>('tonificar');
  const [level, setLevel] = useState<Level>('principiante');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getOrCreateProfile(userProfileRepo).then(({ profile }) => {
      setObjective(profile.objective);
      setLevel(profile.level);
    });
  }, [userProfileRepo]);

  const handleGenerate = async () => {
    setLoading(true);
    const { routineId } = await generateAndSaveRoutine(
      routineGenerator,
      routineRepo,
      userSettingsRepo,
      { objective, level }
    );
    setLoading(false);
    navigate(`/routines/${routineId}`);
  };

  return (
    <div className={styles.page}>
      <h1>Generar rutina</h1>
      <div className={styles.field}>
        <label>Objetivo</label>
        <div className={styles.chips}>
          {OBJECTIVES.map((o) => (
            <button
              key={o}
              type="button"
              className={objective === o ? styles.chipActive : styles.chip}
              onClick={() => setObjective(o)}
            >
              {o}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.field}>
        <label>Nivel</label>
        <div className={styles.chips}>
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              className={level === l ? styles.chipActive : styles.chip}
              onClick={() => setLevel(l)}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        className={styles.generateButton}
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? 'Generando…' : 'Generar y guardar rutina'}
      </button>
    </div>
  );
}
