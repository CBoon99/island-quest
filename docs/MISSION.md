# Mission: Island Quest v1 Full Build

**Mission ID:** d968e79b  
**Conductor:** Grok (this session)  
**Human owner:** Carl  
**Workflow version:** GLOBAL AGENTIC BUILD SYSTEM 1.1  

## Outcome

Ship a buildable, testable Island Quest v1 family trivia PWA per product brief acceptance criteria §36, with evidence-backed independent verification. No production deploy unless Carl authorises.

## Risk class

**Level 2** — children's product, ElevenLabs secrets, parent PIN, remote authoritative scores, PWA on tablets. Not Level 3 financial/legal.

## Separation of duties (this mission)

| Role | Duty | May write product code? | May accept? |
|------|------|-------------------------|-------------|
| Design Director | Architecture, data model, scoring integrity, content system, API contracts | No (docs only) | Recommend only |
| Dev Director | Stack, repo structure, phases, test strategy, CI, Netlify, persistence | No (docs only first) | Recommend only |
| UX/UI Director | Flows, visual system, motion/sound, accessibility, child safety language | No (docs only) | Recommend only |
| Builder | Implement approved plan only | Yes | No |
| Independent Verifier | Diff vs plan, run green gate, adversarial product tests | No product features | Recommend PASS/FAIL |
| Conductor | Gates, evidence, stop/go | Only orchestration | Phase PASS recommend; release = Carl |

## Hard rules

1. Evidence outranks confidence.
2. Insufficient evidence = FAIL or MORE EVIDENCE REQUIRED.
3. Builder must not self-approve.
4. Secrets never in repo; never `VITE_` prefix on secrets.
5. No school LMS language in child UI.
6. Wrong answers are comic, never shaming.
7. Server verifies scores.
8. Local until told to deploy.

## In-scope v1 (brief §36)

Profiles, difficulty, guide characters + ElevenLabs proxy, full round, correct/wrong feedback, XP/coins/weekly points, remote leaderboard, parent weekly reward, ≥300 questions (or scaffolded bank with validation path if content generation is phased — directors must resolve), mobile/tablet, voice fallback, green CI build, Netlify-ready, no secrets committed.

## Out of scope

Public multiplayer, chat, payments, native apps, AI open tutoring, school LMS, deploy without Carl.
