# Island Quest — DEV DIRECTOR PACKET

**Mission ID:** d968e79b  
**Role:** Dev Director (plan only — no application code)  
**Author:** Grok Dev Director  
**Date:** 2026-07-30  
**Risk class:** Level 2 (children’s product, secrets, parent PIN, remote scores)  
**Governing:** Product brief §§21–36 · GLOBAL AGENTIC BUILD SYSTEM v1.1 · AGENT_STANDARDS.md · MISSION.md · WORKING.md  

**Status:** PLAN COMPLETE — recommendation at §20  

---

## 1. Stack decision

### Recommendation: **CONFIRM** brief stack (with narrow hardening)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| UI | React 18 + TypeScript (strict) | Matches brief; ecosystem + RTL maturity |
| Bundler | Vite 5/6 | Fast local dev; first-class Netlify SPA |
| Routing | React Router 6/7 (data-router optional later) | Brief routes map cleanly |
| Styling | **CSS Modules + design tokens** (not Tailwind-first) | Tokens enforce Design/UX systems; less utility sprawl for a game UI; Tailwind allowed only if UX Director requires it and Design tokens still own semantics |
| Motion | Motion for React (Framer Motion lineage) | Correct/wrong feedback, leaderboard rank |
| Validation | Zod | Shared client/function schemas |
| Client state | Zustand (minimal stores) | Prefer over Context soup; **no Redux** |
| Unit/component test | Vitest + React Testing Library | Vite-native |
| E2E | Playwright | Brief §32.3 flows |
| Lint/format | ESLint (typescript-eslint) + Prettier | CI green gate |
| Backend | **Netlify Functions only** | No Express, no microservices |
| Voice | ElevenLabs via Function proxy | Key never in browser |
| PWA | `vite-plugin-pwa` or manual manifest + workbox-lite shell | Installable; offline shell only in v1 |
| Package manager | npm (lockfile committed) | Netlify + GH Actions default |

### Explicitly rejected

- Redux / RTK Query  
- Separate Express/Nest/Fastify server  
- Microservices / Kubernetes  
- Heavy CMS  
- Auth0/Clerk/etc. for family-only v1  
- Generative AI as live question source without review  
- `any`-heavy TypeScript  

### Versions policy

1. **Pin major.minor** in `package.json` for app runtime deps; use `^` only for pure tooling if CI proves stable.  
2. Prefer **current LTS Node** for CI and Netlify (`engines.node`: active LTS, e.g. `>=20 <23`).  
3. **One dependency upgrade stream** — no drive-by upgrades mid-mission.  
4. New deps require: purpose, alternative rejected, secret/network impact, and Design/Dev contract touch.  
5. **No beta-only** framework features required for MVP.  
6. Netlify Functions: **TypeScript**, built via Netlify’s recommended bundling (esbuild). Shared Zod types imported from `src/schemas` (or `packages/shared` only if split becomes necessary — prefer **single package** monorepo-of-one).  

### Challenge to brief (minor, recorded)

- Brief allows “CSS Modules, Tailwind or disciplined tokens.” **Dev picks CSS Modules + tokens** so Design Director owns a token file, not a utility soup.  
- Brief lists Supabase/Neon/Blobs. **Dev picks Netlify Blobs as default remote store** (see §7) to avoid a second vendor account blocking one continuous mission; repository interface keeps Supabase/Neon as a drop-in later.  

---

## 2. Repository structure (exact tree)

Repo root = `island-quest/` (already created under Kids Daily Tasks). Application code lands here; **not** BoonMind X.

```text
island-quest/
├── .github/
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── MISSION.md
│   ├── PRODUCT_BRIEF.md          # curated summary / link to brief
│   ├── TECHNICAL_SPEC.md         # post-synthesis
│   ├── CONTENT_GUIDE.md
│   ├── DESIGN_SYSTEM.md          # from UX/UI Director
│   ├── TEST_PLAN.md
│   ├── DEPLOYMENT.md
│   ├── DECISIONS.md
│   ├── BUILD_LOG.md
│   ├── KNOWN_ISSUES.md
│   ├── directors/
│   │   ├── 01-DESIGN-DIRECTOR.md
│   │   ├── 02-DEV-DIRECTOR.md    # this file
│   │   ├── 03-UX-UI-DIRECTOR.md
│   │   └── 04-CONDUCTOR-SYNTHESIS.md
│   └── evidence/                 # gate outputs, screenshots, reports
├── netlify/
│   └── functions/
│       ├── _shared/              # env, errors, auth helpers, repo factory
│       ├── text-to-speech.ts
│       ├── players.ts
│       ├── player.ts
│       ├── questions.ts
│       ├── start-round.ts
│       ├── complete-round.ts
│       ├── leaderboard.ts
│       ├── rewards.ts
│       ├── parent-auth.ts
│       ├── admin-reward.ts
│       ├── admin-player.ts
│       └── admin-bonus-points.ts
├── public/
│   ├── characters/
│   ├── worlds/
│   ├── sounds/
│   ├── icons/
│   ├── images/questions/         # image-choice assets
│   └── manifest.webmanifest
├── scripts/
│   ├── validate-content.mjs      # CI content gate
│   ├── generate-draft-questions.mjs  # offline draft generator (not live AI)
│   └── seed-local.mjs            # optional local Blobs/file seed
├── content/
│   ├── questions/                # source of truth for question bank
│   │   ├── by-category/          # *.json or *.jsonl batches
│   │   └── manifest.json         # counts, coverage report input
│   ├── sources/                  # licence/source ledger
│   └── review-log.md             # human review status notes
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── providers.tsx
│   │   └── router.tsx
│   ├── components/               # shared presentational only
│   │   ├── ui/                   # Button, Modal, Card, Progress…
│   │   └── feedback/             # confetti, wobble, score fly
│   ├── config/
│   │   ├── characters.ts
│   │   ├── worlds.ts
│   │   ├── scoring.ts
│   │   ├── powerups.ts
│   │   └── env.public.ts         # ONLY non-secret public config
│   ├── data/
│   │   └── questions/            # re-export or build-time import from content/
│   ├── features/
│   │   ├── achievements/
│   │   ├── audio/
│   │   ├── characters/
│   │   ├── game/                 # round engine, answer flow
│   │   ├── leaderboard/
│   │   ├── parent/
│   │   ├── profiles/
│   │   ├── rewards/
│   │   └── worlds/
│   ├── hooks/
│   ├── lib/
│   │   ├── scoring.ts            # pure scoring (unit-tested)
│   │   ├── week.ts               # Asia/Makassar weekId
│   │   ├── selection.ts          # question selection rules
│   │   ├── audio-cache.ts
│   │   └── errors.ts
│   ├── repositories/
│   │   ├── types.ts              # GameRepository interface
│   │   ├── local.ts              # prefs, offline queue
│   │   ├── http.ts               # browser → Functions client
│   │   └── memory.ts             # tests + fixture shell
│   ├── routes/                   # route-level page components
│   ├── schemas/                  # Zod — shared with functions via path alias
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── global.css
│   │   └── reset.css
│   ├── types/
│   ├── test/                     # test utils, setup
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── unit/
│   ├── integration/              # function handlers + repo
│   ├── e2e/
│   └── fixtures/
├── WORKING.md
├── .env.example
├── .gitignore
├── .prettierrc
├── eslint.config.js
├── index.html
├── netlify.toml
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

**Single package.** Do not introduce a monorepo until a second deployable forces it.

---

## 3. Package scripts

```json
{
  "scripts": {
    "dev": "vite",
    "dev:netlify": "netlify dev",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint . --max-warnings 0",
    "typecheck": "tsc -b --pretty false",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "content:validate": "node scripts/validate-content.mjs",
    "content:generate-drafts": "node scripts/generate-draft-questions.mjs",
    "verify": "npm run lint && npm run typecheck && npm run content:validate && npm run test && npm run build"
  }
}
```

### Single green gate command

```bash
npm run verify
```

**Definition of green gate (Builder self-check AND Verifier technical gate):**

| Step | Must |
|------|------|
| `lint` | exit 0, max-warnings 0 |
| `typecheck` | exit 0, strict |
| `content:validate` | exit 0 on all `active` + structural rules on all statuses |
| `test` | exit 0 (unit + component + integration as wired) |
| `build` | exit 0, `dist/` produced |

**Not in default `verify` (run separately / nightly / pre-accept):**

- `test:e2e` (browser install cost)  
- Live ElevenLabs smoke (needs secrets + network)  
- Netlify production deploy (human-only)  

CI may run e2e on a second job with Playwright browsers cached.

---

## 4. CI (GitHub Actions) outline

**File:** `.github/workflows/ci.yml`  

**Triggers:** push + pull_request to `main` and `build/**`

### Job A — `green-gate` (required)

```text
runs-on: ubuntu-latest
node: LTS (matrix optional later; start single)
steps:
  - checkout
  - setup-node (cache npm)
  - npm ci
  - npm run verify
  - upload dist/ as artifact (optional, 7 days)
```

### Job B — `e2e` (required before ACCEPT, may be non-blocking early)

```text
needs: green-gate
steps:
  - checkout, npm ci
  - playwright install --with-deps
  - npm run build
  - npm run test:e2e
  - upload playwright report on failure
```

### Job C — secrets scan (recommended)

```text
- gitleaks or trufflehog (or `git grep` for ELEVENLABS_API_KEY / sk_ patterns)
- fail if .env committed
```

### Rules

- **No merge with failing Job A.**  
- Job B required before mission ACCEPT.  
- No deploy job in CI until Carl authorises (WORKING.md: local until told).  
- Cache `~/.npm` and Playwright browsers.  

---

## 5. `netlify.toml` + Functions ownership

### netlify.toml (spec — Builder implements)

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"
  # external_node_modules as needed for @netlify/blobs etc.

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Optional headers: security headers, cache static assets
```

**Note:** Prefer browser calling `/.netlify/functions/...` or `/api/...` consistently; pick **one** public base path in Design/Dev synthesis (`/api/*` recommended for cleaner client).

### Functions list + ownership

| Function | Method | Purpose | Owner (feature) | Shared contracts |
|----------|--------|---------|-----------------|------------------|
| `text-to-speech` | POST | ElevenLabs proxy, allowlist voice, rate limit, length cap | `features/audio` + functions | `schemas/tts.ts` |
| `players` | GET | List players | `features/profiles` | `schemas/player.ts` |
| `player` | GET/PATCH | Get/update player (guide, etc.) | `features/profiles` | `schemas/player.ts` |
| `questions` | GET | Serve **active** questions filtered for round prep (or ids only) | `features/game` | `schemas/question.ts` |
| `start-round` | POST | Create round server-side; lock question set; issue `roundId` | `features/game` | `schemas/round.ts` |
| `complete-round` | POST | **Authoritative scoring**; anti-dupe; leaderboard update | `features/game` + scoring lib | `schemas/round.ts` |
| `leaderboard` | GET | Weekly board by `weekId` | `features/leaderboard` | `schemas/leaderboard.ts` |
| `rewards` | GET | Weekly reward config | `features/rewards` | `schemas/reward.ts` |
| `parent-auth` | POST | PIN verify → short-lived session token | `features/parent` | `schemas/parent.ts` |
| `admin-reward` | POST | Set weekly reward (authz) | `features/parent` | parent session |
| `admin-player` | POST | Difficulty, enable categories, fix scores | `features/parent` | parent session |
| `admin-bonus-points` | POST | Award bonus weekly points | `features/parent` | parent session |

**Optional later (not MVP blocker):** `weekly-rollover` scheduled function — can be **lazy rollover** on read (if request sees new week, archive prior) to avoid Netlify scheduled functions complexity.

### Function rules

- All inputs/outputs Zod-validated.  
- Shared error shape `{ error: { code, message, requestId } }`.  
- No stack traces, no provider raw bodies, no secrets in responses.  
- Scoring math lives in **`src/lib/scoring.ts`** and is imported by `complete-round` (same pure module unit-tested).  

---

## 6. Env vars (`.env.example`)

**Never prefix secrets with `VITE_`.** Only non-secrets may be public.

```text
# --- Public / safe (may use VITE_ only for non-secrets if needed) ---
VITE_APP_NAME=Island Quest
VITE_APP_TIMEZONE=Asia/Makassar
# Optional public flag for demos
VITE_USE_FIXTURE_API=false

# --- Server-only (Netlify Functions / netlify dev) — NO VITE_ ---
APP_TIMEZONE=Asia/Makassar
APP_NAME=Island Quest

# ElevenLabs
ELEVENLABS_API_KEY=
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_CAPTAIN_CORAL_VOICE_ID=
ELEVENLABS_PROFESSOR_PAWS_VOICE_ID=
ELEVENLABS_NOVA_VOICE_ID=
ELEVENLABS_REX_VOICE_ID=
ELEVENLABS_MIKO_VOICE_ID=

# Persistence (Blobs needs site context on Netlify; local uses fallback)
# If using Supabase/Neon later:
DATABASE_URL=
DATABASE_ANON_KEY=
DATABASE_SERVICE_KEY=
PERSISTENCE_DRIVER=blobs   # blobs | memory | supabase (future)

# Parent gate
PARENT_PIN_HASH=
SESSION_SECRET=

# Optional
SENTRY_DSN=
TTS_RATE_LIMIT_PER_MINUTE=30
TTS_MAX_CHARS=500
```

### Rules

1. `.env` gitignored; only `.env.example` committed.  
2. Client may only read `import.meta.env.VITE_*` non-secrets.  
3. Functions read `process.env.*` server-side.  
4. Missing ElevenLabs → TTS function returns safe error; UI degrades (brief §31.1).  
5. Missing persistence secrets in local dev → `memory` or file-backed driver with loud console warning — **never** silent fake “remote success”.  
6. `PARENT_PIN_HASH` = bcrypt/scrypt/argon2 hash of PIN; never store plaintext PIN.  

---

## 7. Persistence implementation plan

### Decision: **Netlify Blobs + repository pattern** (default)

| Concern | Approach |
|---------|----------|
| Authoritative scores / leaderboard / progress | Remote via Netlify Functions → Blobs |
| UI prefs, selected profile, audio cache keys, round draft | `localStorage` |
| Offline mid-round | Local round state + pending completion queue |
| Weekly archive | Lazy week boundary on read/write using `APP_TIMEZONE` |

**Why Blobs over Supabase for v1 continuous mission**

- No second vendor signup/blocker for local + Netlify path.  
- Family scale (2 players) fits key/value perfectly.  
- Aligns with “Netlify-only backend” simplicity.  
- **Trade-off:** weaker ad-hoc query; mitigated by small data + explicit keys.  

**When to switch to Supabase/Neon:** >10 players, complex parent analytics, or Carl wants SQL — swap only `repositories/server/*` behind `GameRepository`.

### Interface (align with brief §21.3; extend for integrity)

```ts
// Conceptual contract — Design Director may refine field shapes
interface GameRepository {
  getPlayers(): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | null>;
  updatePlayer(id: string, patch: PlayerPatch): Promise<Player>;

  createRound(input: StartRoundInput): Promise<RoundSession>;
  getRound(roundId: string): Promise<RoundSession | null>;
  completeRound(input: CompleteRoundInput): Promise<VerifiedRoundResult>; // server-only path

  saveAttempt(attempt: QuestionAttempt): Promise<void>; // optional detail store
  getLeaderboard(weekId: string): Promise<Leaderboard>;
  getWeeklyReward(weekId: string): Promise<WeeklyReward | null>;
  updateWeeklyReward(reward: WeeklyReward): Promise<void>;
  applyBonusPoints(playerId: string, weekId: string, points: number, reason: string): Promise<void>;
}
```

### Key layout (Blobs)

```text
players/{playerId}
rounds/{roundId}
rounds-by-player/{playerId}/{weekId}/{roundId}   # index keys or list metadata
leaderboard/{weekId}
rewards/{weekId}
parent/session-meta (rate limit counters)
tts-cache/{hash}   # optional audio binary or skip and client-cache only
```

### Scoring integrity path

1. Client calls `start-round` → server selects questions (or validates client request against rules), stores `RoundSession` with expected question IDs, difficulty, issuedAt.  
2. Client plays; may keep answers locally.  
3. Client calls `complete-round` with `{ roundId, answers: [{ questionId, selectedAnswerId, responseTimeMs, powerUps[] }] }`.  
4. Server loads round + canonical questions; computes score/XP/coins; rejects if round already completed or expired; updates player + leaderboard atomically as best-effort sequential writes with idempotent `roundId`.  
5. Client **displays only verified result** from response — never trusts local score for leaderboard.

### Offline queue

- On network fail after local finish: store `pendingCompletions[]` in localStorage.  
- On reconnect: flush with same `roundId` (idempotent).  
- UI: “Saving…” / “Saved” / “Couldn’t save — will retry” — never fake leaderboard climb.

### Local-dev drivers

| Driver | Use |
|--------|-----|
| `memory` | Unit/integration tests |
| `file` or in-memory + seed | `netlify dev` without Blobs |
| `blobs` | Netlify deploy / `netlify dev` with Blobs support |

---

## 8. Feature module ownership map

| Module | Directory | Owns | Shared contracts (read-only for others) |
|--------|-----------|------|----------------------------------------|
| Shell / app | `src/app`, `src/routes` | Router, layout, nav shell | route paths |
| UI primitives | `src/components/ui` | Buttons, modals, focus | design tokens |
| Feedback FX | `src/components/feedback` | confetti, wobble | motion reduced-motion API |
| Profiles | `src/features/profiles` | select player, profile strip | `Player` schema |
| Characters | `src/features/characters` | picker, preview TTS trigger | `GuideCharacter` config |
| Worlds | `src/features/worlds` | map, unlock UI | `worlds.ts` config |
| Game engine | `src/features/game` | round UI, answer flow, power-ups client | round schemas, scoring display |
| Scoring pure | `src/lib/scoring`, `selection`, `week` | **no React** | unit tests mandatory |
| Audio | `src/features/audio` | SFX, music, TTS client, mute | TTS request schema |
| Leaderboard | `src/features/leaderboard` | weekly board UI | leaderboard schema |
| Rewards | `src/features/rewards` | weekly prize UI | reward schema |
| Achievements | `src/features/achievements` | badges titles | achievement config |
| Parent | `src/features/parent` | PIN gate, dashboard, admin actions | parent session |
| Content | `content/`, `scripts/validate-content` | question bank integrity | `Question` schema |
| Repositories | `src/repositories`, `netlify/functions/_shared` | persistence adapters | `GameRepository` |
| Functions | `netlify/functions/*` | HTTP boundary, authz, TTS | Zod schemas |

**Parallel build rule:** only one agent owns a directory at a time; schemas under `src/schemas` are **Conductor-controlled shared contracts** — changes require design note in DECISIONS.md.

---

## 9. Build sequence — vertical slices (one continuous mission)

Brief phases 0–8 re-cut into **shippable vertical slices**. Each slice: implement → Builder self-check (`npm run verify` + slice tests) → Independent verify before next slice code is accepted. Code for later slices may not land partially “for later” as fake completion.

### Slice 0 — Foundation (Phase 0)

**Deliverable:** Repo bootstrapped; scripts; CI; tokens stub; netlify.toml; .env.example; empty routes shell; `verify` green on empty/smoke tests.

**Acceptance**

- `npm run verify` green  
- CI workflow present  
- No secrets in tree  
- Node engines set  

**Tests**

- Smoke: app mounts  
- content:validate handles empty/minimal fixture without false green on “300 questions” (see content slices)

---

### Slice 1 — Static product shell (Phase 1)

**Deliverable:** All primary routes with **fixture data**; player select; home; worlds; characters UI (no live TTS); leaderboard fixture; parent shell (no real auth); bottom nav; game language (no school LMS copy).

**Acceptance**

- Navigate all child routes on mobile viewport  
- Two fixture profiles with different difficulty labels  
- Parent route reachable, gated by stub  

**Tests**

- Component: profile cards, nav  
- E2E skeleton: select player → home  

---

### Slice 2 — Core game engine (local/fixture) (Phase 2)

**Deliverable:** Question model; round generator (in-memory); answer flow; pure scoring; streaks; results screen; power-ups rules; correct/wrong feedback hooks (animation + SFX stubs); rematch list local.

**Acceptance**

- Complete 5-q Quick Play fully client-side with fixture questions  
- Distinct correct vs incorrect UX hooks fire  
- XP/coins/weekly points **computed** (even if not yet remote)  

**Tests**

- Unit: scoring table, streak, power-ups, weekId Asia/Makassar  
- Component: answer select, disabled double-tap  
- Unit: selection composition (5 normal / mix rules)  

---

### Slice 3 — Persistence + verified rounds (Phase 3)

**Deliverable:** `GameRepository`; Functions `start-round`, `complete-round`, `leaderboard`, `players`; Blobs (or memory) driver; client uses verified scores only; offline pending queue.

**Acceptance**

- Round score from server matches unit-tested pure function  
- Duplicate `roundId` rejected  
- Leaderboard updates after complete  
- localStorage alone cannot inflate weekly points  

**Tests**

- Integration: complete-round happy path + dupe + bad answer id  
- Unit: idempotent complete  
- E2E: full round → leaderboard points increase (local netlify dev or mock)  

---

### Slice 4 — ElevenLabs voice (Phase 4)

**Deliverable:** `text-to-speech` function; character voice map; preview; question narration; client cache; mute; failure fallback; rate limit + allowlist + max length.

**Acceptance**

- API key never in client bundle (grep + build inspect)  
- Play continues when TTS fails  
- Preview works for at least one configured voice when key present  

**Tests**

- Unit: allowlist reject unknown voiceId  
- Integration: function rejects oversize text  
- E2E: mock TTS 500 → “Voice unavailable”, round continues  

---

### Slice 5 — Parent controls (Phase 5)

**Deliverable:** PIN hash verify; session; weekly reward config; bonus points; player difficulty edit; basic activity view; rate-limited PIN.

**Acceptance**

- Wrong PIN fails; lockout after N tries  
- Parent sets participation reward + champion bonus for current week  
- Bonus points appear on verified leaderboard  

**Tests**

- Integration: parent-auth + admin-reward authz  
- Component: PIN entry  
- E2E: parent sets reward, child sees it on rewards screen  

---

### Slice 6 — Content bank ≥300 (Phase 6) — **parallel-friendly**

**Deliverable:** ≥300 questions in `content/` with schema; ≥150 level-appropriate younger / ≥150 older (or difficulty 1–2 vs 3–4 mapping); ≥8 categories; local Indonesia/Gili content present; `content:validate` in CI; only `status: active` served.

**Honest continuous-mission cut (still hits brief intent)**

| Track | Target | Gate |
|-------|--------|------|
| A — Structural bank | ≥300 questions with valid schema, unique ids, one correct answer, explanation, difficulty, world, category | `content:validate` must pass; **required for ACCEPT** |
| B — Human review | As many as practical marked `reviewed`/`active` with source fields | Progress in `content/review-log.md`; **do not claim “reviewed” without evidence** |
| C — Preferred launch | 500–750 | Post-v1 stretch |

**Fake completion forbidden**

- No lorem-ipsum presented as active without failing review policy  
- Generator may create `status: "draft"` only  
- CI fails if `active` count < 300 **OR** if active questions fail QA rules  
- Prefer: generate drafts → batch promote via review script after checklist  

**Tests**

- content:validate full suite (§10)  
- Unit: loader filters non-active  
- Distribution report: fail if age-band coverage below thresholds  

---

### Slice 7 — Polish + PWA + a11y (Phase 7)

**Deliverable:** Motion polish; sound mixing; reduced-motion; loading/empty states; tablet/mobile landscape; PWA installability; touch targets; keyboard; no emoji-as-icons; Lighthouse goals as stretch evidence.

**Acceptance**

- Playable on 375×812 and 768×1024  
- `prefers-reduced-motion` respected  
- Manifest + icons present  

**Tests**

- E2E viewport suite  
- axe or equivalent on key screens (where automated)  

---

### Slice 8 — Verification packet (Phase 8)

**Deliverable:** Full independent verify; evidence folder; KNOWN_ISSUES; no deploy unless Carl says so. Netlify-ready config verified via `netlify build` local if available.

**Acceptance**

- All §36 criteria mapped to evidence files  
- Verifier PASS or PASS WITH RECORDED RISK  
- Conductor synthesis  

---

### Continuous mission integration order

```text
Slice 0 → 1 → 2 → 3 → 4 → 5 → 7
              ↘
               6 (content parallel from Slice 2 onward; hard gate before Accept)
Slice 8 last
```

Content (6) **starts as soon as schemas exist (after Slice 2)** and runs in parallel without blocking engine work — but **ACCEPT requires Slice 6 Track A**.

---

## 10. Test strategy — what MUST pass before code is accepted

### 10.1 Unit (must)

| Area | Examples |
|------|----------|
| Scoring | difficulty base, speed/streak/perfect bonuses, no negative infinite |
| Week | `weekId` boundaries Asia/Makassar Mon 00:00 |
| Selection | level mix, no same-day repeat except rematch |
| Power-ups | 50/50 removes two wrong; double treasure once; shield streak |
| Achievements | threshold unlock pure functions |
| Schemas | Question, Round, Player parse/reject |
| Audio cache key | voiceId+text hash stability |
| Duplicate round | second complete throws/ returns conflict |

### 10.2 Component (must)

- Answer cards: single select, no double submit  
- Character picker + preview button state  
- Results rendering (game language, not %)  
- Leaderboard two-player states  
- Parent PIN flow UI  
- Reduced-motion does not crash  

### 10.3 Integration (must)

- `complete-round` end-to-end with memory repo  
- TTS validation path without calling ElevenLabs (mock fetch)  
- Parent admin requires session  

### 10.4 E2E (must before ACCEPT)

Brief §32.3 flows 1–15, with TTS live call **optional** if secrets absent — then mock route required + explicit recorded risk.

### 10.5 Content validation (must)

Script fails on:

- duplicate ids  
- invalid `correctAnswerId`  
- ≠1 correct  
- empty explanation  
- bad difficulty/world/category  
- active without source when policy requires  
- active count < 300  
- missing age-band coverage floors  
- broken image paths for image-choice  
- near-duplicate question text (simple normalize+hash)  

### 10.6 Acceptance rule

**Builder `verify` green ≠ accepted.**  
Acceptance requires Independent Verifier report + Conductor agreement + evidence under `docs/evidence/`.

---

## 11. Independent verification protocol

### What the Verifier runs

1. Clean checkout / clean install (`npm ci`).  
2. `npm run verify` — capture full stdout/stderr to `docs/evidence/verify-*.log`.  
3. Diff vs approved plan/synthesis — scope creep, missing files, stubs labeled complete.  
4. Secrets scan: no `VITE_*` secrets; no keys in `dist/`.  
5. Integration + e2e as available.  
6. Adversarial product tests (requirement-first, **not** Builder’s summary):  
   - score tampering (client posts inflated score → server ignores)  
   - parent routes without PIN  
   - TTS with disallowed voiceId  
   - play with TTS down  
   - school-language grep in child UI strings  
7. Produce `docs/evidence/VERIFIER-REPORT.md` with PASS / FAIL / MORE EVIDENCE REQUIRED / PASS WITH RECORDED RISK.

### What Builder is forbidden to self-claim

- Mission or phase **accepted**  
- Production readiness  
- “Tests pass” without log artifacts  
- “300 reviewed questions” without review evidence  
- Security of PIN/TTS without adversarial checks  
- Deploy success  

### Doom-loop

Same check fails twice → stop → loop-stop report (GLOBAL §10) → replan; no test weakening.

---

## 12. Content bootstrapping (≥300 without fake completion)

### Pipeline

```text
Curriculum map (categories × difficulty)
        ↓
Draft generator script (offline templates / structured fact tables)
        ↓
content/questions/** status: draft
        ↓
validate-content (structural)
        ↓
Human or dedicated review pass → status: reviewed → active
        ↓
Runtime serves only active
```

### Generator honesty

- `content:generate-drafts` may expand **templated, sourced fact cards** into questions (e.g. planets, multiplication tables, Indonesia geography tables with cited sources).  
- Output **must** be `draft`.  
- Promotion to `active` requires: factual check, age language, single correct answer, explanation, sourceName/sourceUrl/licence where non-original trivia.  
- Review log entries: batch id, reviewer, date, count promoted.  

### Parallel track staffing

- Builder A: engine slices 0–5, 7  
- Builder B / content agent: drafts + validation + promotion batches  
- Neither marks Slice 6 complete without validate + count evidence  

### If continuous mission time-box is tight

**Minimum ship for §36.13–14:**

1. ≥300 **structurally valid `active`** questions (Track A).  
2. Documented sample human review (e.g. first 50 fully reviewed) + plan for remainder — only if Conductor + Carl accept **PASS WITH RECORDED RISK** on “fully reviewed.”  
3. **Preferred:** all 300 `active` have passed automated QA + spot-check review recorded.

Dev Director **does not** recommend shipping lorem or obviously wrong facts as active.

---

## 13. Local dev workflow

```bash
cd island-quest
cp .env.example .env   # fill secrets locally; never commit
npm ci
npm run dev            # UI only, fixture/memory API if flagged
# Full stack:
npm run dev:netlify    # functions + Vite; preferred for slices 3+
npm run verify         # before any "done" claim
npm run test:e2e       # when UI stable
```

### Tips

- `VITE_USE_FIXTURE_API=true` for Slice 1–2 UI work without functions.  
- Slice 3+ develop against `netlify dev`.  
- Parent PIN local: generate hash via small script or documented one-liner; store hash only in `.env`.  
- iPad testing: same Wi-Fi → machine LAN URL; or Playwright device emulation first.  
- **No push/deploy** until Carl explicitly asks (WORKING.md).  

---

## 14. Risk register (dev-relevant)

| Risk | Severity | Mitigation |
|------|----------|------------|
| ElevenLabs key in client | Critical | Function proxy only; CI grep; bundle inspect |
| Score cheating | High | Server-side score; start-round binds questions; reject dupes |
| Parent PIN brute force | Medium | Hash + rate limit + lockout; session expiry |
| Child data over-collection | High | Nicknames + age band only; no photos/chat/public |
| Blobs eventual consistency / partial write | Medium | Idempotent roundId; read-after-write checks; keep payload small |
| Content quality / wrong facts | High | status workflow; validate; review log; no live unreviewed AI |
| Fake green (stubbed complete-round) | High | Verifier integration tests; forbid Builder self-accept |
| Agent file collisions | Medium | ownership map §16 |
| Offline double-credit | Medium | server idempotency on roundId |
| School-like UX creep | Product | UX Director + string lint deny-list |

---

## 15. Explicit non-goals and anti-patterns

### Non-goals (v1)

- Public multiplayer, chat, stranger social  
- Payments / IAP  
- Native iOS/Android stores  
- School LMS, teacher portals, curriculum branding in child UI  
- Open-ended AI tutor  
- Real-time voice chat  
- Head-to-head async (post-stable, brief §7.6)  
- Complex virtual economy (gems marketplace)  
- Deploy without Carl  

### Anti-patterns

- Redux “because enterprise”  
- Microservices  
- Trusting client score totals  
- `VITE_ELEVENLABS_API_KEY`  
- Placeholder “Coming soon” screens counted as MVP features  
- Commenting out tests to pass CI  
- `any` to silence scoring types  
- Emoji as production icons  
- localStorage as sole leaderboard  
- Generating questions live in production without review  
- Builder accepting own work  
- Expanding into BoonMind X repo  

---

## 16. File ownership for parallel build

| Lane | Owns | Must not touch without sync |
|------|------|-----------------------------|
| **Foundation** | tooling, CI, netlify.toml, package.json scripts | feature UI |
| **Game** | `features/game`, `lib/scoring`, `lib/selection`, round functions | parent UI, content JSON batches |
| **Shell/UX** | `components`, `styles`, `routes` chrome, worlds/characters presentation | scoring formulas, functions scoring |
| **Audio** | `features/audio`, `text-to-speech` function | game scoring |
| **Parent** | `features/parent`, parent-auth, admin-* | child game engine internals |
| **Persistence** | `repositories`, functions `_shared` store | unrelated UI polish |
| **Content** | `content/**`, validate/generate scripts | app feature code except schema types |
| **Schemas** | `src/schemas/**` | **Conductor lock** — PR note required |

Integration order when parallel: Foundation → Schemas → (Game ‖ Content ‖ Shell) → Persistence wire-up → Audio → Parent → Polish.

---

## 17. Open questions for Conductor

1. **Persistence:** Confirm Netlify Blobs default vs force Supabase/Neon (Carl account readiness)?  
2. **TTS in ACCEPT:** Require live ElevenLabs smoke with real key, or mock + recorded risk if key unavailable in CI?  
3. **Content review bar:** Is automated QA + 300 active enough, or full human review of all 300 for ACCEPT?  
4. **Player seed names:** Real child names vs placeholders until James provides (privacy in git)?  
5. **Parent PIN bootstrap:** How is initial PIN set (env-only vs first-run setup screen)?  
6. **Design Director packet:** Not yet present — Dev assumes brief data model; need conflict resolution after Design lands.  
7. **API base path:** `/api/*` rewrite vs raw `/.netlify/functions/*`?  
8. **Weekly rollover:** Lazy-on-read OK vs scheduled function required for v1?  
9. **PWA offline:** Shell-only confirmed (no offline full play) for v1?  
10. **Repo remote:** Create GitHub `island-quest` now or stay local-only until build complete?  

---

## 18. Definition of done — Dev gate

Dev Director gate is **planning complete** when:

- [x] Stack confirmed with versions policy  
- [x] Repo tree defined  
- [x] Scripts + single `verify` gate defined  
- [x] CI outlined  
- [x] netlify.toml + functions ownership defined  
- [x] Env rules + example defined  
- [x] Persistence + integrity path defined  
- [x] Module ownership defined  
- [x] Vertical slices with acceptance + tests  
- [x] Independent verify protocol  
- [x] Content bootstrap without fake completion  
- [x] Risks / non-goals / parallel ownership  
- [x] Recommendation §20  

**Build may not start** until Conductor challenge of all three director packets + synthesis PASS (WORKING.md).

**Dev technical gate for each build slice:** `npm run verify` green + slice acceptance tests + no secrets + Verifier not self-Builder.

**Mission Dev-related ACCEPT inputs:** §36 items 5, 9–11, 13, 16–20 evidenced.

---

## 19. Key Decisions table

| ID | Decision | Choice | Alternatives rejected | Revisit when |
|----|----------|--------|----------------------|--------------|
| D1 | Frontend stack | React+TS+Vite+RR+Zustand+Zod+Vitest+RTL+Playwright | Next.js (SSR unneeded), Redux | SSR SEO product |
| D2 | CSS approach | CSS Modules + tokens | Tailwind-first | UX Director mandates utility |
| D3 | Backend | Netlify Functions only | Express server | Multi-region scale |
| D4 | Persistence | Netlify Blobs + GameRepository | Supabase/Neon first; localStorage-only | >10 users / SQL needs |
| D5 | Scoring trust | Server authoritative via complete-round | Client totals | Never for leaderboard |
| D6 | Green gate | `npm run verify` | Ad-hoc scripts | e2e added to verify if CI time OK |
| D7 | Content | Parallel track; 300 active structural min | Block all code on full human review | Carl sets review bar |
| D8 | Voice | Function proxy + hybrid cache | Client ElevenLabs | Never client key |
| D9 | State | Zustand minimal | Context-only, Redux | Extreme complexity |
| D10 | Week TZ | Asia/Makassar | UTC-only | Family moves TZ |
| D11 | Auth | Family profiles + parent PIN hash | Full OAuth | Multi-family SaaS |
| D12 | Deploy | Local until Carl authorises | Auto deploy main | Explicit release ask |

---

## 20. DEV DIRECTOR RECOMMENDATION

### **PASS TO CHALLENGE**

with **recorded risks** (not blockers to planning):

1. **Content volume + review** in one continuous mission is the critical path — parallelise early; do not let engine work claim “done” without Track A.  
2. **Blobs vs Supabase** is a reversible architecture choice via repository pattern; confirm with Carl if a Supabase project already exists.  
3. **Live TTS CI** will often lack secrets — plan mock e2e + optional human live smoke.  
4. **Design + UX director packets** must not contradict this stack; Conductor synthesis resolves conflicts.  

### Not BLOCK because

- Stack is standard and brief-aligned.  
- Integrity model is clear.  
- Green gate and independence protocol are defined.  
- MVP cut on content is honest and still maps to §36 if Track A enforced.  

### Not PASS WITH RECORDED RISK alone as final build accept

That status is for post-implementation. **This planning packet: PASS TO CHALLENGE.**

---

## Appendix A — §36 acceptance → slice mapping

| # | Criterion | Slice |
|---|-----------|-------|
| 1 | Separate profiles | 1, 3 |
| 2 | Different difficulty | 1, 2, 5 |
| 3 | Guide select/change | 1, 4 |
| 4 | ElevenLabs voice | 4 |
| 5 | Key not in browser | 4 + verify |
| 6 | Full round | 2, 3 |
| 7 | Correct/incorrect FX | 2, 7 |
| 8 | Comic/fart optional | 2, 7 |
| 9 | XP/coins/weekly points | 2, 3 |
| 10 | Verified leaderboard | 3 |
| 11 | Remote weekly scores | 3 |
| 12 | Parent weekly reward | 5 |
| 13 | ≥300 questions | 6 |
| 14 | Both age levels | 6 |
| 15 | Mobile/tablet | 1, 7 |
| 16 | Playable if TTS fails | 4 |
| 17 | Production build | 0, 8 |
| 18 | CI passes | 0, 8 |
| 19 | Netlify from GitHub | 8 (config ready; deploy = Carl) |
| 20 | No secrets committed | 0 + continuous |

---

## Appendix B — Summary for Conductor (one screen)

| Item | Value |
|------|--------|
| Green gate | `npm run verify` (= lint + typecheck + content:validate + test + build) |
| Persistence | **Netlify Blobs** + `GameRepository`; localStorage prefs/queue only |
| Phases/slices | 0 Foundation → 1 Shell → 2 Engine → 3 Persist/verify → 4 TTS → 5 Parent → 6 Content (parallel) → 7 Polish/PWA → 8 Independent verify |
| Blockers to build start | Challenge + Design/UX packets + Conductor synthesis PASS |
| Main delivery risk | 300-question bank quality/review in one mission |

---

*End of Dev Director packet. No application source code was written.*
