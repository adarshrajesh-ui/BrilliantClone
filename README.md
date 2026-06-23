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

## Getting started

```bash
npm install
cp .env.example .env   # add Firebase config
firebase deploy --only firestore:rules
npm run dev
```

Open `http://localhost:5173` → sign in → **Start chapter**.

## Routes

- `/home` — dashboard
- `/chapter/expected-value-intro` — problem list & progress
- `/chapter/expected-value-intro/problem/problem-1` … `problem-8` — interactive problems

## Architecture

```
src/
  data/problems/     PRD problem JSON (1–8)
  lib/
    answerParser.ts  Normalize $, fractions, decimals
    answerChecker.ts Deterministic per-problem checking
  components/
    lesson/          ProblemLayout, FeedbackPanel, HintPanel
    visuals/         Spinner, graph, boxes, table, formula, scale, etc.
    problems/        Problem 1–8 UI components
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
