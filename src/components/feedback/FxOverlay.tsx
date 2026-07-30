import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import styles from './FxOverlay.module.css';

export type FxMode = 'hit' | 'miss' | 'fanfare' | 'bomb' | null;

type Particle = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  rot: number;
  color: string;
  size: number;
  shape: 'rect' | 'circle' | 'star';
  delay: number;
};

const HIT_COLORS = ['#ffd54f', '#ff6b4a', '#26a69a', '#42a5f5', '#ec407a', '#ab47bc', '#fff176'];
const MISS_COLORS = ['#9c27b0', '#7b1fa2', '#ce93d8', '#b39ddb', '#5e35b1', '#9575cd'];
const BOMB_COLORS = ['#ff5722', '#ff9800', '#ffeb3b', '#f44336', '#ff7043'];

function makeParticles(mode: Exclude<FxMode, null>, count: number): Particle[] {
  const colors =
    mode === 'miss' ? MISS_COLORS : mode === 'bomb' || mode === 'fanfare' ? BOMB_COLORS : HIT_COLORS;
  const list: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = mode === 'bomb' ? 12 + Math.random() * 18 : 6 + Math.random() * 14;
    list.push({
      id: i,
      x: 50 + (Math.random() - 0.5) * (mode === 'bomb' ? 10 : 20),
      y: mode === 'miss' ? 55 + Math.random() * 15 : 40 + Math.random() * 20,
      dx: Math.cos(angle) * speed,
      dy: Math.sin(angle) * speed - (mode === 'hit' || mode === 'fanfare' ? 8 : 2),
      rot: Math.random() * 720 - 360,
      color: colors[i % colors.length],
      size: mode === 'bomb' ? 8 + Math.random() * 14 : 6 + Math.random() * 10,
      shape: mode === 'miss' ? (i % 3 === 0 ? 'circle' : 'rect') : i % 5 === 0 ? 'star' : 'rect',
      delay: Math.random() * 80,
    });
  }
  return list;
}

type Props = {
  mode: FxMode;
  /** Bumps to retrigger same mode */
  burstKey: number;
  reducedMotion?: boolean;
};

export function FxOverlay({ mode, burstKey, reducedMotion }: Props) {
  const [active, setActive] = useState(false);
  const particles = useMemo(() => {
    if (!mode || reducedMotion) return [];
    const n = mode === 'fanfare' || mode === 'bomb' ? 48 : mode === 'hit' ? 36 : 28;
    return makeParticles(mode, n);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- burstKey retriggers
  }, [mode, burstKey, reducedMotion]);

  useEffect(() => {
    if (!mode) {
      setActive(false);
      return;
    }
    setActive(true);
    const t = window.setTimeout(() => setActive(false), mode === 'fanfare' ? 1600 : 1200);
    return () => window.clearTimeout(t);
  }, [mode, burstKey]);

  if (!mode || !active) return null;

  return (
    <div
      className={`${styles.root} ${styles[mode]} ${reducedMotion ? styles.reduced : ''}`}
      aria-hidden
    >
      {mode === 'bomb' || mode === 'fanfare' ? <div className={styles.flash} /> : null}
      {mode === 'miss' ? <div className={styles.stink} /> : null}
      {mode === 'hit' || mode === 'fanfare' ? <div className={styles.rays} /> : null}
      <div className={styles.stage}>
        {particles.map((p) => (
          <span
            key={`${burstKey}-${p.id}`}
            className={`${styles.particle} ${styles[p.shape]}`}
            style={
              {
                '--x': `${p.x}%`,
                '--y': `${p.y}%`,
                '--dx': `${p.dx}vmin`,
                '--dy': `${p.dy}vmin`,
                '--rot': `${p.rot}deg`,
                '--c': p.color,
                '--s': `${p.size}px`,
                '--delay': `${p.delay}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      {mode === 'fanfare' ? (
        <div className={styles.banner}>
          <span>🎉 TREASURE! 🎉</span>
        </div>
      ) : null}
      {mode === 'bomb' ? (
        <div className={styles.boomText}>BOOM!</div>
      ) : null}
      {mode === 'miss' ? (
        <div className={styles.oopsText}>Pffft…</div>
      ) : null}
    </div>
  );
}
