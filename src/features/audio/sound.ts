import { getPrefs, type ClientPrefs } from '@/repositories/local';

/** Layered WebAudio SFX — no external audio files required. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(
  freq: number,
  durationMs: number,
  type: OscillatorType = 'sine',
  gain = 0.08,
  delayMs = 0,
): void {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.value = 0.0001;
  osc.connect(g);
  g.connect(c.destination);
  const now = c.currentTime + delayMs / 1000;
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(Math.max(0.001, gain), now + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.02);
}

/** Descending noise-ish comic fart using filtered square waves */
function comicFart(): void {
  const c = getCtx();
  if (!c) return;
  const now = c.currentTime;
  const freqs = [95, 78, 62, 48, 110, 55];
  freqs.forEach((f, i) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280 - i * 20;
    osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
    osc.frequency.setValueAtTime(f, now + i * 0.05);
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(30, f * 0.55),
      now + i * 0.05 + 0.18,
    );
    g.gain.setValueAtTime(0.0001, now + i * 0.05);
    g.gain.exponentialRampToValueAtTime(0.09, now + i * 0.05 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.2);
    osc.connect(filter);
    filter.connect(g);
    g.connect(c.destination);
    osc.start(now + i * 0.05);
    osc.stop(now + i * 0.05 + 0.22);
  });
}

/** Victory fanfare arpeggio */
function fanfare(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
  notes.forEach((f, i) => {
    tone(f, 140, 'triangle', 0.07, i * 70);
  });
  // Extra sparkle
  setTimeout(() => tone(1318.5, 180, 'sine', 0.04), 420);
}

/** Short “bomb / boom” thump + crackle */
function bombBoom(): void {
  tone(55, 280, 'sine', 0.12);
  tone(90, 180, 'square', 0.05, 40);
  tone(180, 100, 'sawtooth', 0.03, 80);
  setTimeout(() => tone(40, 200, 'triangle', 0.08), 120);
}

/** Coin / treasure sparkle for hits */
function coinSparkle(): void {
  tone(880, 70, 'sine', 0.05);
  tone(1174, 80, 'sine', 0.04, 50);
  tone(1568, 100, 'triangle', 0.035, 100);
}

export type SfxKind =
  | 'hit'
  | 'miss'
  | 'fart'
  | 'ui'
  | 'fanfare'
  | 'bomb'
  | 'streak'
  | 'levelup';

export function playSfx(
  kind: SfxKind,
  prefs: ClientPrefs = getPrefs(),
): void {
  if (!prefs.masterSound || !prefs.effects) return;
  if (kind === 'fart' && !prefs.comicFart) return;

  switch (kind) {
    case 'hit':
      coinSparkle();
      tone(660, 120, 'triangle', 0.06, 0);
      setTimeout(() => tone(880, 110, 'triangle', 0.05), 70);
      break;
    case 'fanfare':
      fanfare();
      break;
    case 'bomb':
      bombBoom();
      break;
    case 'streak':
      tone(740, 80, 'triangle', 0.05);
      tone(988, 90, 'triangle', 0.05, 70);
      tone(1318, 120, 'sine', 0.04, 140);
      break;
    case 'levelup':
      fanfare();
      bombBoom();
      break;
    case 'miss':
      tone(200, 140, 'sawtooth', 0.035);
      tone(150, 180, 'triangle', 0.03, 80);
      break;
    case 'fart':
      comicFart();
      break;
    case 'ui':
      tone(520, 60, 'sine', 0.04);
      break;
  }
}

export function canPlayMusic(prefs: ClientPrefs = getPrefs()): boolean {
  return prefs.masterSound && prefs.music;
}
