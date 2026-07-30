import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SvgIcon } from '@/components/ui/SvgIcon';
import { parentLogin } from '@/features/parent/parentApi';
import styles from './ParentGatePage.module.css';

export function ParentGatePage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await parentLogin(pin);
      navigate('/parent/dashboard');
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'RATE_LIMITED') {
        setError('Too many attempts. Wait a few minutes and try again.');
      } else {
        setError('That PIN didn’t work. Try again later if you keep missing.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-screen app-screen--parent app-screen--full">
      <Link to="/select-player" className={styles.back}>
        Back
      </Link>
      <div className={`card ${styles.card}`}>
        <SvgIcon name="lock" size={32} />
        <h1>Parent area</h1>
        <p className="muted">Enter the family PIN to continue.</p>
        <form onSubmit={(e) => void submit(e)} className={styles.form}>
          <label htmlFor="pin" className="sr-only">
            PIN
          </label>
          <input
            id="pin"
            type="password"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className={styles.input}
            placeholder="••••"
            disabled={busy}
          />
          {error ? <p className={styles.error}>{error}</p> : null}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy || pin.length < 4}>
            {busy ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
