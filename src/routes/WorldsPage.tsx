import { Link, useParams } from 'react-router-dom';
import { WORLDS } from '@/config/worlds';
import { useSession } from '@/stores/session';
import { SvgIcon } from '@/components/ui/SvgIcon';
import styles from './WorldsPage.module.css';

export function WorldsPage() {
  const { playerId = '' } = useParams();
  const player = useSession((s) => s.players.find((p) => p.id === playerId));
  const questsDone = player ? Math.floor(player.xp / 100) : 0;

  return (
    <div className="app-screen">
      <h1>World Map</h1>
      <p className="muted">Pick a zone for a World Quest (10 questions).</p>
      <div className={styles.list}>
        {WORLDS.map((w) => {
          const locked = questsDone < w.unlockQuestsRequired;
          const icon =
            w.icon === 'wave' ||
            w.icon === 'leaf' ||
            w.icon === 'star' ||
            w.icon === 'flame' ||
            w.icon === 'map' ||
            w.icon === 'ruins'
              ? w.icon
              : 'star';
          return (
            <div
              key={w.id}
              className={`card ${styles.card}`}
              style={{ background: w.gradient, color: 'white' }}
            >
              <div className={styles.top}>
                <SvgIcon name={icon} size={28} />
                {locked ? <span className={styles.lock}>Locked</span> : null}
              </div>
              <h2>{w.name}</h2>
              <p>{w.description}</p>
              {locked ? (
                <p className={styles.hint}>
                  Unlock after {w.unlockQuestsRequired} quests of progress
                </p>
              ) : (
                <div className={styles.actions}>
                  <Link
                    className="btn btn-accent"
                    to={`/player/${playerId}/play/world?world=${w.id}`}
                  >
                    World Quest
                  </Link>
                  <Link
                    className="btn btn-secondary"
                    to={`/player/${playerId}/play/boss?world=${w.id}`}
                    style={{ background: 'rgba(255,255,255,0.9)' }}
                  >
                    Boss Battle
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Link className="btn btn-primary btn-block" to={`/player/${playerId}/play/rematch`}>
        Revenge Round
      </Link>
    </div>
  );
}
