import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  adminUpdateReward,
  fetchParentOverview,
  hasParentSession,
} from '@/features/parent/parentApi';
import { weekId } from '@/lib/week';

export function ParentRewardsPage() {
  const navigate = useNavigate();
  const [participation, setParticipation] = useState('');
  const [champion, setChampion] = useState('');
  const [minQuests, setMinQuests] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hasParentSession()) {
      navigate('/parent');
      return;
    }
    void fetchParentOverview().then((d) => {
      if (d.reward) {
        setParticipation(d.reward.participationReward);
        setChampion(d.reward.championBonus ?? '');
        setMinQuests(d.reward.minimumQuests);
      }
    });
  }, [navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await adminUpdateReward({
        weekId: weekId(),
        participationReward: participation.trim(),
        championBonus: champion.trim() || undefined,
        minimumQuests: minQuests,
        enabled: true,
      });
      setMessage('Reward saved for this week.');
    } catch (err) {
      setError((err as Error).message || 'Could not save reward.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-screen app-screen--parent">
      <h1>Weekly reward</h1>
      <p className="muted">Kids see this on the rewards screen.</p>
      <form onSubmit={(e) => void submit(e)} className="card" style={{ display: 'grid', gap: 12 }}>
        <label>
          Participation prize
          <input
            value={participation}
            onChange={(e) => setParticipation(e.target.value)}
            maxLength={200}
            required
            style={{ width: '100%', minHeight: 44, marginTop: 4 }}
          />
        </label>
        <label>
          Champion bonus (optional)
          <input
            value={champion}
            onChange={(e) => setChampion(e.target.value)}
            maxLength={200}
            style={{ width: '100%', minHeight: 44, marginTop: 4 }}
          />
        </label>
        <label>
          Minimum quests for participation
          <input
            type="number"
            min={0}
            max={50}
            value={minQuests}
            onChange={(e) => setMinQuests(Number(e.target.value))}
            style={{ width: '100%', minHeight: 44, marginTop: 4 }}
          />
        </label>
        {error ? <p className="state-error">{error}</p> : null}
        {message ? <p className="state-ok">{message}</p> : null}
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save reward'}
        </button>
      </form>
      <p style={{ marginTop: 16 }}>
        <Link to="/parent/dashboard">Back to overview</Link>
      </p>
    </div>
  );
}
