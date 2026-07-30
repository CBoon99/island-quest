# Conductor Synthesis — Island Quest v1

| Field | Value |
|-------|--------|
| **Mission ID** | d968e79b |
| **Date** | 2026-07-30 |
| **Conductor** | Grok (this session) |
| **Human owner** | Carl |
| **Inputs** | Design, Dev, UX/UI Director packets + Challenger `04-CHALLENGE.md` |
| **Challenge verdict** | READY WITH BINDING RESOLUTIONS |

---

## Gate decision

**BUILD AUTHORISED** under the binding resolutions below.

Authority for code acceptance remains: **Independent Verifier evidence + Conductor agreement**. Builder may not self-accept. Deploy still requires Carl.

---

## Binding resolutions (frozen before Builder)

### B1 — Persistence source of truth

**Decision:** Netlify Blobs (production) + file/memory adapter (local & unit tests), behind a single `GameRepository` interface.

**Rejected for v1 continuous mission:** Supabase-first (Design preferred) — blocks on second vendor + credentials; reverse via repository only later.

**Integrity protocol (mandatory — closes C-01, C-06):**

1. Client never submits scores/XP/coins/weekly points as authoritative.
2. `complete-round` is the only mutation path for scores.
3. Server loads question bank canonically, re-scores, validates power-ups, rejects duplicate `roundId`.
4. **Atomic write:** one store transaction / single versioned blob payload update (read → merge → write with expected version; retry once on conflict).
5. Offline queue: local pending only; UI shows **Saving…**; **never** animate leaderboard win until verified response.
6. Practice/offline rounds that cannot sync: may award local-only XP display but **do not** increment weekly leaderboard until verified (or label “practice — not on board”).

### B2 — Frozen API surface

Netlify Functions (paths):

```text
GET  /.netlify/functions/players
GET  /.netlify/functions/player?id=
POST /.netlify/functions/start-round
POST /.netlify/functions/complete-round
GET  /.netlify/functions/leaderboard?week=
GET  /.netlify/functions/rewards?week=
POST /.netlify/functions/text-to-speech
POST /.netlify/functions/parent-auth
POST /.netlify/functions/admin-reward
POST /.netlify/functions/admin-player
POST /.netlify/functions/admin-bonus-points
POST /.netlify/functions/admin-reset-week
GET  /.netlify/functions/health
```

Optional rewrite: `/api/*` → `/.netlify/functions/:splat` in `netlify.toml`.

**Authoritative TypeScript types:** `src/types/` + Zod in `src/schemas/`. Design domain shapes win; Dev package layout wins.

### B3 — Content acceptance bar (honest vs brief §36.13)

| Track | Requirement for mission ACCEPT |
|-------|--------------------------------|
| **A — Structural (hard)** | ≥300 questions with `status: "active"`, unique ids, one correct answer, non-empty explanation, valid difficulty/world/category; `npm run content:validate` green |
| **B — Human review (honest)** | Do **not** claim “300 reviewed” unless review log proves it. Target ≥80 with `reviewedAt` + source fields in mission; remainder agent-authored + automated QA + spot-check |
| **C — Age split** | ≥150 difficulty 1–2 and ≥150 difficulty 3–4 (or age-band mapping) |
| **D — Local pride** | Indonesia / Gili Meno / ocean category present |

**Recorded risk R-CONTENT:** Brief §36 item 13 says “at least 300 reviewed questions.” Mission ACCEPT uses Track A + honest B. Carl may reject ACCEPT until full human review.

### B4 — Mode floor (ACCEPT)

| Mode | ACCEPT |
|------|--------|
| Quick Play (5Q) | Required |
| World Quest (10Q) | Required (≥6 worlds unlockable) |
| Daily Challenge | Required |
| Rematch as “Revenge Round” | Required |
| Boss Battle (basic HP bar) | Required (simple) |
| Head-to-Head | **Out of scope** |
| PWA | Manifest + icons + standalone + basic offline shell |
| ElevenLabs | Proxy + character select + degrade if no key / failure |
| Parent | PIN gate, weekly reward, bonus points, overview |

### B5 — Parent PIN

- Env `PARENT_PIN_HASH` preferred; local bootstrap: if missing, derive hash from `PARENT_PIN` (default `2468` for family setup — document change in parent settings).
- Rate limit: 5 failures / 15 minutes per IP (or client id).
- Session: signed cookie / bearer with `SESSION_SECRET`, 4h idle expiry.
- Family-friction security only — recorded risk R-PIN.

### B6 — UX non-negotiables (testable)

- Child UI copy deny-list: lesson, homework, examination, grade, test result, curriculum, failed, remedial, poor performance.
- Wrong-answer path: comic confetti + optional fart (parent toggle separate; default ON).
- No “loser” / humiliation labels; multi weekly titles.
- Active player locked mid-round.
- Reduced motion respected.
- SVG icons, not emoji as chrome.

### B7 — Green gate & independence

```bash
npm run verify   # lint && typecheck && content:validate && test && build
```

- Builder self-check may run verify; **ACCEPT requires Independent Verifier re-run** with clean report.
- Verifier must include: scoring unit tests adversarial cases, complete-round rejects client score, PIN wrong path, TTS fail-open, copy deny-list, content count ≥300, production build.
- Playwright e2e on critical path when browsers installable; if blocked, record risk and rely on component + integration tests.

### B8 — Deploy interpretation

Mission is **local until Carl says deploy**. CI + Netlify config must be **ready**. Live “Netlify deploys from GitHub” (§36.19) is release gate for Carl, not this session’s ACCEPT unless Carl asks.

### B9 — Secrets

- Never commit `.env`; never `VITE_` secrets.
- ElevenLabs key only in Functions env.
- CI Job A must include secret pattern scan (or `git secrets`/grep check).

### B10 — Stack (confirm brief)

React + TypeScript + Vite + React Router + Zustand + Zod + Vitest + RTL + Playwright (as available) + Framer Motion + CSS Modules/tokens + Netlify Functions. No Redux, no Express, no microservices.

### B11 — Seed players

Two fixture players: **Aryan** (level 3 / ~10), **Jasmine** (level 1 / ~7) — adjustable names via parent admin. Timezone `Asia/Makassar`.

### B12 — Slice order (Builder must follow)

0 Foundation (tooling, tokens, types, verify green empty)  
1 Product shell (routes, nav, fixture data)  
2 Game engine (selection, scoring, feedback, power-ups)  
3 Persistence + verified rounds  
4 TTS proxy + characters  
5 Parent controls  
6 Content bank ≥300 (parallel from 2, hard before ACCEPT)  
7 Polish + PWA  
8 Independent verification (separate agent)

Each slice: implement → `npm run verify` → stop if red twice (doom-loop: diagnose, replan).

---

## Recorded risks (PASS WITH RECORDED RISK)

| ID | Risk | Owner |
|----|------|--------|
| R-CONTENT | Not all 300 human-reviewed | Carl at ACCEPT |
| R-PIN | PIN is family friction not high security | Carl |
| R-BLOBS | Blobs concurrency weaker than Postgres; mitigated by versioned atomic complete | Conductor |
| R-TTS | CI without live ElevenLabs | Conductor |
| R-ART | Placeholder SVG art, not final illustration | UX |
| R-ANSWER-KEY | Question bank public static — sibling DevTools can peek | Accepted family model |
| R-DEPLOY | No production deploy this mission | Carl |

---

## Open items deferred (not build-stoppers)

- Exact ElevenLabs voice IDs (placeholders until Carl provides)
- Supabase upgrade later
- Head-to-head
- Indonesian UI language mode
- Live Netlify site

---

## Conductor agreement to proceed

I **agree** the director set is sufficient to build under these bindings.  
I **do not** accept any product code until Independent Verifier evidence exists.

**BUILD GATE: OPEN**

— Conductor, mission d968e79b
