import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAggressionMode } from '@/app/hooks';
import { useApp } from '@/app/AppContext';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { userProfileRepo } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { enabled: aggressionMode, loading, toggle } = useAggressionMode();
  const layoutClass = aggressionMode ? `${styles.layout} ${styles.aggression}` : styles.layout;

  useEffect(() => {
    let cancelled = false;
    async function ensureProfile() {
      // No redirigir si ya estamos en la pantalla de perfil
      if (location.pathname.startsWith('/profile')) return;
      const profile = await userProfileRepo.get();
      if (!cancelled && !profile) {
        navigate('/profile', {
          replace: true,
          state: { welcome: true },
        });
      }
    }
    ensureProfile();
    return () => {
      cancelled = true;
    };
  }, [location.pathname, userProfileRepo, navigate]);

  return (
    <div className={layoutClass}>
      <header className={styles.header}>
        <img
          src="/logo.png"
          alt="Gymrat"
          className={styles.logo}
        />
        <h1 className={styles.brand}>GYMRAT</h1>
        <button
          type="button"
          className={
            aggressionMode
              ? `${styles.aggressionToggle} ${styles.aggressionToggleActive}`
              : styles.aggressionToggle
          }
          onClick={toggle}
          disabled={loading}
          aria-pressed={aggressionMode}
          aria-label="Toggle Aggression Mode"
        >
          🔥
        </button>
      </header>
      <nav className={styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
          end
        >
          HOME
        </NavLink>
        <NavLink
          to="/generate"
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        >
          WORKOUT
        </NavLink>
        <NavLink
          to="/records"
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        >
          RECORDS
        </NavLink>
        <NavLink
          to="/progress"
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        >
          PROGRESS
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        >
          PERFIL
        </NavLink>
        <NavLink
          to="/history"
          className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
        >
          HISTORIAL
        </NavLink>
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
