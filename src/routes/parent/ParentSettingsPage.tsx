import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPrefs, setPrefs, type ClientPrefs } from '@/repositories/local';
import {
  adminResetWeek,
  hasParentSession,
} from '@/features/parent/parentApi';

export function ParentSettingsPage() {
  const navigate = useNavigate();
  const [prefs, setLocal] = useState<ClientPrefs>(getPrefs());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasParentSession()) navigate('/parent');
  }, [navigate]);

  function toggle(key: keyof ClientPrefs) {
    const next = setPrefs({ [key]: !prefs[key] });
    setLocal(next);
  }

  async function resetWeek() {
    if (!window.confirm('Clear this week’s leaderboard points for everyone?')) {
      return;
    }
    setError('');
    try {
      await adminResetWeek();
      setMessage('Week board reset.');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="app-screen app-screen--parent">
      <h1>Settings</h1>
      <p className="muted">Sound layers and family tools.</p>
      {error ? <p className="state-error">{error}</p> : null}
      {message ? <p className="state-ok">{message}</p> : null}

      <section className="card" style={{ display: 'grid', gap: 10 }}>
        <h2 style={{ fontSize: '1.1rem' }}>Sound</h2>
        {(
          [
            ['masterSound', 'Master sound'],
            ['music', 'Music'],
            ['effects', 'SFX'],
            ['voice', 'Guide voice'],
            ['comicFart', 'Comic miss sound (fart)'],
            ['reducedMotion', 'Prefer less motion'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={Boolean(prefs[key])}
              onChange={() => toggle(key)}
            />
            {label}
          </label>
        ))}
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: '1.1rem' }}>Week tools</h2>
        <p className="muted">Use carefully — clears weekly points only.</p>
        <button type="button" className="btn btn-secondary" onClick={() => void resetWeek()}>
          Reset this week’s board
        </button>
      </section>

      <p style={{ marginTop: 16 }}>
        <Link to="/parent/dashboard">Back to overview</Link>
      </p>
    </div>
  );
}
