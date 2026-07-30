import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  clearParentSession,
  fetchParentOverview,
  hasParentSession,
} from '@/features/parent/parentApi';
import type { Player, WeeklyLeaderboard, WeeklyReward } from '@/types';
import styles from './ParentDashboardPage.module.css';

export function ParentDashboardPage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [board, setBoard] = useState<WeeklyLeaderboard | null>(null);
  const [reward, setReward] = useState<WeeklyReward | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasParentSession()) {
      navigate('/parent');
      return;
    }
    void (async () => {
      try {
        const data = await fetchParentOverview();
        setPlayers(data.players);
        setBoard(data.leaderboard);
        setReward(data.reward);
      } catch {
        setError('Could not load parent overview.');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  function exitParent() {
    clearParentSession();
    navigate('/select-player');
  }

  if (loading) {
    return (
      <div className="app-screen app-screen--parent">
        <p className="state-loading">Loading family overview…</p>
      </div>
    );
  }

  return (
    <div className="app-screen app-screen--parent">
      <header className={styles.header}>
        <h1>This week</h1>
        <p className="muted">30-second overview · {board?.weekId ?? '—'}</p>
      </header>

      {error ? <p className="state-error">{error}</p> : null}

      <div className={styles.grid}>
        {players.length === 0 ? (
          <p className="state-empty">No players yet.</p>
        ) : (
          players.map((p) => {
            const entry = board?.entries.find((e) => e.playerId === p.id);
            return (
              <article key={p.id} className={`card ${styles.child}`}>
                <h2>{p.displayName}</h2>
                <p>Quest Level {p.difficultyLevel}</p>
                <p>
                  {p.xp} XP · {p.coins} coins
                </p>
                <p>
                  Streak {p.currentStreak} (best {p.longestStreak})
                </p>
                <p>
                  Week points: <strong>{entry?.points ?? 0}</strong> · Quests{' '}
                  {entry?.questsCompleted ?? 0}
                </p>
              </article>
            );
          })
        )}
      </div>

      <section className={`card ${styles.reward}`}>
        <h3>Rewards</h3>
        {reward ? (
          <>
            <p>Participation: {reward.participationReward}</p>
            <p>Champion: {reward.championBonus || '—'}</p>
            <p className="muted">Min quests: {reward.minimumQuests}</p>
          </>
        ) : (
          <p className="state-empty">No reward configured this week.</p>
        )}
      </section>

      <section className={`card ${styles.reward}`}>
        <h3>Weekly board</h3>
        {board && board.entries.length > 0 ? (
          <ol className={styles.board}>
            {[...board.entries]
              .sort((a, b) => b.points - a.points)
              .map((e) => {
                const name =
                  players.find((p) => p.id === e.playerId)?.displayName ?? e.playerId;
                return (
                  <li key={e.playerId}>
                    {name}: {e.points} pts · {e.questsCompleted} quests
                  </li>
                );
              })}
          </ol>
        ) : (
          <p className="state-empty">No quests finished this week yet.</p>
        )}
      </section>

      <nav className={styles.nav}>
        <Link to="/parent/players">Children</Link>
        <Link to="/parent/rewards">Set reward</Link>
        <Link to="/parent/settings">Settings</Link>
        <button type="button" className={styles.exit} onClick={exitParent}>
          Exit parent
        </button>
      </nav>
    </div>
  );
}
