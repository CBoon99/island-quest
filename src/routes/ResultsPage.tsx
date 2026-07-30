import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSession } from '@/stores/session';
import { playSfx } from '@/features/audio/sound';
import { FxOverlay, type FxMode } from '@/components/feedback/FxOverlay';
import styles from './ResultsPage.module.css';

export function ResultsPage() {
  const { playerId = '' } = useParams();
  const result = useSession((s) => s.lastResult);
  const syncStatus = useSession((s) => s.syncStatus);
  const [fxMode, setFxMode] = useState<FxMode>(null);
  const [fxKey, setFxKey] = useState(0);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!result) return;
    const perfect = result.bonuses.perfectRound > 0;
    const strong = result.correctCount >= Math.ceil(result.attempts.length * 0.7);
    if (perfect) {
      setFxMode('fanfare');
      setFxKey((k) => k + 1);
      playSfx('fanfare');
      window.setTimeout(() => {
        setFxMode('bomb');
        setFxKey((k) => k + 1);
        playSfx('bomb');
      }, 400);
    } else if (strong) {
      setFxMode('hit');
      setFxKey((k) => k + 1);
      playSfx('fanfare');
    } else {
      setFxMode('hit');
      setFxKey((k) => k + 1);
      playSfx('hit');
    }
  }, [result]);

  return (
    <div className="app-screen app-screen--full">
      <FxOverlay mode={fxMode} burstKey={fxKey} reducedMotion={reducedMotion} />
      <div className={`card ${styles.card} ${styles.celebrate}`}>
        <p className={styles.kicker}>Treasure haul complete!</p>
        <h1>What a quest!</h1>
        {result ? (
          <>
            <div className={styles.heroScore} aria-live="polite">
              {result.score}
              <span> points</span>
            </div>
            <ul className={styles.stats}>
              <li>
                Hits: {result.correctCount}/{result.attempts.length}
              </li>
              <li>XP: +{result.xpEarned}</li>
              <li>Coins: +{result.coinsEarned}</li>
              <li>Streak: {result.streakAfter}</li>
            </ul>
            {result.bonuses.perfectRound > 0 ? (
              <p className={styles.perfect}>Perfect round! Full treasure chest!</p>
            ) : null}
            {syncStatus === 'saved' ? (
              <p className={styles.sync}>Score verified · Saved</p>
            ) : syncStatus === 'saving' ? (
              <p className={styles.sync}>Saving…</p>
            ) : syncStatus === 'pending' ? (
              <p className={styles.sync}>
                We’ll sync when online — not on the leaderboard yet
              </p>
            ) : null}
          </>
        ) : (
          <p className="muted">
            {syncStatus === 'pending'
              ? 'Couldn’t save yet — safe on this device. Leaderboard waits for verified save.'
              : 'No verified haul yet. Play a quest!'}
          </p>
        )}
        <div className={styles.actions}>
          <Link className="btn btn-accent btn-block" to={`/player/${playerId}/play/quick`}>
            Play Again
          </Link>
          <Link className="btn btn-secondary btn-block" to="/leaderboard">
            Leaderboard
          </Link>
          <Link className="btn btn-primary btn-block" to={`/player/${playerId}/home`}>
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
