import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSession } from '@/stores/session';
import { getClientMemoryRepo } from '@/repositories/memory';
import { weekId } from '@/lib/week';
import { httpApi } from '@/repositories/http';
import type { WeeklyReward } from '@/types';
import styles from './RewardsPage.module.css';

const useFixture = import.meta.env.VITE_USE_FIXTURE_API !== 'false';

export function RewardsPage() {
  const activeId = useSession((s) => s.activePlayerId);
  const [reward, setReward] = useState<WeeklyReward | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const w = weekId();
        if (useFixture) {
          let r = await getClientMemoryRepo().getWeeklyReward(w);
          if (!r) {
            r = {
              id: `rw_${w}`,
              weekId: w,
              participationReward: 'Family movie night pick',
              championBonus: 'Extra beach ice cream',
              minimumQuests: 3,
              enabled: true,
              updatedAt: new Date().toISOString(),
            };
          }
          setReward(r);
        } else {
          const res = await httpApi.rewards(w);
          setReward(res.reward);
        }
      } catch {
        setReward(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="app-screen">
      <h1>Rewards</h1>
      <section className={`card ${styles.card}`}>
        <h2>This week’s prizes</h2>
        {loading ? (
          <p className="state-loading">Loading prizes…</p>
        ) : reward ? (
          <>
            <p>
              <strong>Participation:</strong> {reward.participationReward}
            </p>
            <p>
              <strong>Champion bonus:</strong> {reward.championBonus || 'Surprise prize'}
            </p>
            <p className="muted">
              Complete at least {reward.minimumQuests} quests to claim participation.
            </p>
          </>
        ) : (
          <p className="state-empty">Prizes will appear when a parent sets them.</p>
        )}
      </section>
      <section className={`card ${styles.card}`}>
        <h2>Adventure badges</h2>
        <p className="muted">Your first badge is one quest away.</p>
      </section>
      {activeId ? (
        <Link className="btn btn-primary btn-block" to={`/player/${activeId}/home`}>
          Start Quest
        </Link>
      ) : (
        <Link className="btn btn-primary btn-block" to="/select-player">
          Pick player
        </Link>
      )}
    </div>
  );
}
