# ElevenLabs full setup (2026-07-30)

## Source of key

Copied from Carl’s existing Acting practice app:

`Documents/Acting practice, in real movies scences/apps/web/.env.local`

Key stays **only** in Island Quest `.env` (mode 600, gitignored). Never `VITE_`.

## Live smoke

```bash
npm run tts:smoke   # 5/5 characters → .data/tts-smoke/*.mp3
```

## Character → voice (server env)

| Character | Env var | Public voice (label) |
|-----------|---------|----------------------|
| Captain Coral | `ELEVENLABS_CAPTAIN_CORAL_VOICE_ID` | Callum |
| Professor Paws | `ELEVENLABS_PROFESSOR_PAWS_VOICE_ID` | Daniel |
| Nova | `ELEVENLABS_NOVA_VOICE_ID` | Lily |
| Rex | `ELEVENLABS_REX_VOICE_ID` | Bill |
| Miko | `ELEVENLABS_MIKO_VOICE_ID` | Matilda |

Model: `eleven_multilingual_v2`

## Local runtime

| Piece | Detail |
|-------|--------|
| Local API | `node scripts/local-api.mjs` → `127.0.0.1:8791` |
| Vite proxy | `/api/*` → `8791` |
| Dev command | `npm run dev` (api + web via concurrently) |
| Netlify Function | `netlify/functions/text-to-speech.ts` uses same env vars in production |

Note: port **8787** is occupied on this machine by another local service; Island Quest uses **8791**.

## Account note

Subscription at setup: **free** tier (~10k characters/month). Voice list API lacks `voices_read` permission; TTS works. Prefer short lines for previews.

## Security

- API key not in browser bundle (verified earlier + not introduced here)
- Client sends `characterId` only; server maps to voice id allowlist
- Rate limit + max chars enforced on local API and Netlify function
