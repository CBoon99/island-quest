import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '@/stores/session';
import { getClientMemoryRepo } from '@/repositories/memory';
import { weekId } from '@/lib/week';
import type { WeeklyLeaderboard } from '@/types';
import styles from './LeaderboardPage.module.css';

export function LeaderboardPage() {
  const players = useSession((s) => s.players);
  const loadPlayers = useSession((s) => s.loadPlayers);
  const activeId = useSession((s) => s.activePlayerId);
  const [board, setBoard] = useState<WeeklyLeaderboard | null>(null);

  useEffect(() => {
    void loadPlayers();
    void (async () => {
      const lb = await getClientMemoryRepo().getLeaderboard(weekId());
      setBoard(lb);
    })();
  }, [loadPlayers]);

  return (
    <div className="app-screen">
      <h1>Weekly Leaderboard</h1>
      <p className="muted">Week {board?.weekId ?? weekId()} · Asia/Makassar</p>
      <div className={styles.list}>
        {(board?.entries.length
          ? board.entries
          : players.map((p) => ({
              playerId: p.id,
              weekId: weekId(),
              points: 0,
              questsCompleted: 0,
              correctAnswers: 0,
              dailyChallengesCompleted: 0,
              bestStreak: 0,
              achievementIds: [],
              updatedAt: '',
            }))
        ).map((e, i) => {
          const p = players.find((x) => x.id === e.playerId);
          return (
            <article key={e.playerId} className={`card ${styles.row}`}>
              <span className={styles.rank}>{i + 1}</span>
              <div>
                <strong>{p?.displayName ?? e.playerId}</strong>
                <p className="muted">
                  {e.points} pts · {e.questsCompleted} quests · streak {e.bestStreak}
                </p>
              </div>
            </article>
          );
        })}
      </div>
      {board && board.entries.length >= 2 ? (
        <p className={styles.tease}>
          Only{' '}
          {Math.abs((board.entries[0]?.points ?? 0) - (board.entries[1]?.points ?? 0))} points
          apart — one quest could change everything!
        </p>
      ) : (
        <p className={styles.tease}>Play a quest to climb the board!</p>
      )}
      <div className={styles.awards}>
        <span>Champion</span>
        <span>Best Streak</span>
        <span>Quest Explorer</span>
        <span>Fact Finder</span>
      </div>
      {activeId ? (
        <Link className="btn btn-primary btn-block" to={`/player/${activeId}/home`}>
          Back home
        </Link>
      ) : (
        <Link className="btn btn-primary btn-block" to="/select-player">
          Pick player
        </Link>
      )}
    </div>
  );
}
