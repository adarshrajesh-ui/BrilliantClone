# Midpoint

A learn-by-doing web app that teaches expected value through 14 visual, interactive problems across 5 lessons, with AI-generated adaptive practice layered on learning-science principles.

**Live app:** **https://expected-value-lab.web.app/**

**Decision record / BrainLift:** see [`BrainLift.md`](./BrainLift.md) for the reasoning behind the AI-first build process and the app-design decisions.

## What's in the app

The chapter "Expected Value" is built in three deliberate phases:

- **Phase 1 — Curriculum (no AI).** Five lessons and 14 hand-built, visual, interactive problems that move from simulation intuition to a complete expected value model. The app owns all grading, hints, feedback, mastery, streaks, and milestones.
- **Phase 2 — AI as a controlled generator.** A "Practice" mode generates fresh expected-value problems via OpenAI, **server-side only** through Firebase Cloud Functions. AI fills surface-level content (scenario copy, numbers within constraints, distractors); the app keeps full ownership of grading, answer keys, difficulty, and mastery. A deterministic difficulty matrix and a deterministic fallback guarantee valid problems even if the model fails.
- **Phase 3 — Learning science.** Adaptive practice adds spaced repetition, interleaving across problem types, and difficulty scaffolding (guided → supported → independent) driven by a per-skill mastery model.

> **Scope note:** The shipped chapter has **14 problems** (5 lessons: 3+3+2+3+3). The original [product requirements doc](./prd.md) still describes a 15-problem layout from an earlier iteration; this README and the codebase reflect the **14-problem** chapter that is actually built.

## Build order status

| Order | Scope | Status |
|-------|--------|--------|
| 1 | App skeleton, routes, Firebase, Google sign-in, user profiles | Done |
| 2 | Chapter path, problem list, completion %, Continue, mastery, streak, milestones | Done |
| 3 | Lesson engine: problem data, answer parser, feedback & hint panels | Done |
| 4 | Core visuals: dice tray, spinner, graph, mystery boxes, cards/deck, table, formula, balance, fairness line, risk graph | Done |
| 5 | 14 problems (5 lessons) with completion rules, mistake types, hints, feedback | Done |
| 6 | Persistence: current problem, attempts, hints, mastery, streak, milestones | Done |
| 7 | Mobile pass: tap-to-select/place, 44px touch targets | Done |
| 8 | Deploy: Firebase Hosting + test checklist | Done |
| 9 | Phase 2 — AI practice generation (server-side Cloud Functions, OpenAI, daily quota, difficulty matrix, deterministic fallback) | Done |
| 10 | Phase 3 — Adaptive engine: per-skill mastery, spaced-repetition scheduler, interleaving, difficulty scaffolding | Done |

## Getting started

```bash
npm install
cp .env.example .env          # add Firebase config
cp .firebaserc.example .firebaserc   # set your project id
firebase deploy --only firestore:rules
npm run dev
```

**Guest mode:** On the login screen, choose **Continue without signing in** to try the app without Google. Guest progress is saved only on this device (localStorage); sign in with Google to sync progress to Firestore.

AI practice generation needs an OpenAI key set as a Firebase Functions secret (never in the root `.env`):

```bash
firebase functions:secrets:set OPENAI_API_KEY
```

Optional model override (defaults to `gpt-4o-mini` when unset): create `functions/.env` with:

```bash
OPENAI_MODEL=gpt-4o-mini
```

`functions/.env` is gitignored — do not commit it. For deployed functions, set the same variable in your Functions runtime environment if you override the default.

## Phase 2 — AI practice generation

- Generation runs in `functions/src/` as the `generatePracticeQuestion` callable; answers are checked server-side by `checkGeneratedAnswer`. The OpenAI key never reaches the client.
- A per-user daily quota (50 generations per UTC day) is enforced via a Firestore transaction.
- The server recomputes the answer key and rebuilds explanatory feedback deterministically — the model is never trusted for the math.
- `src/features/practice/difficultyMatrix.ts` is the single source of truth for how each template scales across difficulty 1–5 and is mirrored byte-for-byte to `functions/src/difficultyMatrix.ts` so the client and server fallbacks cannot drift.

## Phase 3 — Adaptive engine & learning science

Live Practice mode (`src/pages/PracticePage.tsx`) wires the adaptive engine like this:

- **Per-skill mastery** (`src/core/adaptive/masteryModel.ts`) derives skill scores and evidence from chapter attempts via `buildAdaptiveSnapshot` (`src/lib/adaptivePracticeService.ts`); each graded practice answer updates live state with `updateSkillState`.
- **Spaced repetition** (`src/core/adaptive/scheduler.ts`) sets `nextReviewAt` from the mastery score (≈10 min → 1 day → 3 days → 7 days → 14 days; wrong answers pull review forward to 5–10 min). In Practice, `selectNextTheme` (`src/features/practice/practiceThemes.ts`) prefers themes whose mapped skill is due (`isReviewDue`) before falling back to highest-need rotation.
- **Interleaving** (`src/features/practice/practiceThemes.ts`) picks the next practice theme under session diversity caps (theme cooldown, per-family window cap, per-skill session cap) and can steer to a same-family “cousin” theme after a miss; difficulty per theme comes from `difficultyForTheme` → `targetDifficultyForScore`.
- **Difficulty scaffolding** (`scaffoldTierForScore` in `src/core/adaptive/scheduler.ts`, used in `PracticePage.tsx`) moves learners from `guided` → `supported` → `independent` as mastery grows; wrong answers step one tier toward more support.

(`src/core/adaptive/selector.ts` / `getAdaptivePracticePlan` are a test/service layer only — not wired to the Practice UI.)

## Deploy publicly

```bash
npm run deploy          # build + deploy hosting + rules + functions
# or
npm run deploy:hosting    # hosting only
npm run deploy:functions  # functions only
npm run deploy:rules      # firestore rules only
```

Copy the **Hosting URL** from the Firebase CLI output into the **Live app** line at the top of this README.

After deploy, add your hosting URL to **Firebase Console → Authentication → Authorized domains**.

## MVP test checklist ([PRD](./prd.md))

Run through this flow on desktop and at 375px width:

- [ ] Sign in with Google **or** continue without signing in (guest progress is device-local only)
- [ ] Start chapter from home
- [ ] **Problem 1:** predict, roll the dice 100+, submit the long-run average (7)
- [ ] **A mystery/deck problem:** reveal outcomes, submit a wrong answer → see specific feedback
- [ ] Show a hint → feedback references the visual help
- [ ] Leave mid-problem (close tab), return → **same problem, saved reveals/inputs/hints**
- [ ] Complete all 14 problems
- [ ] See completion %, streak, milestones (including chapter-complete)
- [ ] If mastery criteria met: all **14** problems complete, **correct** on capstone (`ev-l5-p3`), payout-vs-profit (`ev-l4-p1`), and same-EV/different-risk (`ev-l5-p2`), plus **≥11 strong completions** (each completed problem solved in ≤2 graded attempts) → status **Mastered**, chapter-mastered milestone
- [ ] **Practice mode:** generate an AI problem, answer it, see it graded server-side
- [ ] Second user account: progress is isolated per user

## Persistence (Firestore)

| Collection | Purpose |
|------------|---------|
| `users/{userId}` | Profile |
| `streaks/{userId}` | Daily streak state (current/longest streak, freeze, trailing activity calendar) |
| `chapterProgress/{userId}_expected_value_intro` | Completion %, completed problem IDs, current/next problem, mastery status |
| `lessonProgress/{userId}_{lessonId}` | Denormalized per-lesson completion timestamps and completed IDs (derived from chapter progress) |
| `problemProgress/{userId}_{problemId}` | Per-problem status, completion snapshot, demo-seen, restart count, review metadata |
| `problemSessions/{userId}_{problemId}` | In-problem state + revealed hints |
| `problemAttempts/{attemptId}` | Attempts with normalized answers, hint usage |
| `milestones/{userId}_expected_value_intro` | Unlocked milestones |
| `practiceUsage/{userId}_{day}` | Daily AI-generation quota counter (server-written) |
| `generatedPractice/{problemId}` | Server-generated practice problems + answer keys (server-only) |
| `generatedProblemAttempts/{attemptId}` | Attempts on generated practice problems |

localStorage mirrors progress when offline or rules not deployed (including streak docs under `evl_streak_{userId}`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run test` | Run the test suite (Vitest) |
| `npm run lint` | Lint with oxlint |
| `npm run deploy` | Build + Firebase deploy |
| `npm run deploy:hosting` | Hosting only |
| `npm run deploy:functions` | Cloud Functions only |
| `npm run deploy:rules` | Firestore rules only |
