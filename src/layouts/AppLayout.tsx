import { Outlet, NavLink } from 'react-router-dom';
import { useAggressionMode } from '@/app/hooks';
import { IS_DEV } from '@/lib';
import styles from './AppLayout.module.css';

export function AppLayout() {
  const { enabled: aggressionMode, loading, toggle } = useAggressionMode();
  const layoutClass = aggressionMode ? `${styles.layout} ${styles.aggression}` : styles.layout;

  return (
    <div className={layoutClass}>
      <header className={styles.header}>
        <img
          src="/Logo.png"
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
        {IS_DEV && (
          <NavLink
            to="/dev"
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.devLink} ${styles.active}` : `${styles.link} ${styles.devLink}`
            }
          >
            DevTools
          </NavLink>
        )}
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
