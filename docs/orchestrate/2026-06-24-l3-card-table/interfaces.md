# Interfaces — Lesson 3 Card Table (binding contract)

Everything here is **binding**. Phase-1 agents must implement these exact
signatures/exports; Phase-2 agents must consume them exactly. No deviations
without updating this file first.

---

## 1. Card data model — `src/data/cards/` (agent-1-data)

Create `src/data/cards/deck.ts` and `src/data/cards/index.ts`
(`export * from './deck'`). Also `src/data/cards/deck.test.ts`.

```ts
export type CardRank =
  | 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K'
export type CardSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs'

export interface Card {
  rank: CardRank
  suit: CardSuit
  /** EV value: A=1, 2..10 = number, J/Q/K = 10. */
  value: number
}

export interface ValueGroup {
  /** 1..10. The 10-group folds 10, J, Q, K together. */
  value: number
  /** number of cards with this value in the source set. */
  count: number
  /** distinct ranks folded into this value group, in rank order. */
  ranks: CardRank[]
  /** count / sourceSize. */
  probability: number
  /** value * probability. */
  contribution: number
}

/** A=1, 2..10 numeric, J/Q/K = 10. */
export function cardValue(rank: CardRank): number

export function makeCard(rank: CardRank, suit: CardSuit): Card

/** Standard ordered 52-card deck (4 suits × 13 ranks). */
export const FULL_DECK: Card[]

/**
 * Group a card set by EV value (ascending, 1..10). Each group's probability is
 * count / cards.length and contribution is value * probability. Groups with
 * count 0 are omitted.
 */
export function buildValueGroups(cards: Card[]): ValueGroup[]

/** Sum of card values. */
export function totalValue(cards: Card[]): number

/** totalValue(cards) / cards.length. */
export function expectedValue(cards: Card[]): number
```

### Fixed datasets (PIN these exactly)

```ts
// L3 P1 — full 52-card deck
export const FULL_DECK_GROUPS: ValueGroup[]   // buildValueGroups(FULL_DECK)
export const FULL_DECK_TOTAL: number          // 340
export const FULL_DECK_EV: number             // 340 / 52  (= 6.538461538461538)

// L3 P2 — 8-card dealt hand
export const DEALT_HAND_L3P2: Card[]          // 8 cards (see below)
export const DEALT_HAND_L3P2_GROUPS: ValueGroup[]
export const DEALT_HAND_L3P2_EV: number       // 6.5

// L3 P3 — 10-card mini deck
export const MINI_DECK_L3P3: Card[]           // 10 cards (see below)
export const MINI_DECK_L3P3_GROUPS: ValueGroup[]
export const MINI_DECK_L3P3_EV: number        // 6.4
```

**FULL_DECK value groups (52 cards):**

| value | count | contribution = value×count/52 |
|---|---|---|
| 1 (A) | 4 | 4/52 |
| 2 | 4 | 8/52 |
| 3 | 4 | 12/52 |
| 4 | 4 | 16/52 |
| 5 | 4 | 20/52 |
| 6 | 4 | 24/52 |
| 7 | 4 | 28/52 |
| 8 | 4 | 32/52 |
| 9 | 4 | 36/52 |
| 10 (10,J,Q,K) | **16** | 160/52 |

Total = 340. EV = 340/52 = 85/13 ≈ 6.5385.

**DEALT_HAND_L3P2 — 8 cards** (deterministic, in this order):
`10♠, J♥, Q♣, K♦` (value 10 ×4), `4♠, 4♥` (value 4 ×2), `2♣, 2♦` (value 2 ×2).

| value | count | prob | contribution |
|---|---|---|---|
| 10 | 4 | 4/8 = 1/2 | 5.0 |
| 4 | 2 | 2/8 = 1/4 | 1.0 |
| 2 | 2 | 2/8 = 1/4 | 0.5 |

EV = 5.0 + 1.0 + 0.5 = **6.5**. (groups returned ascending: value 2, 4, 10)

**MINI_DECK_L3P3 — 10 cards** (deterministic, in this order):
`A♠, A♥, A♣` (value 1 ×3), `7♠, 7♥, 7♦` (value 7 ×3),
`10♠, J♥, Q♣, K♦` (value 10 ×4).

| value | count | prob | contribution |
|---|---|---|---|
| 1 (A) | 3 | 3/10 | 0.3 |
| 7 | 3 | 3/10 | 2.1 |
| 10 | 4 | 4/10 | 4.0 |

EV = 0.3 + 2.1 + 4.0 = **6.4**. (groups returned ascending: value 1, 7, 10)

`deck.test.ts` must assert: FULL_DECK length 52; FULL_DECK_TOTAL 340;
FULL_DECK_EV ≈ 6.5385; the 10-group count is 16; each dataset's EV (6.5, 6.4);
buildValueGroups sorts ascending and omits empty groups.

---

## 2. 3D card visual library — `src/components/visuals/cards/` (agent-2-visuals)

Create a single shared stylesheet `cards.css` and an `index.ts`
(`export * from './...'`). All components are presentation-only: no progression,
persistence, attempts, or answer-checking. Read reduced-motion via
`usePrefersReducedMotion` from `../../../features/learning-experience` (accept an
optional `reducedMotion` override prop). When reduced, render the FINAL grouped
state instantly (no arcs/flips); the displayed groups/counts must be identical.

Import card types from agent-1: `import type { Card, CardRank, CardSuit, ValueGroup } from '../../../data/cards'`.

### `PlayingCard.tsx`
Original card art (CSS only — no external images/assets). Suit pips/colors are
your own design; hearts/diamonds red, spades/clubs dark. Show rank corners and a
small EV-value badge when face up.

```ts
export interface PlayingCardProps {
  rank: CardRank
  suit: CardSuit
  faceUp?: boolean            // default true
  highlighted?: boolean       // emphasized (e.g. active value group)
  size?: 'sm' | 'md' | 'lg'   // default 'md'
  className?: string
  style?: React.CSSProperties // allow deal-arc transforms / animation-delay
}
export function PlayingCard(props: PlayingCardProps): JSX.Element
```

### `CardTable3D.tsx`
Isometric 3D felt table surface providing the perspective context.

```ts
export interface CardTable3DProps {
  children: React.ReactNode
  caption?: string
  className?: string
}
export function CardTable3D(props: CardTable3DProps): JSX.Element
```

### `CardDealScene.tsx` (centerpiece)
Deck lands on the table, cards deal out in isometric arcs, flip up with 3D
rotation, and group by value into columns; each group shows a count label
(`×N`) and optional contribution. Wraps `CardTable3D` internally.

```ts
export interface CardDealSceneProps {
  /** Cards to deal/visualize (may be a representative subset for 52). */
  cards: Card[]
  /** Precomputed value groups to land into (source of count labels). */
  groups: ValueGroup[]
  /** Total cards represented; defaults to cards.length. Use for the 52-deck. */
  totalCards?: number
  /** Emphasize one value group (e.g. the active table row / the 10-group). */
  highlightValue?: number | null
  /** Show per-group "×N" count labels. Default true. */
  showCounts?: boolean
  /** Show per-group contribution chips. Default false. */
  showContributions?: boolean
  caption?: string
  /** Auto-play the deal on mount. Default true. */
  autoPlay?: boolean
  /** Optional reduced-motion override (else uses the hook). */
  reducedMotion?: boolean
}
export function CardDealScene(props: CardDealSceneProps): JSX.Element
```

Notes for the 52-deck case: it is fine to deal a capped visual subset of cards
per column while the `×N` label shows the TRUE count from `groups`
(e.g. the 10-group shows a small fan with a "×16" badge). Always include an
`.sr-only` text summary of the groups and counts for accessibility.

### `EvBadge.tsx`
Final EV result badge with a pop-in animation (instant when reduced motion).

```ts
export interface EvBadgeProps {
  value: number               // e.g. 6.54
  label?: string              // default "Expected value"
  reducedMotion?: boolean
  className?: string
}
export function EvBadge(props: EvBadgeProps): JSX.Element
```

Phase-2 agents import: `import { CardDealScene, EvBadge, PlayingCard, CardTable3D } from '../visuals/cards'`.

---

## 3. Problem components (Phase 2)

Each problem follows the **`EvL3P3PrizeBagTable.tsx` pattern exactly**:
- `usePersistedProblemState<State>(storageId, DEFAULT)` + `useProblemSession(DEF, state)`.
- Loading guard returns the `loading-screen` spinner.
- Render `<ProblemLayout ... steps={steps} />` with `steps: WorkspaceStepDef[]`.
- Left visual goes inside a step's `content` (wrap in `<div className="ws-visual">`).
- Inputs reuse existing classes: `.prob-table`, `.field-label`, `.touch-input`,
  `.ev-chunk(-green/-blue/-gray)`, `.section-note`, `.btn-secondary`,
  `.touch-target`. Cell status via `numericFieldStatus` / `probabilityFieldStatus`
  from `src/lib/fieldStatus.ts` and the `cell-status cell-status-{ok|bad|empty}`
  pattern.
- Submit calls `session.handleCheck(checker(input), 'final', submitted, normalized)`.
- Each component defines its **own co-located checker** in
  `<Component>.checker.ts` exporting a `CheckInput` interface + a pure
  `check<Name>(input): CheckResult`, with a `<Component>.checker.test.ts`.
- Use the answer-parser helpers (`matchesNumeric`, `areProbabilitiesEquivalent`,
  `normalizeMoneyAnswer`, `normalizeNumericAnswer`, `matchesProbability`) from
  `src/lib/answerParser.ts` — never hand-roll parsing.

`CheckResult` shape (from `src/types/problem.ts`):
`{ isCorrect: boolean; mistakeType: string | null; feedback: string; canComplete: boolean }`.
- correct → `{ isCorrect: true, mistakeType: null, canComplete: true }`
- graded mistake → `{ isCorrect: false, mistakeType: '<type>', canComplete: false }`
- guard (not finished, e.g. empty fields) → `{ isCorrect: false, mistakeType: '', canComplete: false }`

`ProblemDefinition` (data file) shape is in `src/types/problem.ts` — keep all
required fields. **Do not change `problemId`** (must equal the storage ID).

### T-003 — L3 P1 `problem-3` → `Problem3AverageCardValue`
- `problemId: 'problem-3'`, title `Average Card Value`,
  `canonicalSlug: 'ev-l3-p1'`, problemNumber **7**, `nextProblemId="problem-4"`.
- Visual: `<CardDealScene cards={FULL_DECK} groups={FULL_DECK_GROUPS} totalCards={52} highlightValue={...} showCounts />`
  + `<EvBadge value={6.54} />` on completion.
- Steps (user task):
  1. Watch the deck deal + group summary (counts per value 1..10).
  2. Identify that J/Q/K count as 10 (a select/confirm input or tap the 10-group).
  3. Enter the count for the 10-value group → expected **16**.
  4. Complete a simplified EV expression: enter the deck total numerator → **340**
     (denominator 52 shown as given), i.e. EV = 340 / 52.
  5. Submit EV ≈ **6.54**.
- Checker `Problem3AverageCardValue.checker.ts`:
  ```ts
  export interface AverageCardValueCheckInput {
    tenCount: string       // count entered for the 10-value group
    totalValue: string     // numerator of EV expression (deck total)
    evAnswer: string
  }
  export function checkAverageCardValue(input: AverageCardValueCheckInput): CheckResult
  ```
  - Accepted EV: `85/13`, `6.54`, `6.538`, `6.5385`, `6.539`, `6.53` — accept via
    `matchesNumeric(evAnswer, [6.5385], 0.02)` OR exact fraction
    `areProbabilitiesEquivalent`/`normalizeNumericAnswer` close to 85/13.
  - tenCount must equal 16; totalValue must equal 340.
  - Mistake types (detect deterministically, return helpful feedback):
    - `face-cards-overvalued` — tenCount or total consistent with J/Q/K = 11/12/13
      (e.g. tenCount 4, or total 340 + extra). If tenCount typed as 12 → see below.
    - `ace-as-eleven` — evAnswer/total consistent with Ace=11 (total 380, EV 380/52≈7.31).
    - `forgot-four-tens` — tenCount = **12** (only J/Q/K, forgot the four 10s).
    - `wrong-denominator` — evAnswer = 340/13 or 340/4 etc. (total right, denom wrong).
    - `used-total-not-ev` — evAnswer = **340** (used total instead of /52).
    - `arithmetic-error` — fallback.
  - Empty fields → guard.

### T-004 — L3 P2 `problem-4` → `Problem4DealtHandContributions`
- `problemId: 'problem-4'`, title `Dealt-Hand Contributions`,
  `canonicalSlug: 'ev-l3-p2'`, problemNumber **8**, `nextProblemId="ev-l3-p3"`.
- Visual: `<CardDealScene cards={DEALT_HAND_L3P2} groups={DEALT_HAND_L3P2_GROUPS} showCounts />`.
- Provided table gives value | count | probability (read-only); learner fills the
  **contribution** for each of the 3 rows, then the **final EV**.
  - Rows (ascending) and expected contributions: value 2 → **0.5**, value 4 → **1.0**, value 10 → **5.0**.
  - EV = **6.5**.
- Checker `Problem4DealtHandContributions.checker.ts`:
  ```ts
  export interface DealtHandCheckInput {
    contributions: [string, string, string] // for groups in ascending value order [2,4,10]
    evAnswer: string
  }
  export function checkDealtHand(input: DealtHandCheckInput): CheckResult
  ```
  - Expected contributions `[0.5, 1.0, 5.0]`; EV accepted `6.5`, `6.50`, `$6.50`, `13/2`.
  - Mistakes: `unweighted-sum` (summed values/counts without prob, e.g. contributions = raw values or EV=16),
    `arithmetic-error`, `forgot-to-weight` (entered the raw value as contribution).
  - Empty contribution → guard.

### T-005 — L3 P3 `ev-l3-p3` → `EvL3P3MiniDeckTable`
- `problemId: 'ev-l3-p3'`, title `Mini-Deck EV Table`,
  `canonicalSlug: 'ev-l3-p3'`, problemNumber **9**, `nextProblemId="problem-5"`.
- Visual: `<CardDealScene cards={MINI_DECK_L3P3} groups={MINI_DECK_L3P3_GROUPS} showCounts highlightValue={activeRow} />`.
- Full independent table — learner fills **count, probability, contribution** for
  each of the 3 rows, then EV. (Mirror `EvL3P3PrizeBagTable.tsx` structure but with
  card data.)
  - Rows ascending [value 1, 7, 10]: counts `[3,3,4]`, probs `[3/10,3/10,4/10]`,
    contributions `[0.3, 2.1, 4.0]`, EV = **6.4**.
- Checker `EvL3P3MiniDeckTable.checker.ts`:
  ```ts
  export interface MiniDeckRow { count: string; probability: string; contribution: string }
  export interface MiniDeckCheckInput { rows: [MiniDeckRow, MiniDeckRow, MiniDeckRow]; evAnswer: string }
  export function checkMiniDeck(input: MiniDeckCheckInput): CheckResult
  ```
  - EV accepted `6.4`, `6.40`, `$6.40`, `32/5`.
  - Mistakes: `count-probability-confusion`, `wrong-denominator`,
    `arithmetic-error`, `used-total-card-value` (summed raw card values = 64 instead
    of EV per draw), `omitted-row`.
  - Any empty cell → guard.

---

## 4. Integration contract (Phase 3 — agent-6)

`src/pages/ProblemPage.tsx`: swap the three Lesson-3 imports + map entries to the
new components, keeping storage-ID keys identical:
- `'problem-3'` → `Problem3AverageCardValue`
- `'problem-4'` → `Problem4DealtHandContributions`
- `'ev-l3-p3'` → `EvL3P3MiniDeckTable`

`src/data/problems/index.ts` needs **no change** — exports `PROBLEM_3`,
`PROBLEM_4`, `EV_L3_P3` keep their names. `implementedProblems.ts` needs no change
(storage IDs unchanged).

`prd.md`: update only the Lesson-3 problem descriptions to the card theme
(titles, scenarios, EV 6.54 / 6.5 / 6.4). Leave all other lessons untouched.

## 5. Validation contract (Phase 4 — agent-7)

- `src/validation/liveCheckers.ts`: repoint `problem-3` → `checkAverageCardValue`,
  `problem-4` → `checkDealtHand`, `ev-l3-p3` → `checkMiniDeck`, importing each
  `CheckInput` from the new co-located checker files; drop the old
  `checkProblem3/checkProblem4` + `EvL3P3PrizeBagTable.checker` imports.
- `src/validation/answerValidationMatrix.ts` + `problemBehaviorValidation.ts` +
  `prdValidationChecklist.ts` + `runValidation.ts`: replace the three Lesson-3
  rows with the new card semantics/answers/mistake types above.
- Delete orphaned old files listed in plan.md (mystery-box, prize-bag, old
  Calculate-EV). Keep `isGradedAttempt` and `checkProblem6` in
  `src/lib/answerChecker.ts`. Remove now-unused `checkProblem3`/`checkProblem4`
  and their tests in `answerChecker.test.ts` **only if** all tests stay green.
- Run `npm run test`, `npm run lint`, `npm run build` — all must pass.
