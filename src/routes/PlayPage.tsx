import { useCallback, useEffect, useMemo, useState, type ComponentProps } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSession } from '@/stores/session';
import type { PowerUpId, Question, RoundMode } from '@/types';
import { DEFAULT_TIME_LIMIT_MS } from '@/lib/scoring';
import { getPowerUp } from '@/config/powerups';
import { SvgIcon } from '@/components/ui/SvgIcon';
import { getPrefs } from '@/repositories/local';
import { isVoiceEnabled, speakText, stopTts } from '@/features/audio/ttsClient';
import { playSfx } from '@/features/audio/sound';
import { FxOverlay, type FxMode } from '@/components/feedback/FxOverlay';
import styles from './PlayPage.module.css';

const MODE_MAP: Record<string, RoundMode> = {
  quick: 'quick-play',
  world: 'world-quest',
  daily: 'daily-challenge',
  boss: 'boss-battle',
  rematch: 'rematch',
};

const CORRECT_LINES = [
  'Yes! Treasure found!',
  'Boom! Perfect answer.',
  'You nailed it!',
  'Legendary hit!',
  'Coins secured!',
];

const MISS_LINES = [
  'Oops confetti! You found a tricky one.',
  'Nearly! The octopus stole that one.',
  'Wobble! The pirate map was upside down.',
  'Pffffffft! The volcano got us.',
  'Missed it—still a brave explorer.',
];

function powerIcon(id: PowerUpId): ComponentProps<typeof SvgIcon>['name'] {
  switch (id) {
    case 'fifty-fifty':
      return 'half';
    case 'extra-time':
      return 'clock';
    case 'ask-guide':
      return 'guide';
    case 'double-treasure':
      return 'double';
    case 'second-chance':
      return 'retry';
    case 'shield':
      return 'shield';
  }
}

export function PlayPage() {
  const { playerId = '', mode: modeParam = 'quick' } = useParams();
  const [search] = useSearchParams();
  const worldId = search.get('world') ?? undefined;
  const mode = MODE_MAP[modeParam] ?? 'quick-play';
  const navigate = useNavigate();

  const {
    beginRound,
    round,
    questions,
    questionIndex,
    powerUpsRemaining,
    consumePowerUp,
    recordAttempt,
    advanceQuestion,
    finishRound,
    loading,
    selectPlayer,
    getActivePlayer,
  } = useSession();

  const [phase, setPhase] = useState<'boot' | 'preround' | 'question' | 'feedback'>(
    'boot',
  );
  const [error, setError] = useState('');
  const [hiddenAnswers, setHiddenAnswers] = useState<string[]>([]);
  const [usedThisQ, setUsedThisQ] = useState<PowerUpId[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [timeLeftMs, setTimeLeftMs] = useState(30_000);
  const [startedAt, setStartedAt] = useState(0);
  const [feedback, setFeedback] = useState<{
    correct: boolean;
    line: string;
    explanation: string;
    correctText: string;
  } | null>(null);
  const [awaitingSecond, setAwaitingSecond] = useState(false);
  const [firstWrongId, setFirstWrongId] = useState<string | null>(null);
  const [bossHp, setBossHp] = useState(100);
  const [busy, setBusy] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const [fxMode, setFxMode] = useState<FxMode>(null);
  const [fxKey, setFxKey] = useState(0);
  const [hitStreak, setHitStreak] = useState(0);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const q = questions[questionIndex];

  function burstFx(mode: Exclude<FxMode, null>) {
    setFxMode(mode);
    setFxKey((k) => k + 1);
  }

  useEffect(() => {
    selectPlayer(playerId);
  }, [playerId, selectPlayer]);

  // Stop voice when leaving the play screen or advancing questions
  useEffect(() => {
    return () => stopTts();
  }, []);

  useEffect(() => {
    stopTts();
    setVoiceNote('');
  }, [questionIndex]);

  const narrateQuestion = useCallback(
    async (question: Question) => {
      const player = getActivePlayer();
      const characterId = player?.guideCharacterId || 'captain-coral';
      const prefs = getPrefs();
      const result = await speakText({
        text: question.shortQuestion || question.question,
        characterId,
        enabled: isVoiceEnabled({
          masterSound: prefs.masterSound,
          voice: prefs.voice,
        }),
      });
      if (result.status !== 'ok' && result.status !== 'muted') {
        setVoiceNote('Voice unavailable');
      } else {
        setVoiceNote('');
      }
    },
    [getActivePlayer],
  );

  const boot = useCallback(async () => {
    try {
      setError('');
      await beginRound(mode, worldId);
      setPhase('preround');
    } catch (e) {
      setError((e as Error).message || 'Could not start quest');
      setPhase('boot');
    }
  }, [beginRound, mode, worldId]);

  useEffect(() => {
    void boot();
  }, [boot]);

  const baseLimit = useMemo(() => {
    if (!q || !round) return 30_000;
    return q.timeLimitMs ?? DEFAULT_TIME_LIMIT_MS[round.difficultyLevel];
  }, [q, round]);

  const startQuestion = useCallback(() => {
    const extra = usedThisQ.includes('extra-time') ? 10_000 : 0;
    setTimeLeftMs(baseLimit + extra);
    setStartedAt(Date.now());
    setPhase('question');
    setFeedback(null);
    setHiddenAnswers([]);
    setHint(null);
    setAwaitingSecond(false);
    setFirstWrongId(null);
    setUsedThisQ([]);
    if (q) void narrateQuestion(q);
  }, [baseLimit, usedThisQ, q, narrateQuestion]);

  // Timer
  useEffect(() => {
    if (phase !== 'question' || !q) return;
    const id = window.setInterval(() => {
      setTimeLeftMs((t) => {
        if (t <= 200) {
          window.clearInterval(id);
          return 0;
        }
        return t - 200;
      });
    }, 200);
    return () => window.clearInterval(id);
  }, [phase, q, questionIndex]);

  useEffect(() => {
    if (phase === 'question' && timeLeftMs === 0 && !busy) {
      void submitAnswer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- timeout trigger
  }, [timeLeftMs, phase]);

  function activatePowerUp(id: PowerUpId) {
    if (phase !== 'question' || usedThisQ.includes(id)) return;
    if (!consumePowerUp(id)) return;
    setUsedThisQ((u) => [...u, id]);
    if (id === 'fifty-fifty' && q) {
      const wrong = q.answers.filter((a) => a.id !== q.correctAnswerId).map((a) => a.id);
      const shuffle = [...wrong].sort(() => Math.random() - 0.5);
      setHiddenAnswers(shuffle.slice(0, 2));
    }
    if (id === 'extra-time') {
      setTimeLeftMs((t) => t + 10_000);
    }
    if (id === 'ask-guide' && q) {
      setHint(q.hint || q.explanation.slice(0, 80));
    }
  }

  async function submitAnswer(answerId: string | null) {
    if (!q || !round || busy) return;
    setBusy(true);
    const responseTimeMs = Math.max(0, Date.now() - startedAt);

    if (awaitingSecond) {
      const correct = answerId === q.correctAnswerId;
      recordAttempt({
        questionId: q.id,
        selectedAnswerId: firstWrongId,
        responseTimeMs,
        powerUpsUsed: usedThisQ,
        secondChanceSelectedAnswerId: answerId ?? undefined,
      });
      showFeedback(correct, q);
      setBusy(false);
      return;
    }

    const correct = answerId === q.correctAnswerId;
    if (!correct && usedThisQ.includes('second-chance') && answerId) {
      setAwaitingSecond(true);
      setFirstWrongId(answerId);
      setBusy(false);
      return;
    }

    // Auto-apply shield from remaining if they activated it
    recordAttempt({
      questionId: q.id,
      selectedAnswerId: answerId,
      responseTimeMs,
      powerUpsUsed: usedThisQ,
    });
    showFeedback(correct, q);
    if (mode === 'boss-battle') {
      setBossHp((hp) => Math.max(0, hp - (correct ? 12 : 0)));
    }
    setBusy(false);
  }

  function showFeedback(correct: boolean, question: Question) {
    stopTts();
    const correctText =
      question.answers.find((a) => a.id === question.correctAnswerId)?.text ?? '';
    setFeedback({
      correct,
      line: correct
        ? CORRECT_LINES[questionIndex % CORRECT_LINES.length]
        : MISS_LINES[questionIndex % MISS_LINES.length],
      explanation: question.explanation,
      correctText,
    });
    setPhase('feedback');
    if (correct) {
      const nextStreak = hitStreak + 1;
      setHitStreak(nextStreak);
      playSfx('hit');
      // Escalating celebration: confetti → streak sparkle → bomb + fanfare
      if (nextStreak >= 3) {
        burstFx('fanfare');
        playSfx('fanfare');
        setTimeout(() => {
          burstFx('bomb');
          playSfx('bomb');
        }, 280);
      } else if (nextStreak === 2) {
        burstFx('hit');
        playSfx('streak');
      } else {
        burstFx('hit');
      }
    } else {
      setHitStreak(0);
      playSfx('miss');
      // Comic miss: purple confetti + unmistakable fart
      burstFx('miss');
      playSfx('fart');
      setTimeout(() => playSfx('fart'), 180);
    }
  }

  async function continueAfterFeedback() {
    stopTts();
    if (questionIndex + 1 >= questions.length) {
      const result = await finishRound();
      navigate(`/player/${playerId}/results`, {
        state: { verified: Boolean(result) },
      });
      return;
    }
    advanceQuestion();
    // reset per-question state then enter question
    setUsedThisQ([]);
    setHiddenAnswers([]);
    setHint(null);
    setAwaitingSecond(false);
    setFirstWrongId(null);
    setFeedback(null);
    setPhase('question');
    const next = questions[questionIndex + 1];
    const limit =
      next?.timeLimitMs ??
      (round ? DEFAULT_TIME_LIMIT_MS[round.difficultyLevel] : 30_000);
    setTimeLeftMs(limit);
    setStartedAt(Date.now());
    if (next) void narrateQuestion(next);
  }

  if (error) {
    return (
      <div className="app-screen app-screen--full">
        <p className="state-error">Something wobbled: {error}</p>
        <button type="button" className="btn btn-primary" onClick={() => void boot()}>
          Try again
        </button>
        <Link to={`/player/${playerId}/home`}>Home</Link>
      </div>
    );
  }

  if (loading || phase === 'boot' || !round) {
    return (
      <div className="app-screen app-screen--full">
        <p className="state-loading">Loading quest…</p>
      </div>
    );
  }

  if (phase === 'preround') {
    return (
      <div className="app-screen app-screen--full">
        <div className={`card ${styles.pre}`}>
          <h1>
            {mode === 'daily-challenge'
              ? 'Daily Challenge'
              : mode === 'boss-battle'
                ? 'Boss Battle'
                : mode === 'rematch'
                  ? 'Revenge Round'
                  : mode === 'world-quest'
                    ? 'World Quest'
                    : 'Quick Play'}
          </h1>
          <p className="muted">{questions.length} questions · power-ups ready</p>
          <ul className={styles.puList}>
            {round.powerUpsGranted.map((id) => (
              <li key={id}>{getPowerUp(id)?.name}</li>
            ))}
          </ul>
          <button type="button" className="btn btn-accent btn-block" onClick={startQuestion}>
            Start
          </button>
          <Link className="btn btn-secondary btn-block" to={`/player/${playerId}/home`}>
            Back
          </Link>
        </div>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="app-screen app-screen--full">
        <p className="state-empty">No question loaded.</p>
      </div>
    );
  }

  const timerPct = Math.max(0, Math.min(100, (timeLeftMs / (baseLimit + 10_000)) * 100));

  return (
    <div className={`${styles.round} app-screen--full`}>
      <header className={styles.header}>
        <div>
          Q {questionIndex + 1}/{questions.length}
        </div>
        <div className={styles.timer} aria-label="Time remaining">
          {Math.ceil(timeLeftMs / 1000)}s
        </div>
        <button
          type="button"
          className={styles.replay}
          aria-label="Replay guide voice"
          onClick={() => void narrateQuestion(q)}
        >
          <SvgIcon name="guide" size={18} />
        </button>
        {mode === 'boss-battle' ? (
          <div className={styles.boss} aria-label="Boss health">
            <div className={styles.bossBar} style={{ width: `${bossHp}%` }} />
          </div>
        ) : null}
      </header>
      {voiceNote ? (
        <p className="state-voice" role="status">
          {voiceNote}
        </p>
      ) : null}
      <div className={styles.timerTrack}>
        <div className={styles.timerFill} style={{ width: `${timerPct}%` }} />
      </div>

      <div className={styles.powerRow}>
        {(
          [
            'fifty-fifty',
            'extra-time',
            'ask-guide',
            'double-treasure',
            'second-chance',
            'shield',
          ] as PowerUpId[]
        )
          .filter((id) => (powerUpsRemaining[id] ?? 0) > 0 || usedThisQ.includes(id))
          .map((id) => (
            <button
              key={id}
              type="button"
              className={styles.pu}
              disabled={
                phase !== 'question' ||
                usedThisQ.includes(id) ||
                (powerUpsRemaining[id] ?? 0) <= 0
              }
              onClick={() => activatePowerUp(id)}
              aria-label={getPowerUp(id)?.name}
              title={getPowerUp(id)?.description}
            >
              <SvgIcon name={powerIcon(id)} size={20} />
              <span>{getPowerUp(id)?.name}</span>
            </button>
          ))}
      </div>

      {hint ? (
        <div className={styles.hint} role="status">
          Guide tip: {hint}
        </div>
      ) : null}
      {awaitingSecond ? (
        <div className={styles.hint} role="status">
          Second Chance — pick again!
        </div>
      ) : null}

      <h2 className={styles.question}>{q.question}</h2>

      <div className={styles.answers}>
        {q.answers.map((a) => {
          if (hiddenAnswers.includes(a.id)) return null;
          return (
            <button
              key={a.id}
              type="button"
              className={styles.answer}
              disabled={phase !== 'question' || busy}
              onClick={() => void submitAnswer(a.id)}
            >
              {a.text}
            </button>
          );
        })}
      </div>

      <FxOverlay mode={fxMode} burstKey={fxKey} reducedMotion={reducedMotion} />

      {phase === 'feedback' && feedback ? (
        <div
          className={`${styles.feedback} ${
            feedback.correct ? styles.ok : styles.miss
          } ${feedback.correct ? styles.feedbackPop : styles.feedbackWobble}`}
          role="dialog"
          aria-label="Answer feedback"
        >
          <div className={styles.feedbackIcon}>
            <SvgIcon name={feedback.correct ? 'check' : 'wobble'} size={36} />
          </div>
          <p className={styles.line}>{feedback.line}</p>
          {feedback.correct && hitStreak >= 2 ? (
            <p className={styles.streakCall}>{hitStreak} in a row — on fire!</p>
          ) : null}
          {!feedback.correct ? (
            <p>
              <strong>Correct answer:</strong> {feedback.correctText}
            </p>
          ) : null}
          <p className={styles.tip}>
            <strong>Treasure tip:</strong> {feedback.explanation}
          </p>
          <button
            type="button"
            className="btn btn-primary btn-block"
            onClick={() => void continueAfterFeedback()}
          >
            {questionIndex + 1 >= questions.length ? 'See results' : 'Got it'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
