# Expected Value Lab

A learn-by-doing web app that teaches expected value through visual, interactive problems. Checkpoints 1–2 include auth, user profiles, and the chapter progress shell.

## Tech stack

- React + TypeScript (Vite)
- React Router
- Firebase Authentication (Google sign-in)
- Firestore (users, chapter progress, milestones)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Firebase console setup (one-time)

1. Go to [Firebase Console](https://console.firebase.google.com) and **Create a project** (e.g. `expected-value-lab`).
2. Open **Build → Authentication → Sign-in method** and **Enable Google**.
3. Open **Build → Firestore Database → Create database**.
4. Open **Project settings → Your apps → Add app → Web** and register the app.
5. Copy the Firebase config values into a local `.env` file:

```bash
cp .env.example .env
```

Fill in the `VITE_FIREBASE_*` values from the Firebase console.

6. Under **Authentication → Settings → Authorized domains**, confirm `localhost` is listed.

### 3. Deploy Firestore rules

```bash
npm install -g firebase-tools
firebase login
firebase use <your-project-id>
firebase deploy --only firestore:rules
```

Rules allow each signed-in user to read/write only their own `users/{userId}`, `chapterProgress/{userId}_expected_value_intro`, and `milestones/{userId}_expected_value_intro` documents.

### 4. Run the app

```bash
npm run dev
```

Open `http://localhost:5173`.

## Routes

| Path | Description |
|------|-------------|
| `/login` | Google sign-in |
| `/home` | Dashboard with chapter card |
| `/chapter/expected-value-intro` | Problem list, completion %, streak, milestones |
| `/chapter/expected-value-intro/problem/:problemId` | Problem placeholder (interactive UI later) |
| `/profile` | User profile |

## Data schema (PRD)

**users/{userId}** — `userId`, `displayName`, `email`, `createdAt`, `lastLoginAt`

**chapterProgress/{userId}_expected_value_intro** — `userId`, `chapterId`, `currentProblemIndex`, `completedProblemIds`, `completionPercentage`, `masteryStatus`, `streakCount`, `lastActiveDate`, `updatedAt`

**milestones/{userId}_expected_value_intro** — `userId`, `unlockedMilestones`, `chapterCompleted`, `chapterMastered`, `updatedAt`

Mastery states: Not Started, Learning, Developing, Mastered.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint |

## Checkpoint scope

**Checkpoint 1:** React skeleton, routes, Firebase config, Google sign-in, user profile creation.

**Checkpoint 2:** Chapter path, 8-problem list, completion percentage, Continue button, mastery placeholder, streak and milestone display.

**Problem 1:** The Long-Run Average — 50/50 spinner, spin buttons, running average graph, prediction + final answer with deterministic feedback.

**Not yet included:** Problems 2–8 interactive UIs, full lesson engine, deployment.
