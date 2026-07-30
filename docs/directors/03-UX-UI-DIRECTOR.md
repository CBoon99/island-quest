# Island Quest — UX/UI Director Packet

**Mission ID:** d968e79b  
**Role:** UX/UI Director (docs only — no application source code)  
**Human owner:** Carl  
**Primary stakeholder (product):** James  
**Date:** 2026-07-30  
**Sources:** Product brief §§5–14, 17–20, 28–29, 31, 39–40; GLOBAL AGENTIC BUILD SYSTEM v1.1 (esp. 3.6 confusing states); MISSION.md; WORKING.md  

---

## 1. Experience north star (two tests from brief §39)

Island Quest is a **polished game app**, not a school portal, worksheet, or prototype.

### Test A — Child voluntary open

> Would a seven-year-old or ten-year-old open this voluntarily because it looks fun, even if nobody described it as educational?

**UX implication:** First paint must sell adventure (island hub, characters, treasure, motion, sound). Learning content is under the loop. If a screen could appear on a school LMS, redesign it.

### Test B — Parent 30-second understand

> Can James understand who played, what they achieved and what this week’s reward is within 30 seconds?

**UX implication:** Parent dashboard is calm, scannable, and sparse. One screen answers: both kids’ week, leaderboard, activity, reward. No analytics maze.

### Supporting north-star loop (brief §40)

Competition → reason to return. Characters → attachment. Rewards → momentum. Questions → learning (invisible as “school”).

### Three-tap play rule

A returning child reaches first question in ~3 taps: **Pick me → Start Quest / Quick Play → Start**.

---

## 2. Forbidden school language + approved game vocabulary

### Forbidden in child UI (never prominent; never as labels)

| Forbidden | Why |
|-----------|-----|
| Lesson | School framing |
| Homework | Obligation |
| Examination / exam / test | Assessment fear |
| Grade / graded | Ranking as school |
| Test result | Report-card feel |
| Curriculum / unit | Institution language |
| Failed / fail | Shame |
| Remedial | Deficit label |
| Poor performance | Shame |
| Weak area / weak at | Deficit label (internal only) |
| Accuracy % as hero metric | Exam result feel |
| Score out of 10 as primary | Worksheet |
| “Study” / “learn this” as CTA | Homework |

Parent dashboard may use mild plain language (“questions attempted”, “category summary”) but **not** report-card chrome, red fails, or deficit labels. Prefer “themes they missed” over “weak subjects.”

### Approved game vocabulary

| Educational concept | Game-facing language |
|---------------------|----------------------|
| Lesson | Quest |
| Topic / subject | World or Zone |
| Question set | Round |
| Correct answer | Hit, Win, Treasure |
| Incorrect answer | Miss, Oops, Wobble |
| Revision | Rematch / Revenge Round / Comeback Quest |
| Difficulty | Quest Level |
| Grade | Rank |
| Learning progress | Adventure Progress |
| Assessment | Boss Battle |
| Curriculum milestone | World Complete |
| Categories (system) | World themes / Adventure zones |
| Daily practice | Daily Challenge |
| Hint | Ask the Guide |
| Wrong-answer review | Beat the Wobblers / Second Chance Showdown |
| Explanation | Treasure tip / Secret fact |
| Local knowledge category | Island Pride / Home Waters (see §16) |

### CTA microcopy rules

- Primary: **Start Quest**, **Quick Play**, **Take the Daily Challenge**, **Rematch**, **Play Again**
- Never: Start lesson, Do homework, Take test, Review mistakes (use Comeback Quest instead)

---

## 3. User journeys (step maps)

### 3.1 Younger child — age ~7 (Profile B)

**Goals:** Fast fun, strong audio, encouragement, fair competition, no shame on miss.

| Step | Screen | Action | System response | Emotion target |
|------|--------|--------|-----------------|----------------|
| 1 | Splash | Opens app (PWA or browser) | Logo + island portal; loads profiles; no long hold | Curiosity |
| 2 | Select player | Taps large card “Play as [Name]” | Confirms profile; stores active player | Ownership |
| 3 | Home | Sees self, rank tease, Daily Challenge, big Play | Clear “who am I” strip | Ready |
| 4 | Optional | Change Guide (sheet) | Preview voice, save per child | Attachment |
| 5 | Play | Taps **Quick Play** or **Start Quest** | Pre-round brief (guide, Q count, power-ups) | Momentum |
| 6 | Pre-round | **Start** | Enter round; hide bottom nav | Focus |
| 7 | Question | Listens (replay available), taps large answer card | Immediate feedback (success or comic-fail) | Joy / giggle |
| 8 | Feedback | Reads short tip + correct answer if miss; **Got it** or auto-continue | Never shame; optional fart if enabled | Safe retry energy |
| 9 | Repeat 7–8 | 5 Q default Quick Play | Streak meter, coins fly, longer timer feel vs older | Progress |
| 10 | Results | Sees treasure haul, not % hero; Play Again / Home / Leaderboard | Dramatic but kind | “One more!” |
| 11 | Leaderboard | Sees points, gap message, multi-award titles | Healthy competition | Hopeful rivalry |
| Exit | Pause → confirm leave | Round state preserved if needed; no accidental profile switch mid-round | Safety |

**Age-7 UX deltas:** larger type on questions; stronger read-aloud default offer; more frequent encouragement lines; comic-fail tone louder than competitive pressure; longer timers when enabled; shorter question copy preferred.

### 3.2 Older child — age ~10 (Profile A)

**Goals:** Beat sibling, harder treasure, speed bonuses, power-ups, worlds, boss later.

| Step | Screen | Action | System response | Emotion target |
|------|--------|--------|-----------------|----------------|
| 1–2 | Splash → Select player | Chooses own profile | Isolated progression | Identity |
| 3 | Home | Scans gap to sibling, Daily Challenge bonus, World | Competitive tease copy | Ambition |
| 4 | Worlds | Picks themed world (not “math topic”) | Progress, unlock state | Exploration |
| 5 | Pre-round | Checks power-ups, expected reward | Strategic prep | Control |
| 6–n | Round | Faster answers, Fifty-Fifty / Double Treasure | Escalating success SFX on streak | Mastery |
| Results | | Leaderboard movement callout | “Only X points behind!” | Comeback fuel |
| Optional | Rematch / Comeback Quest | Attacks prior Wobblers | Recovery points | Agency |
| Optional | Boss Battle (when unlocked) | Boss health bar, funny boss on miss | No total progress wipe | Drama |

**Age-10 UX deltas:** denser info OK on home; speed feedback visible; harder copy; less “hand-hold” microcopy; still zero shame language.

### 3.3 Parent — James

**Goals:** 30-second scan; set weekly prize; sound controls; fix accidents; never fight the UI.

| Step | Screen | Action | System response | Emotion target |
|------|--------|--------|-----------------|----------------|
| 1 | Any child shell | Taps discreet Parent entry | Parent gate | Controlled |
| 2 | Parent gate | Enters 4–6 digit PIN (rate-limited) | Session; timeout on inactivity | Secure enough for family |
| 3 | Dashboard (Overview) | Scans: both kids, points, quests, streaks, reward | Passes 30-second test without scroll maze | Calm clarity |
| 4 | Rewards | Sets participation reward + champion bonus + min quests | Child-facing prize screen updates | Fair family ritual |
| 5 | Settings | Master sound, music, SFX, voice, **fart/comic separate**, reduced motion, categories/difficulty | Preferences persist | Control |
| 6 | Optional | Bonus points / correct score / weekly reset | Confirm destructive actions | Safety |
| 7 | Exit | Leave parent / session expiry | Back to child shell without profile confusion | Clean |

**Parent UX rule:** If a control needs a manual, cut it from v1 surface or bury under “More.”

---

## 4. Information architecture & routes

### 4.1 Confirmed routes (brief §17 refined)

```text
/                              → splash / boot
/select-player                 → profile picker
/player/:playerId/home         → child home
/player/:playerId/characters   → guide picker
/player/:playerId/worlds       → world map
/player/:playerId/play/:mode   → pre-round + active round (mode: quick|world|daily|boss|rematch)
/player/:playerId/results      → post-round results (roundId query or state)
/leaderboard                   → weekly board (context-aware active player optional)
/rewards                       → weekly + virtual rewards
/achievements                  → badges/titles (may deep-link from results)
/parent                        → gate
/parent/dashboard              → overview (30-second screen)
/parent/players                → child config (difficulty, enable, guide default)
/parent/questions              → missed themes / question review (v1 light)
/parent/rewards                → weekly prize config
/parent/settings               → sound, motion, categories, PIN change
```

### 4.2 Refinements (UX Director)

| Topic | Decision |
|-------|----------|
| Achievements | Keep route; v1 can be a filtered view of badges also shown on Rewards |
| Leaderboard / Rewards | Global routes OK; if `playerId` absent, use last-active or require select |
| Active round | Full-screen; **no bottom nav**; back/exit needs confirm if questions answered |
| Deep links mid-round | Restore or soft-block; never silent profile switch |
| Parent shell | Visually calmer theme (lower saturation, less motion) |

### 4.3 Child primary nav (5 items)

| Tab | Route intent | Notes |
|-----|--------------|-------|
| Home | `/player/:id/home` | Default after select |
| Play | `/player/:id/worlds` or play hub | Can open Quick Play sheet |
| Leaderboard | `/leaderboard` | Always exciting with 2 players |
| Rewards | `/rewards` | Prize + cosmetics |
| Profile | `/player/:id/characters` or profile sheet | Guide + switch player entry |

**During round:** hide bottom nav entirely.

### 4.4 Parent nav

Overview · Children · Questions · Rewards · Settings

---

## 5. Screen inventory with required elements

### 5.1 Splash

| Element | Required |
|---------|----------|
| Island Quest logo | Yes |
| Animated island/portal (respect reduced motion → static art) | Yes |
| Loading indicator (honest, short) | Yes |
| Subtle sound toggle | Yes |
| No forced marketing copy | Yes |

**Asset note:** Logo + simple island SVG OK for v1; refined illustration preferred later.

### 5.2 Player selection

| Element | Required |
|---------|----------|
| Large profile cards (min 2) | Yes |
| Avatar | Yes |
| Display name | Yes |
| Quest Level (not “grade”) | Yes |
| Weekly points | Yes |
| Selected guide thumbnail | Yes |
| CTA: **Play as [Name]** | Yes |
| Parent entry (discreet) | Yes |
| Lock: cannot switch profile mid-active-round without confirm | Yes |

### 5.3 Child home

| Element | Required |
|---------|----------|
| Top profile strip (avatar, name, level, coins/XP glance) | Yes |
| Large **Start Quest** / Play Now card | Yes |
| Quick Play secondary | Yes |
| Daily Challenge status + countdown | Yes |
| Leaderboard preview (rank + gap tease) | Yes |
| Current world / continue | Yes |
| Weekly reward progress | Yes |
| Change Guide entry | Yes |
| Recent unlocks (optional if empty-state friendly) | Nice |

### 5.4 Character selection

| Element | Required |
|---------|----------|
| Hero of selected guide | Yes |
| Name + short personality | Yes |
| Dropdown (desktop) / bottom sheet (mobile) | Yes |
| Portrait per option | Yes |
| Play preview voice | Yes |
| Selected indicator | Yes |
| Save (per child) | Yes |
| Random guide (optional) | Nice |
| Voice unavailable inline state | Yes |

### 5.5 World map

| Element | Required |
|---------|----------|
| Scrollable world cards | Yes |
| Illustration, name, progress | Yes |
| Locked state + unlock condition | Yes |
| Boss status when applicable | Yes |
| Theme disguise (no curriculum labels) | Yes |
| Possible reward teaser | Yes |

**Asset note:** v1 world cards = distinctive SVG/theme gradients + icon; full illustrated worlds can ship as generated art later without blocking play.

### 5.6 Pre-round

| Element | Required |
|---------|----------|
| Guide portrait | Yes |
| Mode/world name | Yes |
| Question count | Yes |
| Available power-ups | Yes |
| Expected reward range | Yes |
| Large **Start** | Yes |
| Keep brief (&lt; 5s cognitive load) | Yes |

### 5.7 Question (active round)

| Element | Required |
|---------|----------|
| Question number + progress | Yes |
| Score + streak | Yes |
| Timer (when enabled for mode) | Yes |
| Guide character | Yes |
| Replay audio | Yes |
| Full question text always visible | Yes |
| Large answer cards (4-option / T-F / image) | Yes |
| Power-up bar | Yes |
| Pause / exit (confirm) | Yes |
| No critical controls in unsafe edge zones | Yes |
| Keyboard operable answers | Yes |

### 5.8 Answer feedback overlay

**Correct:** bright confetti, score/XP/coins motion, character celebrate, varied positive line, short explanation, continue (auto delay configurable + button).

**Incorrect:** comic/oops confetti (visually distinct), wobble, optional fart, correct answer revealed, explanation/fun fact, **Got it**, Second Chance if power-up active. Never cold red “ERROR.”

### 5.9 Results

| Element | Required |
|---------|----------|
| Total game score (hero) | Yes |
| Correct count (secondary) | Yes |
| XP + coins | Yes |
| Leaderboard movement | Yes |
| Streak | Yes |
| Unlock/badge if any | Yes |
| Strongest / comeback moment | Nice |
| CTAs: Play Again, New Quest, Leaderboard, Home | Yes |
| No dominant school % | Yes |
| Honest “Saving…” / pending sync if offline | Yes |

### 5.10 Leaderboard

| Element | Required |
|---------|----------|
| Weekly countdown | Yes |
| Both children: avatar, name, rank, points | Yes |
| Quests completed, streak | Yes |
| Score difference / dynamic tease | Yes |
| Multi-award titles (Champion, Best Streak, etc.) | Yes |
| Prize preview | Yes |
| Rank-change animation | Yes (reduced-motion static) |
| No “loser” label | Yes |

### 5.11 Rewards

| Element | Required |
|---------|----------|
| Participation reward + champion bonus | Yes |
| Progress requirements | Yes |
| Earned virtual rewards | Yes |
| Locked cosmetics | Yes |
| Historical champions | Nice |

### 5.12 Parent gate

| Element | Required |
|---------|----------|
| PIN entry 4–6 digits | Yes |
| Rate limit + lockout messaging | Yes |
| No child-solvable math gate as security | Yes |
| Back without revealing parent content | Yes |

### 5.13 Parent dashboard

| Element | Required |
|---------|----------|
| Weekly leaderboard snapshot | Yes |
| Per-child: play time, quests, attempts, approx accuracy | Yes |
| Category summary (plain, non-shaming) | Yes |
| Streaks | Yes |
| Missed-question themes | Yes |
| Upcoming reward | Yes |
| Quick bonus points | Yes |
| Pass 30-second understand test | **Gate** |

### 5.14 Additional states as screens/modals

Pause modal · Exit confirm · Power-up explain · Offline banner · Voice unavailable toast · Empty worlds/rewards · Error recoverable · Weekly end multi-award ceremony (can be leaderboard mode)

---

## 6. Touch / tablet / mobile rules

### Targets

| Control | Minimum |
|---------|---------|
| Generic interactive | **44 × 44 CSS px** |
| Answer cards | **Much larger** — prefer full-width stack on phone; 2×2 grid on tablet with min height ~64–72px content area |
| Primary CTAs | Height ≥ 48–56px; full-width on narrow |
| Bottom nav items | 44px hit + label |

### Layout

- **Safe areas:** respect `env(safe-area-inset-*)` for home indicator / notches; bottom nav and fixed CTAs padded.
- **No vital controls** under browser chrome edges, swipe-back zones, or overlapping system gestures.
- **Portrait primary** for phone; **tablet portrait + landscape** both supported (brief visual tests: 375×812, 768×1024, 1024×768, 1440×900).
- **No hover-only** affordances; every action works with touch only.
- **Spacing:** generous; avoid dense “admin table” on child surfaces.
- **Scroll:** world map and long parent lists OK; question screen should avoid nested scroll traps for answers.
- **PWA standalone:** treat as app chrome-less; keep top profile strip clear of status bar.

### Answer card rules

- High contrast text
- One tap commits (with brief press feedback)
- Disabled after answer until feedback completes (prevent double-tap chaos)
- Image-choice: large hit area includes image + label

---

## 7. Visual design system

### 7.1 Aesthetic — Island Hub

**Hub:** tropical island adventure (Gili Meno–inspired pride without restricting worlds). Island is the **portal hub**; worlds are themed destinations (ocean, jungle, space, dino, volcano, pirate, etc.).

**Qualities:** bold, colourful, rounded, tactile, animated, playful, modern, uncluttered, high contrast.

**Avoid:** worksheet grids, corporate dashboards, tiny grey text, emoji-as-icons, generic Bootstrap-template look, cold red error walls.

### 7.2 Design tokens (CSS custom properties)

Builders implement these names; values may be tuned in polish but **semantic roles are locked**.

```css
/* Brand */
--color-primary: /* deep lagoon teal */;
--color-primary-pressed: /* darker teal */;
--color-secondary: /* sunset coral */;
--color-accent: /* treasure gold */;
--color-accent-soft: /* pale gold wash */;

/* Semantic feedback (never colour-only) */
--color-success: /* jungle green */;
--color-success-soft: /* mint wash */;
--color-warning: /* amber */;
--color-danger: /* warm red — use sparingly; not for “wrong answer” primary UI */;
--color-comic-miss: /* playful purple/orange — wrong-answer theme */;

/* Surfaces */
--color-surface: /* warm sand / soft cream */;
--color-surface-raised: /* white / elevated card */;
--color-surface-sunken: /* shallow lagoon tint */;
--color-overlay: /* scrim */;

/* Text */
--color-text: /* near-ink navy */;
--color-text-muted: /* slate */;
--color-text-on-primary: /* white */;
--color-text-on-accent: /* navy or white per contrast check */;

/* Focus & a11y */
--color-focus: /* high-contrast electric outline */;
--focus-ring-width: 3px;

/* Parent shell (calmer) */
--parent-color-surface: /* cool neutral */;
--parent-color-primary: /* restrained teal */;
--parent-color-text: /* charcoal */;

/* Radii & elevation */
--radius-sm: 8px;
--radius-md: 16px;
--radius-lg: 24px;
--radius-pill: 999px;
--shadow-card: /* soft lifted */;
--shadow-pop: /* playable press */;

/* Spacing scale */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 24px;
--space-6: 32px;
--space-7: 48px;

/* Motion */
--motion-fast: 150ms;
--motion-med: 250ms;
--motion-slow: 400ms;
--ease-playful: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);

/* Type */
--font-display: /* rounded friendly display */;
--font-body: /* clean readable sans */;
--font-mono-nums: /* tabular nums for scores */;
```

**Contrast:** body text and answer text meet WCAG AA against surfaces; focus ring always visible on both themes.

**Correct/incorrect:** pair colour with **icon shape + motion + copy** (check burst vs wobble/X-comic).

### 7.3 Typography

| Role | Guidance |
|------|----------|
| Display headings | Friendly rounded; bold; no thin weights |
| Question text | Large (phone ~1.25–1.5rem+; tablet larger); high readability |
| Answer text | Large; wrap 2–3 lines max before redesign |
| Scores / timers | Tabular numbers; strong weight |
| Parent UI | Slightly tighter; still 16px+ body |
| Multilingual | Support Indonesian names/characters; avoid fonts that break diacritics |

**Rule:** No hairline weights. Prefer weight 600–800 for CTAs.

### 7.4 Icon policy

- **SVG icons only** for UI chrome (play, pause, sound, home, trophy, streak flame, power-ups).
- **Emoji are not permanent interface icons** (brief §19 / agent rules).
- Decorative character art may be SVG/WebP illustrations, not emoji faces as system icons.
- Power-ups: unique simple SVG metaphors (half-mask, clock, speech bubble, 2× gem, shield, redo).

### 7.5 Asset policy (placeholder vs generated)

| Asset | v1 OK as placeholder | Prefer generated/refined art |
|-------|----------------------|------------------------------|
| UI icons (nav, power-ups, status) | **Yes — SVG set** | Polish pass |
| Logo wordmark | Simple SVG/text logo | Brand illustration later |
| World cards | Gradient + SVG motif | Full world paintings |
| Guide portraits | Stylized SVG/WebP placeholders if consistent | Distinct character art |
| Boss | Simple SVG creature | Richer boss later |
| Confetti/particles | CSS/canvas shapes | Optional richer later |
| Island hub background | SVG/CSS scene | Rich illustration later |
| Sound | Short SFX stubs | Final mix polish |

**Gate:** Placeholders must still feel **game-like and consistent**, not default OS emoji or Lorem wireframe grey boxes.

---

## 8. Motion system

### 8.1 Intent map

| Event | Motion | Notes |
|-------|--------|-------|
| Card enter | Soft rise/fade | Stagger ≤ 3 items |
| Correct | Bright confetti, pulse card, coin fly to counter, streak meter fill | Escalating intensity on streak 3/5/perfect |
| Incorrect | Wobble card, character tip/spin, **muted comic confetti** | Visually distinct from victory |
| Score change | Number tick-up | Interruptible |
| Power-up | Short burst + icon flash | Explain once |
| Level-up / unlock | Modal celebration | Skippable |
| Leaderboard rank change | Slide/glow rank badge | |
| Boss damage | Health bar drain + comic hit | Miss = funny boss taunt, not death screen |

### 8.2 Timing defaults

- Feedback auto-advance (correct): ~1.2–1.8s or tap continue
- Incorrect: prefer **manual Got it** for younger readers (or longer delay)
- Micro-interactions: 150–250ms
- Celebrations: ≤ 2.5s before idle

### 8.3 `prefers-reduced-motion`

When OS prefers reduced motion **or** parent setting **Reduced Motion** is on:

- Replace confetti with simple opacity/color state + icons
- No spin/fall loops; static character pose swap OK
- No parallax
- Instant or fade-only transitions
- Rank change: highlight without sliding chaos

Parent setting must override/enforce reduced motion for family device shared use.

---

## 9. Sound system

### 9.1 Layers

| Layer | Examples | Default |
|-------|----------|---------|
| UI | Tap, open sheet, nav | On |
| Results FX | Correct chime ladder, wrong comic pop | On |
| Comic/fart | Wrong-answer fart / raspberry | **On but separately toggleable** |
| Streak | Escalating stingers | On |
| Power-up | Whoosh/activate | On |
| Economy | Coin, level-up | On |
| Boss | Damage, defeat | On |
| Ceremony | Weekly champion sting | On |
| Music | Soft loop on hub/results | Off until interaction; parent/master controllable |
| Voice | ElevenLabs guide | On; fail open to text |

### 9.2 Controls (parent + quick child mute)

- **Master sound**
- **Music**
- **Effects**
- **Voice**
- **Comic / fart** ← James can disable **without** muting all SFX

Child home: quick mute/unmute master (does not re-enable fart if parent disabled).

### 9.3 Browser policy

- No background audio before first user gesture.
- Stop voice on leave-question / pause / route change.
- No overlapping guide voice; replay replaces current.
- Essential info never audio-only.

### 9.4 Asset note

v1 may ship short placeholder SFX (clean, not copyright-grey); final characterful pack can replace files without UX rework if named by event.

---

## 10. Character selector UX

### Availability

- Profile setup (if first run)
- Home → Change Guide
- Profile tab
- Optional: pre-round (must not block Start; remembered choice)

### Interaction pattern

| Viewport | Pattern |
|----------|---------|
| Mobile / tablet touch | **Bottom sheet** with large rows |
| Desktop / wide | Custom **dropdown** or compact popover (not native tiny select alone) |

### Each option row

1. Portrait  
2. Name  
3. One-line personality  
4. **Play preview** (speaker button)  
5. Selected check  

### Behaviour

- Selection **saved per child** (`guideCharacterId` on player)
- Preview uses same TTS proxy + allowlisted voice; on failure show “Preview unavailable” without blocking save
- Random guide: optional shuffle among enabled
- Changing guide mid-round: apply to next voice line or next round (pick one; recommend **next line** if seamless, else next question)

### Copy examples

- “Ready to dive into your next adventure?” (Captain Coral preview)
- “Curious minds find the best treasure.” (Professor Paws)

---

## 11. Feedback microcopy banks

Vary lines; avoid same string every time. Never shame. Never “failed.”

### 11.1 Correct — general

1. Yes! Treasure found!
2. Boom! Perfect answer.
3. You nailed it!
4. Legendary hit!
5. That was a tough one—and you got it!
6. Coins secured!
7. Guide is cheering for you!
8. Spot on, explorer!
9. Brilliant!
10. Adventure level: awesome!

### 11.2 Correct — streak beats

| Streak | Lines |
|--------|-------|
| 2 | Double trouble! / Two in a row! |
| 3 | Three in a row! / You’re on fire! |
| 4 | Unstoppable! / Streak machine! |
| 5+ | Mythic streak! / Island legend status! |
| Perfect round | Perfect round! Full treasure chest! |

### 11.3 Incorrect — comic (no shame)

1. Pffffffft! The volcano got us.
2. Nearly! The octopus stole that one.
3. Oops confetti! You found a tricky one.
4. Not this time—but now you know.
5. That answer slipped on a banana.
6. Wobble! The pirate map was upside down.
7. Whoops—trapdoor! Here’s the real path.
8. Close! The parrot squawked a different answer.
9. Missed it—still a brave explorer.
10. The crab pinched that one. You’ve got the secret now.

### 11.4 Incorrect — after reveal structure

Always structure:

1. Comic line (above)  
2. **Correct answer is:** {answer}  
3. One-sentence explanation / fun fact  
4. CTA: **Got it** / **Next**

Example:

> Oops confetti! You found a tricky one.  
> **Correct answer:** Saturn  
> It has thousands of icy rings and ringlets.  
> [Got it]

### 11.5 Results screen

1. What a quest!
2. Treasure haul complete!
3. The island is proud of that run!
4. Ready for another adventure?
5. Leaderboard shake incoming!

### 11.6 Leaderboard teases (healthy)

1. Only {n} points behind!
2. One quest could change everything.
3. {Name} has taken the lead!
4. New personal best!
5. Three days left in this week’s battle.
6. Neck and neck—epic week!

### 11.7 Empty / gentle system (child tone)

- Daily Challenge done: “Daily treasure claimed! Come back tomorrow.”
- No unlocks yet: “Your first badge is one quest away.”

---

## 12. Healthy competition UI

### Rules

- **Never** label anyone “loser,” “last place shame,” “failed the week.”
- Rank is factual (1 / 2) without mockery.
- Celebrate **both** personal improvements.
- Participation rewards + multi-award week are first-class UI, not footnotes.

### End-of-week / ongoing multi-award titles

Show as badges/ribbons (multiple can apply):

| Title | Intent |
|-------|--------|
| Weekly Champion | Highest weekly points |
| Best Streak | Longest streak |
| Most Improved | Delta vs prior week / personal best |
| Quest Explorer | Most quests completed |
| Comeback Star | Strong recovery / rematch performance |
| Fact Finder | Strong accuracy or category exploration |

### Leaderboard presentation

- Equal visual dignity for both cards
- Gap messages are **exciting**, not demeaning
- Winner’s bonus described as bonus, not “only one child gets anything”
- James can grant both kids real-world rewards; UI shows participation + champion tracks

### Forbidden patterns

- Greyed-out “loser” avatar
- Sad music only for second place
- Public “accuracy shame” callouts between siblings
- Removing earned rewards as punishment

---

## 13. Parent gate + parent dashboard simplicity

### Gate

- 4–6 digit PIN, hashed server-side when remote auth used
- Rate limit attempts; clear “try again later” (no child blame)
- Session expires after inactivity
- Calm visual (not jump-scare “ADMIN”)
- Math gate **not** acceptable as security

### 30-second dashboard layout (top → bottom)

1. **This week** header + countdown  
2. **Two child cards** side-by-side (or stacked on phone): points, rank, quests, streak  
3. **This week’s rewards** (participation + champion)  
4. **Activity strip:** play time, questions attempted, approx accuracy  
5. **Quick actions:** set reward, bonus points, open settings  

### Parent simplicity rules

- Default path: Overview answers Test B without leaving page  
- Destructive actions (reset week, wipe scores): confirm modal with plain consequence text  
- Category performance: neutral wording (“Themes practiced”)  
- No school gradebook tables as the aesthetic  

### Parent sound controls

Master · Music · Effects · Voice · **Comic/fart separate** · Reduced motion

---

## 14. Empty / error / offline / voice-unavailable states

Aligned with brief §31 and GABS 3.6 (no confusing states).

| State | Child UX | Honesty rule |
|-------|----------|--------------|
| Empty rewards | Friendly “adventure waiting” art + CTA Start Quest | No broken shelves |
| Empty achievements | “Badges appear as you quest” | No error |
| No daily left | Countdown to next | Clear |
| Voice unavailable | Subtle banner/toast: “Voice unavailable” + Retry; **text always playable** | Never block round |
| Voice loading | Visual pulse on speaker; question already readable | No blank wait |
| Offline mid-round | Keep playing if questions cached; banner “You’re offline—progress will sync” | Don’t fake leaderboard update |
| Sync pending | Results: “Saving…” then “Saved” or “We’ll sync when online” | No false rank claim |
| Sync failed | “Couldn’t save yet—safe on this device” + retry | Parent recovery path later |
| Leaderboard fetch fail | Last known + “Can’t refresh right now” | Stale data labeled |
| TTS rate limit | Soft fail; continue | No crash |
| Parent PIN lockout | Time-based message | No infinite try spam |
| Generic error | “Something wobbled” + Try again + Home | No stack traces |
| Missing art | Theme color + SVG icon fallback | No broken image shame |

**Distinctions required in UI copy:** unsupported vs unavailable vs failed (GABS 3.6).

---

## 15. Accessibility checklist

- [ ] All questions visible as text always  
- [ ] Optional read-aloud + **replay** control labeled  
- [ ] Captions/text for voiced reactions (microcopy on screen)  
- [ ] High contrast theme defaults  
- [ ] Touch targets ≥ 44×44; answers larger  
- [ ] Full keyboard support: answers, nav, dialogs  
- [ ] Visible focus ring (`--color-focus`)  
- [ ] `prefers-reduced-motion` + parent Reduced Motion  
- [ ] Correct/incorrect **not colour-only** (icon + text + motion/haptics)  
- [ ] Music/effects adjustable; essential info not sound-only  
- [ ] `aria-label` / accessible names on icon buttons (sound, replay, pause, power-ups)  
- [ ] Live regions for score/streak updates (polite) without spam  
- [ ] Dialogs: focus trap, Escape closes where safe, return focus  
- [ ] Parent PIN fields: accessible labels, error text linked  
- [ ] Hit Lighthouse Accessibility goal ≥ 90 on representative screens (product target)  
- [ ] No seizure-inducing full-screen rapid flashes  

---

## 16. Content presentation rules

### Explanations

- One short sentence after answer  
- Shown on **both** correct and incorrect (learning without school chrome)  
- Label options: “Treasure tip” / “Secret fact” — not “Explanation of curriculum objective”  

### Fun facts

- Optional second line (`funFact`) — keep ≤ 1 sentence  
- Especially good on incorrect path for memory  

### Local pride category (Indonesia / Gili Meno / Lombok / ocean)

| Do | Don’t |
|----|-------|
| Present as **Island Pride**, **Home Waters**, or world **Coral Coast / Gili Adventures** | Call it “Local Studies unit” |
| Frame as advantage and family pride | Frame as remedial geography |
| Include marine care, reef, volcano, simple Bahasa vocab, ocean safety (age-safe) | Frightening disaster sensationalism |
| Celebrate “you know your island!” moments | Stereotype or tourist cliché only |

### Question presentation

- Prefer short questions for Level 1  
- Four large options default  
- True/false: two big cards  
- Image choice: image + text label  
- No trick wording; no scare content  
- Timer never the only pressure for young profile defaults  

### In-round power-up labels (child-facing)

Fifty-Fifty · Extra Time · Ask the Guide · Double Treasure · Second Chance · Shield  

Each has one-line plain help on first use.

---

## 17. Component inventory for frontend

Named components for implementation mapping (not code). **Count: 64.**

### Shell & nav

1. `AppShell`  
2. `ChildShell`  
3. `ParentShell`  
4. `BottomNav`  
5. `SafeAreaFrame`  
6. `RouteProgress` (optional boot)  

### Splash & profiles

7. `SplashScreen`  
8. `PlayerSelectScreen`  
9. `PlayerCard`  
10. `ProfileStrip`  
11. `AvatarView`  

### Home & play entry

12. `ChildHomeScreen`  
13. `PlayNowCard`  
14. `DailyChallengeCard`  
15. `LeaderboardPreview`  
16. `WeeklyRewardProgress`  
17. `RecentUnlocksRow`  

### Characters

18. `CharacterSelectScreen`  
19. `CharacterHero`  
20. `CharacterPickerDropdown`  
21. `CharacterPickerSheet`  
22. `CharacterOptionRow`  
23. `VoicePreviewButton`  

### Worlds & pre-round

24. `WorldMapScreen`  
25. `WorldCard`  
26. `UnlockConditionBadge`  
27. `PreRoundScreen`  
28. `PowerUpInventory`  
29. `PowerUpChip`  
30. `PowerUpExplainModal`  

### Round / questions

31. `RoundLayout` (nav-hidden)  
32. `QuestionHeader` (progress, score, streak, timer)  
33. `GuidePresence`  
34. `QuestionText`  
35. `AnswerCard`  
36. `AnswerCardGrid`  
37. `TrueFalsePair`  
38. `ImageChoiceGrid`  
39. `AudioReplayButton`  
40. `PauseModal`  
41. `ExitRoundConfirm`  
42. `TimerBar`  
43. `StreakMeter`  
44. `ScoreTicker`  

### Feedback & results

45. `AnswerFeedbackOverlay`  
46. `SuccessCelebration`  
47. `ComicFailCelebration`  
48. `ConfettiLayer` (victory vs oops variants)  
49. `ResultsScreen`  
50. `RewardBurstSummary`  
51. `LeaderboardDeltaCallout`  

### Meta child

52. `LeaderboardScreen`  
53. `LeaderboardRow`  
54. `WeeklyCountdown`  
55. `AwardRibbon` / multi-award strip  
56. `RewardsScreen`  
57. `CosmeticItemCard`  
58. `AchievementsScreen`  
59. `BadgeTile`  

### Parent

60. `ParentGate`  
61. `ParentDashboard`  
62. `ParentChildSummaryCard`  
63. `WeeklyRewardEditor`  
64. `ParentSettingsPanel` (includes sound layers + reduced motion + fart toggle)

### Cross-cutting systems (logical UI components)

Also required as shared primitives (builders may fold into design system):  
`Button`, `IconButton`, `Modal`, `Toast`, `Banner`, `EmptyState`, `ErrorState`, `OfflineBanner`, `VoiceStatusPill`, `SkeletonCard`, `FocusRing` styles, `SvgIcon`.

*(Primitives are mandatory but counted separately from the 64 feature components above.)*

---

## 18. Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Over-stimulation** | Fatigue, parent rejection, sensory overload | Layered sound toggles; reduced motion; cap celebration length; calmer parent shell |
| **Shame** | Younger child quits; sibling hostility | Comic-fail system; multi-awards; no loser labels; no weak-area UI; normalised points |
| **Accidental profile switch** | Wrong scores, fights, broken trust | Large but deliberate select; lock mid-round; confirm switch; show active name always |
| **Dark patterns** | Unethical product; Carl reject | No pay-to-win; no infinite nag; no fake urgency beyond real weekly countdown; no guilt “you haven’t studied” |
| **School chrome creep** | Fails Test A | Vocabulary table enforced in review; % not hero metric |
| **Fart sound regret** | Household annoyance | Separate disable; default OK on but parent finds in &lt; 2 taps in settings |
| **Voice latency** | Feels broken | Text-first; loading indicator; cache; non-blocking |
| **Offline false victory** | Leaderboard drama | Honest saving states; server verifies scores |
| **Placeholder art looking like prototype** | Fails polished-game bar | Consistent SVG system + colour; ban grey wireframe ship |
| **Confusing error states** | Rage quits | GABS 3.6: unavailable vs failed; always recovery path |

---

## 19. Open questions for Conductor

1. **Default fart/comic SFX:** on or off for first install? (UX recommends **on**, parent-discoverable disable.)  
2. **Auto-advance timing** for correct answers: global default vs longer for Level 1?  
3. **Profile names/avatars for v1:** fixed James’s two children only, or editable display names in parent?  
4. **Achievements route vs Rewards tab merge** for nav simplicity—keep both or combine for v1?  
5. **Haptics:** on by default for correct on supported devices?  
6. **Language:** English-only UI strings v1, with Indonesian names in content—confirm.  
7. **First-run onboarding:** skip tutorial (3-tap rule) vs one-screen “pick guide” only?  
8. **Boss Battle / Head-to-Head:** confirm UX shells in v1 vs stub worlds only (brief: H2H after stable loop).  
9. **Parent PIN bootstrap:** how is initial PIN set on first launch (local setup wizard)?  
10. **Alignment with Design/Dev directors** on remote-pending UI copy when repository not yet chosen.

---

## 20. Definition of done for UX gate

UX gate **PASS** only when all are true (evidence later from build + independent test):

1. Child UI uses **game vocabulary only**; zero forbidden school labels in child-facing strings inventory.  
2. Journeys support **~3-tap** start for returning player.  
3. All §18 screens exist with required elements (even if art is placeholder SVG).  
4. Touch rules: 44px min; large answer cards; safe areas on tablet/phone.  
5. Tokens + icon SVG policy implemented (no emoji icons in chrome).  
6. Distinct **success vs comic-fail** motion/sound; reduced-motion path works.  
7. Sound layers include **separate comic/fart** control for parent.  
8. Character picker: sheet/dropdown, preview, **per-child save**.  
9. Microcopy banks present in content/config (not one repeated string).  
10. Leaderboard multi-award; **no loser** treatment.  
11. Parent dashboard passes **30-second understand** walkthrough.  
12. Empty/error/offline/voice-unavailable states are designed and non-blocking for play.  
13. Accessibility checklist items implemented or explicitly deferred with Conductor risk record.  
14. Local pride category presented as pride/adventure, not school subject.  
15. Independent product test can execute brief §32.3 flows on mobile layout.  
16. Product still feels like a **game app**, not a worksheet (Test A subjective review by Conductor/Carl).

---

## 21. Key Decisions table

| ID | Decision | Rationale |
|----|----------|-----------|
| UX-01 | Island **hub + world portals** aesthetic | Local pride + variety without single-biome trap |
| UX-02 | Enforce brief vocabulary table as child string law | Pass Test A |
| UX-03 | Hide bottom nav during rounds | Prevent accidental exit |
| UX-04 | Profile switch locked mid-round | Score integrity + sibling fairness |
| UX-05 | Comic-fail palette separate from danger-red errors | Wrong ≠ system error |
| UX-06 | Manual **Got it** preferred on incorrect | Reading time for tip; less shame rush |
| UX-07 | Parent shell calmer visual theme | Test B; adult cognitive load |
| UX-08 | Fart/comic SFX independently toggled | Household peace |
| UX-09 | Text-first, voice-enhancement | A11y + ElevenLabs resilience |
| UX-10 | Multi-award weekly recognition UI | Healthy competition |
| UX-11 | SVG icons only; emoji banned as chrome | Polished cross-platform UI |
| UX-12 | Placeholder SVG art allowed if game-consistent | Unblock v1 without fake “final art” claims |
| UX-13 | Local category as Island Pride / Home Waters | Pride framing |
| UX-14 | Results hero = game score/treasure, not % | Anti-exam feel |
| UX-15 | Honest offline/sync labels | No dark pattern leaderboard lies |
| UX-16 | Character picker: dropdown desktop, sheet mobile | Brief §14 + touch |
| UX-17 | Power-up set as brief §11; earned not purchased | No monetization dark patterns |
| UX-18 | Rematch modes use Revenge/Comeback naming | Hide “revision” |

---

## 22. UX/UI DIRECTOR RECOMMENDATION

### **PASS TO CHALLENGE**

**Status:** This UX/UI packet is complete enough to enter **Challenge** alongside Design and Dev director packets.  

**Not a product ship approval.** No code should be written until Conductor synthesis + challenge disposition per GLOBAL AGENTIC BUILD SYSTEM.

### Recorded risks to carry into Challenge (not blockers for planning)

- Placeholder art must be held to a **consistent game bar** or Test A fails at polish.  
- Content volume (≥300 questions) is not a UX block but affects empty/repetition UX if bank is thin.  
- Initial parent PIN bootstrap needs Design/Dev alignment (open question 9).  
- Boss/H2H scope should not dilute core loop polish.

### Explicit non-actions

- No application source code produced by this director.  
- No deploy.  
- No scope expansion into school LMS, chat, or public multiplayer.

---

## Appendix A — Quick reference: modes (child-facing labels)

| Mode | Label | Default length |
|------|-------|----------------|
| Quick Play | Quick Play | 5 |
| World Quest | World Quest / named world | 10 |
| Daily Challenge | Daily Challenge | 5 |
| Boss Battle | Boss Battle | 10 |
| Rematch | Comeback Quest / Revenge Round | short |

## Appendix B — Evidence this director expects later (not produced now)

- Screenshot set at brief breakpoints  
- String inventory grep for forbidden school terms  
- Manual 30-second parent scan recording or checklist  
- Reduced-motion and fart-toggle verification  
- Touch target audit on tablet  

---

*End of UX/UI Director packet — mission d968e79b*
