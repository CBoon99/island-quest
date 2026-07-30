# Island Quest

Gamified family trivia PWA for kids (product brief: Island Quest).

## Players

- **Aryan** — Quest Level 3
- **Ayla** — Quest Level 1

Parent area for **James**. Both kids pick any of the **5 guides** (same guide allowed).

## Run locally

```bash
cp .env.example .env   # add ELEVENLABS_API_KEY + voice IDs
npm install
npm run dev            # web :5173 + TTS API :8791
```

- Green gate: `npm run verify`
- TTS smoke: `npm run tts:smoke`

## Features

- Quick Play, World Quest, Daily Challenge, Boss Battle, Revenge Round
- Confetti / fanfare / bomb celebrations on hits
- Comic miss + fart SFX (parent can disable)
- ElevenLabs guide voices (server-side only)
- Server-authoritative scoring

Secrets never go in the repo. Configure Netlify env for deploy.
