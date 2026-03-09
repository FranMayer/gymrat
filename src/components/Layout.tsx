import { Outlet, Link } from 'react-router-dom';
import { IS_DEV } from '@/lib';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.layout}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.link}>
          Inicio
        </Link>
        <Link to="/profile" className={styles.link}>
          Perfil
        </Link>
        <Link to="/generate" className={styles.link}>
          Generar rutina
        </Link>
        <Link to="/history" className={styles.link}>
          Historial
        </Link>
        {IS_DEV && (
          <Link to="/dev" className={styles.devLink}>
            DevTools
          </Link>
        )}
      </nav>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
