import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import { getOrCreateProfile } from '@/usecases';
import { calculateBMI } from '@/domain/entities';
import type { UserProfile } from '@/domain/entities';
import styles from './Home.module.css';

export function Home() {
  const { userProfileRepo } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    getOrCreateProfile(userProfileRepo).then(({ profile: p }) => setProfile(p));
  }, [userProfileRepo]);

  const bmi = profile ? calculateBMI(profile.weightKg, profile.heightCm) : null;

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
      <Link to="/generate" className={styles.buttonPrimary}>
        Generar nueva rutina
      </Link>
      <Link to="/history" className={styles.button}>
        Ver historial
      </Link>
    </div>
  );
}
