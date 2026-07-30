import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/stores/session';
import styles from './SplashPage.module.css';

export function SplashPage() {
  const navigate = useNavigate();
  const loadPlayers = useSession((s) => s.loadPlayers);

  useEffect(() => {
    void loadPlayers();
    const t = window.setTimeout(() => navigate('/select-player'), 1200);
    return () => window.clearTimeout(t);
  }, [loadPlayers, navigate]);

  return (
    <div className={`${styles.splash} app-screen--full`}>
      <div className={styles.island} aria-hidden />
      <h1 className={styles.title}>Island Quest</h1>
      <p className={styles.tag}>Treasure hunts · worlds · weekly glory</p>
      <div className={styles.loader} role="status" aria-label="Loading">
        <span />
      </div>
    </div>
  );
}
