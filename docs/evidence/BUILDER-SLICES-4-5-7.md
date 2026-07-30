# Builder evidence — Slices 4, 5, 7

| Field | Value |
|-------|--------|
| Mission | d968e79b Island Quest |
| Agent | BUILDER (slices 4, 5, 7) |
| Date | 2026-07-30 |
| Scope | ElevenLabs TTS, parent controls, polish + PWA |
| Acceptance | **Not claimed** — Independent Verifier + Conductor only |

---

## Commands run

```bash
npm run verify
```

## `npm run verify` result

**Exit code: 0**

| Step | Result |
|------|--------|
| lint | pass (max-warnings 0) |
| typecheck | pass (strict) |
| content:validate | pass — 320 active, d12=160, d34=160, localPride=54 |
| test | pass — **45 tests** (8 files) |
| build | pass — `dist/` produced including PWA assets |

### Test summary (new + prior)

| File | Focus |
|------|--------|
| `tests/integration/tts.test.ts` | validate body, allowlist, length cap, no client voiceId, mocked ElevenLabs success/failure, 503 when key missing, response never leaks API key |
| `tests/unit/tts-client.test.ts` | mute, fail-open “Voice unavailable”, cache identical text+character |
| `tests/integration/parent-auth.test.ts` | wrong PIN 401, rate limit 5/15m → 429, session token, authorized admin-reward, unauthorized without token |
| `tests/unit/copy-deny-list.test.ts` | B6 deny-list present; child-facing src strings scanned |
| Prior | scoring, week, selection, complete-round integrity |

---

## Slice 4 — ElevenLabs TTS

| Item | Path / behavior |
|------|-----------------|
| Function | `netlify/functions/text-to-speech.ts` |
| Helpers | `netlify/functions/_shared/tts.ts`, `rateLimit.ts` |
| Allowlist | characterId → env voice ID (`ELEVENLABS_*_VOICE_ID`); client cannot pass `voiceId` |
| Caps | `TTS_MAX_CHARS` (default 500), `TTS_RATE_LIMIT_PER_MINUTE` (default 30) |
| Key | `ELEVENLABS_API_KEY` server-only; never in responses |
| Missing key | HTTP **503** + message **Voice unavailable**; app continues |
| Client | `src/features/audio/ttsClient.ts` — memory + sessionStorage cache index, mute, stop on leave |
| UI | Characters preview + mute; PlayPage narrate/replay + stop on leave/advance; fail-open banner |

---

## Slice 5 — Parent controls

| Item | Path / behavior |
|------|-----------------|
| Auth | `netlify/functions/parent-auth.ts` + `_shared/parentAuth.ts` |
| PIN | `PARENT_PIN_HASH` preferred; else hash of `PARENT_PIN` (default **2468**) |
| Rate limit | 5 failures / 15 minutes per client IP |
| Session | HMAC-signed bearer, 4h expiry (`SESSION_SECRET`) |
| Admin | `admin-reward`, `admin-player`, `admin-bonus-points`, `admin-reset-week` |
| Client API | `src/features/parent/parentApi.ts` (fixture path when `VITE_USE_FIXTURE_API≠false`) |
| UI | Gate, dashboard (week board + reward), players, rewards setup, settings (sound layers + week reset) |
| Repo | `addBonusPoints` + `resetWeekLeaderboard` on memory `GameRepository` |

---

## Slice 7 — Polish + PWA

| Item | Path / behavior |
|------|-----------------|
| Manifest | `public/manifest.webmanifest` → `dist/manifest.webmanifest` |
| Icons | `public/icons/icon-192.svg`, `icon-512.svg`, favicon |
| Theme / standalone | theme_color `#0d6e6e`, display standalone; `index.html` link + apple meta |
| SW | `public/sw.js` — minimal offline shell (network-first navigate, cached shell fallback message) |
| Reduced motion | CSS `@media (prefers-reduced-motion)` + `html.reduced-motion` from prefs |
| States | `.state-loading` / empty / error / voice / ok |
| Sound layers | master, music, SFX, voice, comic fart (separate) in parent settings + `features/audio/sound.ts` |
| Copy deny-list | `src/config/copyDenyList.ts` + unit scan test |

---

## Persistence note (R-BLOBS)

Still **memory** process store via `getServerRepo()` (`PERSISTENCE_DRIVER=memory`). Netlify Blobs adapter not wired this slice; documented for deploy. Fixture client uses same memory interface.

---

## Binding resolutions followed

- **B2** API surface: `text-to-speech`, `parent-auth`, `admin-*` added
- **B5** PIN hash, rate limit, session
- **B6** deny-list test; reduced motion; fart separate toggle
- **B7** `npm run verify` green with output above
- **B9** no secrets committed; TTS key server-only
- **B4** PWA manifest + icons + standalone + basic offline shell

---

## Gaps for Independent Verifier

| Gap | Notes |
|-----|--------|
| Live ElevenLabs smoke | Requires real `ELEVENLABS_API_KEY` + voice IDs in env — CI uses mocks (R-TTS) |
| Playwright e2e | Not added this slice; rely on unit/integration |
| Parent auth vs live Netlify | Handlers tested in-process; `netlify dev` end-to-end optional |
| Blobs production adapter | Memory only (R-BLOBS) |
| Content Track B full review | Still ~240 without human review (R-CONTENT) |
| Character art | Gradient placeholders remain (R-ART) |
| Fixture vs HTTP parent path | Default `VITE_USE_FIXTURE_API=true` uses local memory for parent admin; set false + netlify dev for real functions |
| Self-acceptance | **Not claimed** |

---

## How to exercise locally

```bash
cd island-quest
cp .env.example .env   # optional: set ELEVENLABS_*, PARENT_PIN
npm ci
npm run verify
npm run dev            # UI + fixture parent PIN 2468
# optional: npm run dev:netlify  # real functions when configured
```

Builder self-check only. **Do not treat as mission ACCEPT.**
