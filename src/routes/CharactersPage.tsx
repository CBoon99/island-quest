import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CHARACTERS } from '@/config/characters';
import { useSession } from '@/stores/session';
import { getClientMemoryRepo } from '@/repositories/memory';
import { getPrefs, setPrefs } from '@/repositories/local';
import {
  isVoiceEnabled,
  speakText,
  stopTts,
} from '@/features/audio/ttsClient';
import styles from './CharactersPage.module.css';

const GUIDE_COUNT = CHARACTERS.filter((c) => c.enabled).length;

export function CharactersPage() {
  const { playerId = '' } = useParams();
  const { players, loadPlayers } = useSession();
  const player = players.find((p) => p.id === playerId);
  const other = players.find((p) => p.id !== playerId && p.enabled);
  const [voiceNote, setVoiceNote] = useState('');
  const [saveNote, setSaveNote] = useState('');
  const [muted, setMuted] = useState(!getPrefs().voice);
  const [previewing, setPreviewing] = useState<string | null>(null);

  useEffect(() => {
    return () => stopTts();
  }, []);

  async function selectGuide(id: string) {
    if (!playerId || !player) return;
    await getClientMemoryRepo().updatePlayer(playerId, { guideCharacterId: id });
    await loadPlayers();
    const name = CHARACTERS.find((c) => c.id === id)?.name ?? 'Guide';
    const shared =
      other && other.guideCharacterId === id
        ? ` ${other.displayName} has this guide too — that’s fine!`
        : '';
    setSaveNote(`${player.displayName}’s guide is now ${name}.${shared}`);
  }

  async function preview(characterId: string, text: string) {
    stopTts();
    setPreviewing(characterId);
    setVoiceNote('');
    const prefs = getPrefs();
    const result = await speakText({
      text,
      characterId,
      enabled: isVoiceEnabled({ masterSound: prefs.masterSound, voice: prefs.voice }),
    });
    if (result.status === 'muted') {
      setVoiceNote('Voice is muted — tap Unmute voice.');
    } else if (result.status !== 'ok') {
      setVoiceNote('Voice unavailable right now. You can still pick a guide.');
    } else {
      setVoiceNote('');
    }
    setPreviewing(null);
  }

  function toggleMute() {
    const next = setPrefs({ voice: muted });
    setMuted(!next.voice);
    if (!next.voice) stopTts();
  }

  const guides = CHARACTERS.filter((c) => c.enabled);

  return (
    <div className="app-screen">
      <header className={styles.headerRow}>
        <div>
          <h1>{player ? `${player.displayName}’s Guide` : 'Choose your Guide'}</h1>
          <p className="muted">
            All {GUIDE_COUNT} guides are available. {other?.displayName ?? 'The other player'}{' '}
            can pick the same one — each profile keeps its own choice.
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={toggleMute}>
          {muted ? 'Unmute voice' : 'Mute voice'}
        </button>
      </header>
      {saveNote ? (
        <p className={styles.saveNote} role="status">
          {saveNote}
        </p>
      ) : null}
      {voiceNote ? (
        <p className="state-voice" role="status">
          {voiceNote}
        </p>
      ) : null}
      <div className={styles.list} role="list">
        {guides.map((c) => {
          const selected = player?.guideCharacterId === c.id;
          const otherAlso = other?.guideCharacterId === c.id;
          return (
            <div
              key={c.id}
              role="listitem"
              className={`card ${styles.row} ${selected ? styles.selected : ''}`}
            >
              <button
                type="button"
                className={styles.selectBtn}
                onClick={() => void selectGuide(c.id)}
                aria-pressed={selected}
              >
                <div className={styles.portrait} data-id={c.id} />
                <div className={styles.body}>
                  <strong>{c.name}</strong>
                  <span className="muted">{c.description}</span>
                  <em className={styles.preview}>“{c.previewText}”</em>
                  {otherAlso && !selected ? (
                    <span className={styles.shared}>
                      {other?.displayName} also uses this guide
                    </span>
                  ) : null}
                  {otherAlso && selected ? (
                    <span className={styles.shared}>You both picked this — OK!</span>
                  ) : null}
                </div>
                {selected ? <span className={styles.badge}>Yours</span> : null}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={previewing === c.id}
                onClick={() => void preview(c.id, c.previewText)}
              >
                {previewing === c.id ? '…' : 'Preview voice'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
