import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSession } from '@/stores/session';
import { getCharacter } from '@/config/characters';
import styles from './HomePage.module.css';

export function HomePage() {
  const { playerId = '' } = useParams();
  const { players, loadPlayers, selectPlayer } = useSession();
  const player = players.find((p) => p.id === playerId);

  useEffect(() => {
    void loadPlayers();
    if (playerId) selectPlayer(playerId);
  }, [loadPlayers, playerId, selectPlayer]);

  if (!player) {
    return (
      <div className="app-screen">
        <p>Explorer not found.</p>
        <Link to="/select-player">Pick player</Link>
      </div>
    );
  }

  const guide = getCharacter(player.guideCharacterId);

  return (
    <div className="app-screen">
      <header className={styles.strip}>
        <div className={styles.avatar}>{player.displayName[0]}</div>
        <div>
          <h1>{player.displayName}</h1>
          <p className="muted">
            Level {player.level} · {player.xp} XP · {player.coins} coins
          </p>
        </div>
      </header>

      <section className={`card ${styles.hero}`}>
        <p className={styles.kicker}>Adventure awaits</p>
        <h2>Start Quest</h2>
        <p className="muted">
          {guide?.name ?? 'Your guide'} is ready. Five treasure questions — go!
        </p>
        <Link
          className="btn btn-accent btn-block"
          to={`/player/${playerId}/play/quick`}
        >
          Quick Play
        </Link>
        <Link
          className="btn btn-secondary btn-block"
          to={`/player/${playerId}/play/daily`}
        >
          Take the Daily Challenge
        </Link>
      </section>

      <div className={styles.row}>
        <Link className={`card ${styles.tile}`} to={`/player/${playerId}/worlds`}>
          <strong>Worlds</strong>
          <span className="muted">Explore zones</span>
        </Link>
        <Link className={`card ${styles.tile}`} to="/leaderboard">
          <strong>Leaderboard</strong>
          <span className="muted">This week’s race</span>
        </Link>
      </div>

      <section className={`card ${styles.reward}`}>
        <h3>Weekly treasure</h3>
        <p className="muted">
          Complete quests to unlock this week’s family prize. Check Rewards!
        </p>
        <Link to="/rewards">See rewards</Link>
      </section>
    </div>
  );
}
