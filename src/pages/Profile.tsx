import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import { getOrCreateProfile, saveProfile } from '@/usecases';
import { calculateBMI } from '@/domain/entities';
import type { UserProfile, Objective, Level, Sex } from '@/domain/entities';
import styles from './Profile.module.css';

const OBJECTIVES: Objective[] = ['tonificar', 'adelgazar', 'ganar_masa'];
const LEVELS: Level[] = ['principiante', 'intermedio', 'avanzado'];
const SEX_OPTIONS: Sex[] = ['hombre', 'mujer', 'otro'];

export function Profile() {
  const navigate = useNavigate();
  const { userProfileRepo } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getOrCreateProfile(userProfileRepo).then(({ profile: p }) => setProfile(p));
  }, [userProfileRepo]);

  const update = (patch: Partial<UserProfile>) => {
    if (profile) setProfile({ ...profile, ...patch });
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await saveProfile(userProfileRepo, profile);
    setSaving(false);
    navigate('/');
  };

  if (!profile) return <p>Cargando…</p>;

  const bmi = calculateBMI(profile.weightKg, profile.heightCm);

  return (
    <div className={styles.page}>
      <h1>Mi perfil</h1>
      <div className={styles.field}>
        <label>Edad</label>
        <input
          type="number"
          value={profile.age}
          onChange={(e) => update({ age: parseInt(e.target.value, 10) || 0 })}
        />
      </div>
      <div className={styles.field}>
        <label>Sexo</label>
        <div className={styles.chips}>
          {SEX_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={profile.sex === s ? styles.chipActive : styles.chip}
              onClick={() => update({ sex: s })}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.field}>
        <label>Altura (cm)</label>
        <input
          type="number"
          value={profile.heightCm}
          onChange={(e) => update({ heightCm: parseFloat(e.target.value) || 0 })}
        />
      </div>
      <div className={styles.field}>
        <label>Peso (kg)</label>
        <input
          type="number"
          step="0.1"
          value={profile.weightKg}
          onChange={(e) => update({ weightKg: parseFloat(e.target.value) || 0 })}
        />
      </div>
      <div className={styles.bmiBox}>
        <span className={styles.bmiLabel}>IMC</span>
        <span className={styles.bmiValue}>{bmi}</span>
      </div>
      <div className={styles.field}>
        <label>Objetivo</label>
        <div className={styles.chips}>
          {OBJECTIVES.map((o) => (
            <button
              key={o}
              type="button"
              className={profile.objective === o ? styles.chipActive : styles.chip}
              onClick={() => update({ objective: o })}
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
              className={profile.level === l ? styles.chipActive : styles.chip}
              onClick={() => update({ level: l })}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <button type="button" className={styles.saveButton} onClick={handleSave} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  );
}
