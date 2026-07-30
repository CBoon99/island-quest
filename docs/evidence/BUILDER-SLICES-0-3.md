# Builder evidence — Slices 0–3

| Field | Value |
|-------|--------|
| Mission | d968e79b Island Quest |
| Agent | BUILDER (slices 0–3) |
| Date | 2026-07-30 |
| Scope | Foundation, product shell, game engine, persistence |
| Acceptance | **Not claimed** — Independent Verifier + Conductor only |

---

## Commands run

```bash
npm install
node scripts/generate-draft-questions.mjs
node scripts/validate-content.mjs
npm run verify
```

## `npm run verify` result

**Exit code: 0**

| Step | Result |
|------|--------|
| lint | pass (max-warnings 0) |
| typecheck | pass (strict) |
| content:validate | pass — 320 active, d12=160, d34=160, localPride=54, reviewedAt set on 80 |
| test | pass — 23 tests (4 files) |
| build | pass — `dist/` produced |

### Test summary

- `tests/unit/scoring.test.ts` — 13 tests (base, streak, double treasure, second chance, shield, overuse, order, daily, adversarial)
- `tests/unit/week.test.ts` — 3 tests (Makassar local date, Monday start, weekId)
- `tests/unit/selection.test.ts` — 4 tests (counts, composition, hash, no dupes)
- `tests/integration/complete-round.test.ts` — 3 tests (bank size, verified score + leaderboard, duplicate roundId reject)

---

## Key paths shipped

| Area | Paths |
|------|--------|
| Tooling | `package.json`, `vite.config.ts`, `eslint.config.js`, `netlify.toml`, `.env.example`, `.github/workflows/ci.yml` |
| Tokens | `src/styles/tokens.css`, `global.css`, `reset.css` |
| Types/schemas | `src/types/index.ts`, `src/schemas/index.ts` |
| Pure engine | `src/lib/scoring.ts`, `week.ts`, `selection.ts` |
| Config | `src/config/characters.ts`, `worlds.ts`, `powerups.ts`, `players.ts` (Aryan L3, Jasmine L1) |
| Game service | `src/features/game/gameService.ts` |
| Repos | `src/repositories/types.ts`, `memory.ts`, `http.ts`, `local.ts` |
| Client | `src/app/*`, `src/routes/*`, `src/stores/session.ts`, `src/components/*` |
| Functions | `netlify/functions/{health,players,player,start-round,complete-round,leaderboard,rewards}.ts` |
| Content | `content/questions/by-category/*.json` (320 active), `scripts/validate-content.mjs`, `scripts/generate-draft-questions.mjs` |

---

## Binding resolutions followed

- **B1** Blobs-oriented design via `GameRepository`; memory adapter for local/tests; server-authoritative `scoreRound`; client score fields ignored in complete path; offline pending queue without fake leaderboard rank
- **B2** API surface functions present for slices 0–3 set
- **B3** Track A structural ≥300 active green; Track B honest — 80 with `reviewedAt`, remainder agent-templated
- **B4** Quick Play, World Quest, Daily, Revenge, Boss basic HP in client
- **B5** Parent PIN UI default `2468` documented; full rate-limit session deferred to slice 5
- **B6** Game vocabulary in child UI; SVG icons; comic miss path
- **B10** Stack as specified
- **B11** Seed Aryan / Jasmine
- **B12** Slices 0–3 in order

---

## Known gaps (next builders)

| Gap | Owner slice |
|-----|-------------|
| Live ElevenLabs TTS proxy + client audio | 4 |
| Parent PIN hash server, rate limit, admin mutations | 5 |
| Full human review of remaining ~240 questions | 6 / Carl |
| Blobs production adapter (memory used in function process for now) | 3 polish / deploy |
| Playwright e2e critical path | 7–8 |
| PWA manifest + offline shell polish | 7 |
| Character art still gradient placeholders (R-ART) | 7 |
| Head-to-head out of scope | — |
| Deploy not authorised | Carl |

---

## How to run locally

```bash
cd island-quest
cp .env.example .env
npm ci
npm run dev          # UI + fixture/memory scoring (VITE_USE_FIXTURE_API default true)
npm run verify
```

Builder self-check only. **Do not treat as mission ACCEPT.**
