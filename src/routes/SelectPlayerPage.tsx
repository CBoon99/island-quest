import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@/stores/session';
import { getCharacter, CHARACTERS } from '@/config/characters';
import { SvgIcon } from '@/components/ui/SvgIcon';
import styles from './SelectPlayerPage.module.css';

export function SelectPlayerPage() {
  const navigate = useNavigate();
  const { players, loadPlayers, selectPlayer } = useSession();
  const guideCount = CHARACTERS.filter((c) => c.enabled).length;

  useEffect(() => {
    void loadPlayers();
  }, [loadPlayers]);

  return (
    <div className="app-screen app-screen--full">
      <header className={styles.header}>
        <p className={styles.kicker}>Island Quest</p>
        <h1>Who’s playing?</h1>
        <p className="muted">
          Pick your explorer. Each player chooses any of the {guideCount} guides —
          you can both pick the same guide.
        </p>
      </header>
      <div className={styles.grid}>
        {players.map((p) => {
          const guide = getCharacter(p.guideCharacterId);
          const isOlder = p.difficultyLevel >= 3;
          return (
            <article
              key={p.id}
              className={`card ${styles.card} ${isOlder ? styles.cardA : styles.cardB}`}
            >
              <div
                className={styles.avatar}
                style={{
                  background: isOlder
                    ? 'linear-gradient(145deg,#0d6e6e,#5c6bc0)'
                    : 'linear-gradient(145deg,#7b1fa2,#ce93d8)',
                }}
                aria-hidden
              >
                {p.displayName.slice(0, 1)}
              </div>
              <h2>{p.displayName}</h2>
              <p className={styles.role}>
                {isOlder ? 'Quest Level 3 · tougher questions' : 'Quest Level 1 · gentler quests'}
              </p>
              <p className={styles.meta}>
                {p.coins} coins · Guide: {guide?.name ?? 'Pick later'}
              </p>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => {
                  selectPlayer(p.id);
                  navigate(`/player/${p.id}/home`);
                }}
              >
                Play as {p.displayName}
              </button>
            </article>
          );
        })}
      </div>
      <Link to="/parent" className={styles.parentLink}>
        <SvgIcon name="parent" size={18} />
        Parent (James)
      </Link>
    </div>
  );
}
