# Challenge Report — Island Quest v1 (Plan Gate)

| Field | Value |
|-------|--------|
| **Mission ID** | d968e79b |
| **Role** | Challenger / Plan Reviewer (independent) |
| **Date** | 2026-07-30 |
| **Inputs** | `01-DESIGN-DIRECTOR.md`, `02-DEV-DIRECTOR.md`, `03-UX-UI-DIRECTOR.md`, product brief (esp. §15.8, §24, §31, §36), GABS v1.1 Challenger / evidence rules, `MISSION.md` |
| **Authority** | Specific objections only; does not rewrite design; does not authorise build |
| **Standard** | Evidence outranks confidence; insufficient evidence / missing contracts → FAIL closed |

---

## Executive summary

Three director packets are materially useful and largely brief-aligned on product intent (game-first, server scores, no school language, ElevenLabs proxy, family PIN). **They do not form a single buildable contract yet.**

The plan gate fails closed on **unresolved source-of-truth conflicts** (persistence, repository/API surface) and on **§36.13 content acceptance reinterpretation without Carl**. Independent verification is directionally strong but incomplete against integrity and shame risks. One continuous mission covering modes + voice + parent + PWA + 300Q + polish has a high **fake-complete** surface unless slices and evidence gates are binding.

**Verdict:** see bottom — **READY WITH BINDING RESOLUTIONS** (not unconditional READY; not full NOT READY if resolutions are forced before Builder).

---

## Findings

### C-01 — Persistence conflict: Design Supabase vs Dev Netlify Blobs

- **Severity:** Blocker  
- **Area:** Cross-director conflict  
- **Finding:** Design **selects Supabase Postgres** as authoritative store and **rejects Netlify Blobs** for competition integrity. Dev **selects Netlify Blobs as default** and treats Supabase as future. Builder cannot implement both without inventing a dual-write or silently picking a side. Design §19 explicitly forbids inventing a new persistence vendor or dual-writing Blobs “just for now.”  
- **Evidence:**  
  - Design §8.2: “SELECTED” Supabase; Blobs “Rejected for authoritative scores.”  
  - Design §19.3: “New persistence vendor or dual-writing to Blobs ‘just for now.’”  
  - Dev §1 / §7 / D4: “Dev picks Netlify Blobs as default remote store.”  
  - Dev §17 Q1 still open: “Confirm Netlify Blobs default vs force Supabase/Neon.”  
- **Recommendation:** Conductor records **one** binding driver for v1 ACCEPT:  
  - **Option A (integrity-first):** Supabase per Design; Dev rewrites Blobs plan to adapter-only + migrations + env.  
  - **Option B (mission-velocity):** Blobs per Dev **only if** Carl accepts recorded integrity risk and Design §8.2/§19 are amended so Builder is not in violation.  
  Repository interface alone is **not** resolution — dual “selected defaults” will cause silent divergence.  
- **Required before build?** Yes  

---

### C-02 — GameRepository / complete-round contracts diverge

- **Severity:** Blocker  
- **Area:** Cross-director conflict  
- **Finding:** Design and Dev define different repository method sets, names, and complete-round shapes. Design requires transactional `completeRound(result: CompletedRoundResult)`, parent sessions, daily challenges, category progress, achievements, audit, awards archive. Dev’s conceptual interface is thinner (`getPlayers` vs `listPlayers`, `CompleteRoundInput` → `VerifiedRoundResult`, optional `saveAttempt`, missing parent session/daily/audit methods). Without a single frozen contract, Builder invents the persistence surface.  
- **Evidence:** Design §8.1 full `GameRepository`; Dev §7 “Conceptual contract — Design Director may refine”; Dev §17 Q6 admitted Design packet was missing at write time.  
- **Recommendation:** Conductor synthesis must publish **one** `GameRepository` + Zod request/response tables (prefer Design’s richer surface; Dev implements). Freeze method names, error codes (`ROUND_ALREADY_COMPLETED`, etc.), and which functions own which methods.  
- **Required before build?** Yes (at least freeze before Slice 3; names/types before any repo code)  

---

### C-03 — API path / admin function naming conflict

- **Severity:** Major  
- **Area:** Cross-director conflict  
- **Finding:** Design specifies `POST /.netlify/functions/admin/reward` (slash paths) and raw function paths. Dev specifies flat files `admin-reward.ts`, recommends `/api/*` rewrite, and omits several Design endpoints from the ownership table (`admin/reset-week`, `health`, optional `weekly-rollover`, Design’s nested admin routes). Client and e2e will drift.  
- **Evidence:** Design §12.10–12.15; Dev §5 functions table + netlify.toml `/api/*`.  
- **Recommendation:** Binding: public base path **`/api/*` → functions** (Dev), function filenames **kebab-case**, map Design admin ops 1:1 including **reset-week** and **health**. Document exact path list in synthesis; forbid Builder inventing extra functions (Design §19.18).  
- **Required before build?** Yes before HTTP client / Slice 3  

---

### C-04 — §36.13 “300 reviewed questions” vs tiered / structural reinterpretation

- **Severity:** Blocker (for ACCEPT path); Major (for starting engine slices if content ACCEPT is deferred with Carl)  
- **Area:** Brief alignment  
- **Finding:** Brief §15.8 and §36.13 require **at least 300 reviewed questions**. Design reinterprets to ≥300 structurally valid `active` + ≥80 gold reviewed + 10% sample. Dev Track A requires ≥300 active structural; full human review is optional with PASS WITH RECORDED RISK. Mission allows directors to “resolve” scaffolded bank — **directors resolved by lowering the bar without Carl signature**. That is not automatic ACCEPT permission.  
- **Evidence:**  
  - Brief §15.8: “300 reviewed questions”; Layer 4 “Every question must be checked before becoming active.”  
  - Brief §36.13: “at least 300 reviewed questions.”  
  - Design §11.2 “Acceptance criterion 13 reinterpretation (record risk for Carl).”  
  - Dev §12: minimum ship structural active + sample review if Carl accepts.  
- **Recommendation:** Carl/Conductor bind **exactly one**:  
  1. **Strict brief:** 300 human-reviewed before ACCEPT → content is critical path; may force multi-pass or content-only mission extension.  
  2. **Amended ACCEPT:** e.g. Design tier (≥80 gold + ≥300 active + validation + sample %) **written into DECISIONS.md + acceptance amendment** so Verifier does not fail §36.13 on “reviewed.”  
  Until then, Builder must not claim “§36.13 met” with structural-only bank.  
- **Required before build?** Yes for ACCEPT definition; engine/UI slices may start **only if** content bar is explicitly deferred as binding risk (not silent).  

---

### C-05 — One-pass full-build feasibility vs scope density

- **Severity:** Major  
- **Area:** Design | Dev | UX  
- **Finding:** In-scope still includes: multi-mode play (quick/world/daily/boss/rematch), full scoring integrity, remote leaderboard, ElevenLabs, parent admin suite, ≥300Q, PWA, motion/sound/a11y polish, 64 named UX components, CI+e2e. Design R10 and Dev content critical-path both admit tightness. No **binding cut order** with slice kill-switches — only soft recommendations (cut boss polish, image-choice volume, etc.). Risk: partial modes ship as “done” stubs.  
- **Evidence:** Design §15 R10; Design modes §7.2; UX §17 (64 components); Dev slices 0–8; brief §36 items 1–20 all required for “acceptable.”  
- **Recommendation:** Binding **MVP mode floor** for ACCEPT: Quick Play + World Quest + Daily + Rematch + Results + Leaderboard + Parent reward + TTS degrade. **Boss Battle** may be present as unlocked shell **or** explicitly deferred with recorded risk — not half-implemented. UX polish: tokens + comic/correct FX required; Lighthouse ≥90 stretch. Content parallel from Slice 2 with hard gate before ACCEPT.  
- **Required before build?** Yes (mode floor + cut order in synthesis)  

---

### C-06 — Scoring integrity vs offline queue / non-atomic persistence

- **Severity:** Blocker under Blobs (C-01 Option B); Major under Supabase if transactions unspecified  
- **Area:** Design | Dev  
- **Finding:** Design §4.3 Step E requires a **single logical unit**: attempts + round complete + player update + leaderboard upsert + category + achievements. Dev Blobs path admits “best-effort sequential writes” and eventual consistency risk. Offline queue retries by `roundId` (good) but does **not** solve:  
  1. Partial write (leaderboard updated, player not — or reverse) then retry/idempotent return of “already completed” with inconsistent aggregates.  
  2. Two devices / two tabs same `playerId` concurrent completes (different `roundId`) — race on streak/points without compare-and-swap.  
  3. Client shows provisional score (Design §4.4) — if “Saved” shown on local queue only, violates UX honesty (UX §14).  
- **Evidence:** Design §4.3 Step E, §4.4, §13 offline table; Dev §7 offline queue + risk “Blobs eventual consistency / partial write”; Dev risk “Offline double-credit” mitigated only by roundId idempotency.  
- **Recommendation:**  
  - If Supabase: require transactional complete (single SQL transaction or RPC); integration test concurrent completes.  
  - If Blobs: require **write protocol**: store completed result blob first under `rounds/{id}/result` with unique create; leaderboard/player updates only after result exists; complete-round re-read-repair; integration tests for crash mid-sequence and double-flush.  
  - UI: “Saved” only on HTTP 200 verified result; queue state ≠ leaderboard claim.  
- **Required before build?** Yes before Slice 3  

---

### C-07 — Parent PIN security adequacy for family v1

- **Severity:** Major (not Blocker if honest threat model)  
- **Area:** Design | Dev | UX | Brief alignment  
- **Finding:** Model is correctly framed as friction, not adversarial child-security. Gaps remain for implementability and residual risk:  
  1. **Bootstrap undefined** (Design Q5, Dev Q5, UX Q9) — who sets first PIN? env-only vs first-run wizard. Builder will invent.  
  2. **Recovery** = re-hash via env only — acceptable if documented; not specified in parent UX.  
  3. **Rate limit store** on Blobs/memory — not specified; serverless multi-instance rate limits may not hold without shared store.  
  4. **4-digit PIN** (~10k space) + shared device = sibling/shoulder-surf trivial; Design accepts — must not be sold as “secure auth.”  
  5. Session: sha256(token) good; TTL 30m idle / 4h absolute good; **SESSION_SECRET** role underspecified (HMAC vs pure random token).  
  6. Admin surface includes score fix / reset week — high impact if PIN leaked; audit log required (Design) but Dev admin set incomplete (C-03).  
- **Evidence:** Design §10; Dev §6 env `PARENT_PIN_HASH`; UX §13; brief parent gate (no arithmetic).  
- **Recommendation:** Binding: (1) initial PIN via env `PARENT_PIN_HASH` only for v1 (no child-reachable setup wizard that stores plaintext); (2) document recovery for James/Carl; (3) rate limit counters in authoritative store; (4) argon2id/bcrypt cost floor in synthesis; (5) Verifier adversarial: wrong PIN, lockout, no session → admin 401, no math gate. Accept residual risk: **family friction, not multi-tenant security**.  
- **Required before build?** Yes for bootstrap/recovery contract; residual risk may be PASS WITH RECORDED RISK  

---

### C-08 — UX shame safeguards vs Dev implementation testability

- **Severity:** Major  
- **Area:** UX | Dev | Cross-director  
- **Finding:** UX has strong vocabulary banks, comic-fail rules, multi-award competition, forbidden “loser/fail/weak.” Dev mentions school-language grep in Verifier adversarial list but does **not** specify:  
  - canonical deny-list file ownership  
  - required unit/e2e assertions on incorrect-answer path (comic confetti ≠ error red wall; “Got it”; no “Failed”)  
  - leaderboard second-place dignity  
  - parent dashboard “themes” vs “weak subjects”  
  Without tests, shame regressions are uncaught and Verifier relies on manual skim.  
- **Evidence:** UX §2, §11, §12; Dev §11.6 adversarial “school-language grep”; no content of deny-list or FX test matrix.  
- **Recommendation:** Binding artifacts: `src/config/copy-deny-list.ts` (or `content/copy-policy.json`) + CI grep on child-facing string modules; component tests for `AnswerFeedbackOverlay` incorrect path; e2e assert absence of forbidden tokens on results/leaderboard. Map UX microcopy banks into `src/config/copy/*` as data, not freeform Builder prose.  
- **Required before build?** Yes for deny-list + ownership; full e2e matrix before ACCEPT  

---

### C-09 — Gaps where Builder would invent (missing contracts)

- **Severity:** Blocker (collectively)  
- **Area:** Design | Dev | Cross-director  
- **Finding:** Open or underspecified items that force invention if not frozen:  

  | Gap | Why Builder invents |
  |-----|---------------------|
  | Persistence driver (C-01) | Picks Blobs or Supabase |
  | Repo/API surface (C-02/C-03) | Invents methods/paths |
  | Parent PIN bootstrap (C-07) | Invents first-run flow / plaintext |
  | Power-up grant policy at `start-round` | `powerUpsGranted` exists; how many of each per mode undefined |
  | `start-round` question payload vs client bank | Design decides full client bank + omit keys in API — client hydration order unclear |
  | Content paths | Design `src/data/questions/**` vs Dev `content/questions/**` |
  | Daily challenge “completed” mark lifecycle | row exists; who flips completed on complete-round |
  | Level thresholds / XP | Design `level = 1 + floor(xp/500)`; not in Dev scoring config |
  | Comeback-star rule | Design “simplify v1” vs UX title intent — deterministic metric missing |
  | Category enable storage | admin capability vs config file vs DB |
  | Player seed names privacy in git | both open |
  | Practice version header `X-Content-Version` | Design §13 mentions; no client handling contract |
  | Practice mode entry API | Design §13; no request shape / score isolation flag |
  | Admin reset-week + bonus audit | Design yes; Dev incomplete |
  | TTS cache: Blobs vs memory | “best-effort” only |
  | `questions` GET purpose if bank is static | redundant endpoint risk / spoiler policy inconsistency |

- **Evidence:** Design open Qs §16; Dev open Qs §17; UX open Qs §19; incomplete cross-links above.  
- **Recommendation:** Conductor synthesis section **“Frozen contracts”** must close every row above or mark **explicit out-of-v1** with UI non-goals. Prefer Design normative scoring/power-ups; prefer Dev tree layout with `content/` as SoT and build-time copy into functions bundle.  
- **Required before build?** Yes for rows that touch Slice 0–3; remaining before their owning slice  

---

### C-10 — Secrets / ElevenLabs

- **Severity:** Major (Blocker if any path allows client key)  
- **Area:** Design | Dev | Brief alignment  
- **Finding:** Proxy + allowlist + no `VITE_` secrets are correctly specified. Residual gaps:  
  1. **No live key required for CI** — ACCEPT may pass without proving real TTS (Dev §17 Q2 open). Brief §36.4 “uses an ElevenLabs voice” implies at least one controlled live smoke with evidence, or explicit Carl waiver.  
  2. Rate limits 30/IP/10min (Design) vs env `TTS_RATE_LIMIT_PER_MINUTE=30` (Dev) — **units disagree**.  
  3. Character→voice env map: five voices listed; disabled character reject OK; **missing voice ID** behaviour vs missing API key must both degrade, not 500 stack.  
  4. Spoken text leaves environment via vendor — privacy OK for game strings; **parent free-text rewards must never be TTS’d** (not explicitly forbidden in TTS context enum).  
  5. Cost/bill-shock: cache optional; no budget alarm / daily hard cap.  
  6. Secrets scan in CI is “recommended” not required Job A — should be required for Level 2.  
- **Evidence:** Design §9; Dev §4 Job C recommended; Dev §6; brief §36.4–5, §31.1.  
- **Recommendation:** Binding: (1) secrets scan **required** in green-gate or hard Job; (2) harmonise rate-limit units; (3) ACCEPT evidence = mock e2e **plus** optional live smoke with recorded risk if key absent in CI — Carl chooses; (4) forbid TTS of parent reward strings / admin notes; (5) `.env.example` complete; never commit `.env`.  
- **Required before build?** Yes for rate-limit + secrets-scan + TTS context forbid list; live smoke may be ACCEPT-time  

---

### C-11 — Independent verification protocol strength

- **Severity:** Major  
- **Area:** Dev | GABS alignment  
- **Finding:** Dev §11 is a good skeleton (clean install, verify log, secrets, adversarial product tests, no Builder self-accept). Weaknesses vs GABS “insufficient evidence = FAIL / MORE EVIDENCE REQUIRED”:  
  1. Default `npm run verify` **excludes e2e** — ACCEPT depends on separate Job B; easy to ship “green” without §32.3 flows.  
  2. No mandate to verify against **Design scoring golden vectors** (tables of attempts → points).  
  3. No multi-tab/offline partial-write adversarial case (C-06).  
  4. No explicit check that **active** questions meet Carl-bound review bar (C-04).  
  5. No requirement that Verifier starts from brief §36 checklist, not Builder narrative.  
  6. “PASS WITH RECORDED RISK” allowed without requiring owner/follow-up/review date (GABS Gate 3 for majors).  
- **Evidence:** Dev §3, §10.6, §11; GABS 3.9, Phase 3 Gate 3, Phase 7.  
- **Recommendation:** Binding Verifier checklist append:  
  - §36 matrix → evidence paths  
  - scoring golden file tests  
  - dupe complete + tampered client score  
  - parent unauth  
  - TTS deny unknown character  
  - TTS down play continues  
  - copy deny-list  
  - content validate counts + review evidence  
  - secrets in dist  
  Recorded risks need owner + follow-up.  
- **Required before build?** Protocol freeze Yes; execution at verify phase  

---

### C-12 — “Fake complete” risks (stubs presented as done)

- **Severity:** Major  
- **Area:** Dev | Design | UX  
- **Finding:** Multiple licensed stubs exist without hard “cannot claim slice done” evidence:  
  1. `VITE_USE_FIXTURE_API` / memory driver — risk of claiming remote leaderboard with local-only.  
  2. Slice 1 parent “gated by stub.”  
  3. Content drafts promoted to `active` without review log (forbidden in prose; not structurally impossible if validate only checks schema).  
  4. Provisional client score animations mistaken for verified leaderboard.  
  5. Placeholder SVG art vs “polished game” (UX gate soft).  
  6. Boss/H2H shells as routes without playable loop counted as modes complete.  
  7. TTS function returning 200 silence / empty without tests.  
  8. `complete-round` returning client-echoed score in a “temporary” branch.  
  9. CI green with empty question fixture if validate thresholds mis-wired in Slice 0.  
- **Evidence:** Dev §9 Slice 0–1; Dev §7 drivers; Design §4.4 provisional score; Design §11 validation rules; Dev §15 anti-patterns (good list, enforcement soft).  
- **Recommendation:** Binding: each slice acceptance includes **negative tests** (fixture API cannot write weekly points; validate fails if active&lt;300 before ACCEPT; complete-round ignores client score field if present). Forbidden phrases in BUILD_LOG: “done” without evidence path. Slice 0 must **not** greenwash content counts (Dev already notes — enforce).  
- **Required before build?** Yes (slice evidence rules)  

---

### C-13 — Fair competition / base points model consistency

- **Severity:** Minor  
- **Area:** Design | Brief alignment  
- **Finding:** Design awards base points by **question difficulty** (not player level) — good for fairness. Expected ranges claim L1 can lead via consistency. Ensure parent-facing copy and any “Quest Level” UI do not imply same questions. Selection composition is sound; rematch pool 30-day window is a product choice not brief-mandated — acceptable if documented.  
- **Evidence:** Design §5.2; brief fair competition intent.  
- **Recommendation:** Keep question-difficulty base; unit-test L1 vs L3 equal correct counts → different points; never UI-explain “easier questions.”  
- **Required before build?** No (record as confirmation)  

---

### C-14 — Brief §36.19 Netlify deploys from GitHub vs local-only rule

- **Severity:** Major  
- **Area:** Brief alignment | Mission  
- **Finding:** §36.19 requires “Netlify deploys from GitHub.” Mission/WORKING/directors say **no deploy until Carl**. Netlify-ready config ≠ proven deploy. Without binding interpretation, ACCEPT is ambiguous.  
- **Evidence:** Brief §36.19; MISSION “Local until told to deploy”; Dev D12.  
- **Recommendation:** Binding amendment for this mission: §36.19 = `netlify.toml` + Functions build verified via `netlify build` / documented deploy readiness **or** Carl-authorised deploy smoke. Do not claim production deploy without authorisation.  
- **Required before build?** Yes (ACCEPT wording only; not code)  

---

### C-15 — Age-band coverage floors conflict (150/150 vs difficulty minima)

- **Severity:** Minor  
- **Area:** Brief alignment | Design | Dev  
- **Finding:** Brief wants ~150 younger / ~150 older suitable. Design validate minima: L1≥100, L2≥50, L3≥100, L4≥20 (sum≥270, not identical to 150/150). Dev maps “difficulty 1–2 vs 3–4.” Inconsistent floors can fail CI or fake age coverage.  
- **Evidence:** Brief §15.8; Design §11.5.12; Dev Slice 6.  
- **Recommendation:** Freeze coverage matrix: e.g. (L1+L2)≥150 and (L3+L4)≥150 **and** Design per-level floors, or Carl-approved single matrix in validate script.  
- **Required before build?** Yes before content Track A gate  

---

### C-16 — start-round spoiler / offline play tension

- **Severity:** Observation (Minor if family threat accepted)  
- **Area:** Design  
- **Finding:** Design accepts full answer key in client bundle for offline + snappy feedback; server still scores. Correct for family threat model; siblings can cheat answers but not easily inflate totals if complete-round is honest. Practice mode without network must not write weekly points.  
- **Evidence:** Design §12.4, §14.6, §13.  
- **Recommendation:** Document accepted risk; Verifier attempts client score inflation; practice mode flag tested.  
- **Required before build?** No  

---

### C-17 — Comeback-star / end-of-week awards under-specified

- **Severity:** Minor  
- **Area:** Design | UX  
- **Finding:** Multi-title awards are product-critical for shame mitigation. Design’s comeback-star “simplify” is informal; most-improved with no prev week is ambiguous; UX lists titles without deterministic formulas. Builder will invent award assignment.  
- **Evidence:** Design §6.3; UX §12.  
- **Recommendation:** Freeze pure functions for each `WeeklyTitleId` with tie-breaks; unit tests; both kids can receive different titles same week.  
- **Required before build?** Yes before leaderboard ceremony / week rollover code  

---

### C-18 — Dev packet written before Design; residual assumption debt

- **Severity:** Observation  
- **Area:** Cross-director conflict  
- **Finding:** Dev §17 Q6: “Design Director packet: Not yet present.” Several Dev defaults (Blobs, thinner repo, content floors) conflict with later Design. Challenge must not treat “both PASS TO CHALLENGE” as agreement.  
- **Evidence:** Dev §17 Q6; Design recommendation Supabase.  
- **Recommendation:** Synthesis is authoritative; Dev D4/D7/D table must be rewritten to match binding resolutions.  
- **Required before build?** Yes (synthesis supersedes)  

---

## Mandatory checklist (mission-specific)

| # | Check | Result |
|---|--------|--------|
| 1 | Design Supabase vs Dev Blobs | **FAIL closed** until C-01 bound |
| 2 | 300 human-reviewed vs tiered | **FAIL closed** for ACCEPT until C-04 Carl/Conductor bind |
| 3 | One-pass feasibility | **Major risk** — bind mode floor (C-05) |
| 4 | Scoring vs offline queue race | **FAIL closed** under Blobs without write protocol (C-06) |
| 5 | Parent PIN adequacy | **Adequate as family friction** if C-07 bootstrap/rate-limit bound; not strong auth |
| 6 | UX shame vs testability | **Insufficient tests** until C-08 |
| 7 | Builder invent gaps | **Many** — C-09 |
| 8 | Secrets / ElevenLabs | **Mostly sound**; bind scan + rate units + live smoke policy (C-10) |
| 9 | Independent verification | **Directionally strong, not sufficient** — C-11 |
| 10 | Fake complete risks | **High surface** — C-12 |

---

## CHALLENGE VERDICT

# **READY WITH BINDING RESOLUTIONS**

Not **READY TO BUILD** (unconditional): material conflicts and missing contracts would force Builder invention and fake-complete ACCEPT paths.

Not **NOT READY** as total reject: problem framing, scoring purity intent, stack shape, UX vocabulary, secrets boundary, and slice discipline are strong enough to proceed **after** Conductor records the bindings below.

---

## BINDING RESOLUTIONS (Conductor must record before Builder starts)

1. **Persistence SoT (C-01):** Choose Supabase **or** Blobs (not both). If Blobs, amend Design §8.2/§19 and adopt atomic complete-round write protocol (C-06). If Supabase, Dev D4 + env + migrations replace Blobs default.  
2. **Frozen contracts (C-02, C-03, C-09):** Single `GameRepository`, single API path list (`/api/*` + kebab functions including reset-week + health), single content root (`content/` → bundle), power-up grants per mode, daily completion lifecycle, practice-mode flag, content version behaviour.  
3. **§36.13 content bar (C-04, C-15):** Carl/Conductor signature on strict 300 reviewed **or** amended tiered bar with validate floors (age-band matrix frozen).  
4. **Mode floor for ACCEPT (C-05):** Explicit in/out list for boss/image-choice/cosmetics; no stub counted as complete.  
5. **Complete-round integrity (C-06):** Transaction or Blobs write-order + integration tests; “Saved” only on verified 200; ignore client score fields.  
6. **Parent PIN bootstrap (C-07):** env hash only; rate limit in shared store; recovery doc; Verifier authz cases.  
7. **Copy deny-list + FX tests (C-08):** owned artifact + CI + incorrect-path component tests.  
8. **Secrets (C-10):** required secrets scan; harmonised TTS rate limit; TTS never speaks parent free-text rewards; live TTS smoke policy for ACCEPT.  
9. **Verifier protocol (C-11):** §36 evidence matrix; scoring goldens; adversarial list mandatory; recorded risks need owner + follow-up.  
10. **Fake-complete guards (C-12):** slice exit criteria; fixture API cannot satisfy remote leaderboard ACCEPT; content validate cannot pass ACCEPT with &lt; bound active/reviewed.  
11. **§36.19 deploy (C-14):** interpret as Netlify-ready + optional Carl deploy; no unauthorised production claim.  
12. **Weekly title pure functions (C-17):** deterministic awards before ceremony UI ships.

Builder must not start Slice 3 (persistence/scoring remote) until items **1, 2, 5** are recorded. Builder must not start Slice 0 claiming full green content until **3** is recorded. Engine UI slices 0–2 may start only after **1–2** direction is known enough not to thrash tree/env (prefer full bindings first).

---

## PASS WITH RECORDED RISK (allowed after bindings; not silent)

| Risk | Why acceptable if recorded | Owner | Follow-up |
|------|----------------------------|-------|-----------|
| Family threat: client-visible answer key | Server scores still authoritative; 2-player home | Conductor / Carl | If multi-family SaaS, hide answers |
| Parent PIN is friction not security | Matches brief; shared devices | Conductor | Document for James |
| Live ElevenLabs absent in CI | Mock + optional human smoke | Dev/Verifier | Pre-release live smoke when key available |
| Boss / image-choice / cosmetic depth reduced | If mode floor met and Carl agrees | Conductor | v1.1 |
| Tiered content vs full human review | Only if C-04 amendment signed | Carl | Review remaining silver questions post-ACCEPT |
| Placeholder SVG art vs final illustration | If consistent game-like system, not grey wireframes | UX/Verifier | Art pass later |
| Lazy week rollover vs cron | If pure functions + first-read archive tested | Design/Dev | Add cron if missed awards reported |
| PWA shell-only offline | Brief/dev aligned; mid-round queue only | Dev | v1.1 richer offline |
| Rate-limit best-effort on multi-instance without Redis | Family scale low | Dev | Shared store counters with chosen persistence |

---

## Architect / Conductor response slots

*(To be filled by Conductor synthesis — not Challenger)*

| Finding | Response (accept / amend / reject risk) | Decision |
|---------|-------------------------------------------|----------|
| C-01 | | |
| C-02 | | |
| C-03 | | |
| C-04 | | |
| C-05 | | |
| C-06 | | |
| C-07 | | |
| C-08 | | |
| C-09 | | |
| C-10 | | |
| C-11 | | |
| C-12 | | |
| C-14 | | |
| C-15 | | |
| C-17 | | |

---

## What this Challenger did **not** do

- Did not rewrite the product design or UX system.  
- Did not write application code.  
- Did not accept the plan.  
- Did not weaken brief §36 without demanding explicit amendment.

---

*End of Challenge Report — mission d968e79b*  
*Role: Challenger / Plan Reviewer | Independent | 2026-07-30*
