# Expected Value Lab

A learn-by-doing web app that teaches expected value through 8 visual, interactive problems. Built per the MVP PRD — no AI, all hand-built feedback.

## Build order status

| Order | Scope | Status |
|-------|--------|--------|
| 1 | App skeleton, routes, Firebase, Google sign-in, user profiles | Done |
| 2 | Chapter path, problem list, completion %, Continue, mastery, streak, milestones | Done |
| 3 | Lesson engine: problem data, answer parser, feedback & hint panels | Done |
| 4 | Core visuals: spinner, graph, mystery boxes, table, formula, balance, fairness line, risk graph | Done |
| 5 | Problems 1–8 with completion rules, mistake types, hints, feedback | Done |
| 6 | Persistence: current problem, attempts, hints, mastery, streak, milestones | Done |
| 7 | Mobile pass: tap-to-select/place, 44px touch targets | Done |
| 8 | Deploy: Firebase Hosting + test checklist | Done |

## Getting started

```bash
npm install
cp .env.example .env          # add Firebase config
cp .firebaserc.example .firebaserc   # set your project id
firebase deploy --only firestore:rules
npm run dev
```

## Deploy publicly

```bash
npm run deploy          # build + deploy hosting + rules
# or
npm run deploy:hosting  # hosting only
```

After deploy, add your hosting URL to **Firebase Console → Authentication → Authorized domains**.

## MVP test checklist (PRD)

Run through this flow on desktop and at 375px width:

- [ ] Sign in with Google
- [ ] Start chapter from home
- [ ] **Problem 1:** predict, spin 100+, submit $5
- [ ] **Problem 3:** reveal boxes, submit wrong answer → see specific feedback
- [ ] Show hint on P3 → feedback references visual help
- [ ] Leave mid-problem (close tab), return → **same problem, saved reveals/inputs/hints**
- [ ] Complete all 8 problems
- [ ] See completion %, streak, milestones (including chapter-complete)
- [ ] If mastery criteria met: status **Mastered**, chapter-mastered milestone
- [ ] **Suggested review** shows areas to revisit (wrong attempts, hints used)
- [ ] Second user account: progress is isolated per user

## Persistence (Firestore)

| Collection | Purpose |
|------------|---------|
| `users/{userId}` | Profile |
| `chapterProgress/{userId}_expected_value_intro` | Completion, current problem, mastery, streak |
| `problemSessions/{userId}_{problemId}` | In-problem state + revealed hints |
| `problemAttempts/{attemptId}` | Attempts with normalized answers, hint usage |
| `milestones/{userId}_expected_value_intro` | Unlocked milestones |

localStorage mirrors progress when offline or rules not deployed.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run deploy` | Build + Firebase deploy |
| `npm run deploy:hosting` | Hosting only |
| `npm run deploy:rules` | Firestore rules only |
