import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  adminBonusPoints,
  adminUpdatePlayer,
  fetchParentOverview,
  hasParentSession,
} from '@/features/parent/parentApi';
import type { Player } from '@/types';

export function ParentPlayersPage() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function reload() {
    const data = await fetchParentOverview();
    setPlayers(data.players);
  }

  useEffect(() => {
    if (!hasParentSession()) {
      navigate('/parent');
      return;
    }
    void reload().catch(() => setError('Could not load children.'));
  }, [navigate]);

  async function setDifficulty(playerId: string, difficultyLevel: 1 | 2 | 3 | 4) {
    setError('');
    try {
      await adminUpdatePlayer({ playerId, difficultyLevel });
      setMessage('Quest level updated.');
      await reload();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function bonus(playerId: string, points: number) {
    setError('');
    try {
      await adminBonusPoints({ playerId, points, reason: 'parent-adjust' });
      setMessage(`Adjusted weekly points by ${points}.`);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="app-screen app-screen--parent">
      <h1>Children</h1>
      <p className="muted">Names, quest level, bonus points.</p>
      {error ? <p className="state-error">{error}</p> : null}
      {message ? <p className="state-ok">{message}</p> : null}
      <div style={{ display: 'grid', gap: 12 }}>
        {players.map((p) => (
          <article key={p.id} className="card">
            <h2>{p.displayName}</h2>
            <p className="muted">Quest Level {p.difficultyLevel}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {([1, 2, 3, 4] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => void setDifficulty(p.id, d)}
                >
                  L{d}
                </button>
              ))}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void bonus(p.id, 50)}
              >
                +50 pts
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => void bonus(p.id, -25)}
              >
                −25 pts
              </button>
            </div>
          </article>
        ))}
      </div>
      <p style={{ marginTop: 16 }}>
        <Link to="/parent/dashboard">Back to overview</Link>
      </p>
    </div>
  );
}
