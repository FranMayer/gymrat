import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import { getOrCreateProfile, saveProfile } from '@/usecases';
import { calculateBMI, formatObjective, formatLevel, formatSex } from '@/domain/entities';
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
  const [errors, setErrors] = useState<{ age?: string; heightCm?: string; weightKg?: string }>({});

  useEffect(() => {
    getOrCreateProfile(userProfileRepo).then(({ profile: p }) => setProfile(p));
  }, [userProfileRepo]);

  const update = (patch: Partial<UserProfile>) => {
    if (profile) setProfile({ ...profile, ...patch });
  };

  const handleSave = async () => {
    if (!profile) return;
    const nextErrors: { age?: string; heightCm?: string; weightKg?: string } = {};
    if (!profile.age || profile.age < 10 || profile.age > 100) {
      nextErrors.age = 'Ingresá una edad válida entre 10 y 100 años.';
    }
    if (!profile.heightCm || profile.heightCm < 100 || profile.heightCm > 250) {
      nextErrors.heightCm = 'Ingresá una altura válida entre 100 y 250 cm.';
    }
    if (!profile.weightKg || profile.weightKg < 20 || profile.weightKg > 300) {
      nextErrors.weightKg = 'Ingresá un peso válido entre 20 y 300 kg.';
    }

    if (nextErrors.age || nextErrors.heightCm || nextErrors.weightKg) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    await saveProfile(userProfileRepo, profile);
    setSaving(false);
    navigate('/');
  };

  if (!profile) return <p>Cargando…</p>;

  const canComputeBMI = profile.heightCm > 0 && profile.weightKg > 0;
  const bmi = canComputeBMI ? calculateBMI(profile.weightKg, profile.heightCm) : null;

  return (
    <div className={styles.page}>
      <h1>Mi perfil</h1>
      <div className={styles.field}>
        <label>Nombre</label>
        <input
          type="text"
          placeholder="¿Cómo te llamamos?"
          value={profile.name ?? ''}
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>
      <div className={styles.field}>
        <label>Edad</label>
        <input
          type="number"
          min={10}
          max={100}
          inputMode="numeric"
          placeholder="Ingresá tu edad"
          value={profile.age || ''}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10) || 0;
            update({ age: val });
          }}
        />
        {errors.age && <p className={styles.error}>{errors.age}</p>}
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
              {formatSex(s)}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.field}>
        <label>Altura (cm)</label>
        <input
          type="number"
          min={100}
          max={250}
          inputMode="numeric"
          placeholder="Ingresá tu altura en cm"
          value={profile.heightCm || ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            update({ heightCm: val });
          }}
        />
        {errors.heightCm && <p className={styles.error}>{errors.heightCm}</p>}
      </div>
      <div className={styles.field}>
        <label>Peso (kg)</label>
        <input
          type="number"
          step="0.1"
          min={20}
          max={300}
          inputMode="numeric"
          placeholder="Ingresá tu peso en kg"
          value={profile.weightKg || ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0;
            update({ weightKg: val });
          }}
        />
        {errors.weightKg && <p className={styles.error}>{errors.weightKg}</p>}
      </div>
      {canComputeBMI && (
        <div className={styles.bmiBox}>
          <span className={styles.bmiLabel}>IMC</span>
          <span className={styles.bmiValue}>{bmi}</span>
        </div>
      )}
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
              {formatObjective(o)}
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
              {formatLevel(l)}
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
