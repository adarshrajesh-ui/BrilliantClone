// CANONICAL practice difficulty matrix. This file is the single source of truth
// for how every template scales across difficulty 1-5 and is mirrored verbatim
// to functions/src/difficultyMatrix.ts so the client fallback and the server
// fallback cannot drift. It has ZERO imports on purpose (self-contained types +
// pure data + pure builders) so the exact same bytes compile under both the app
// (bundler / verbatimModuleSyntax) and Cloud Functions (NodeNext) tsconfigs.
//
// Drift is guarded by difficultyMatrix.parity.test.ts, which compares the two
// files byte-for-byte. Edit THIS file, then copy it to functions/src.

export type Difficulty = 1 | 2 | 3 | 4 | 5

export type MTemplateKind =
  | 'weighted-average'
  | 'payout-vs-profit'
  | 'fairness-classification'
  | 'compare-ev'
  | 'same-ev-risk'
  | 'card-hand-ev'
  | 'card-deck-ev'
  | 'dice-ev'
  | 'profession-payout'
  | 'fair-price-to-play'

export type MAnswerInput =
  | 'expectedValue'
  | 'expectedProfit'
  | 'classification'
  | 'bestChoice'
  | 'riskChoice'

export type MCardRank =
  | 'A'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'

export type MCardSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs'

export interface MOutcome {
  label: string
  value: number
  probability: number
}

export interface MGame {
  id: string
  label: string
  outcomes: MOutcome[]
  cost?: number
}

export interface MHint {
  id: string
  label: string
  content: string
}

export interface MGivenData {
  outcomes?: MOutcome[]
  games?: MGame[]
  cost?: number
  cards?: Array<{ rank: MCardRank; suit: MCardSuit }>
  dice?: { count: number; sides: number }
}

/** The difficulty-varying body of a generated problem; merged onto a base shell. */
export interface MBody {
  title: string
  scenarioText: string
  prompt: string
  givenData: MGivenData
  answerInputs: MAnswerInput[]
  constraints: { numericTolerance: number }
  hints: MHint[]
}

const SUITS: readonly MCardSuit[] = ['spades', 'hearts', 'diamonds', 'clubs']

function clampDifficulty(value: number): Difficulty {
  return Math.max(1, Math.min(5, Math.round(value))) as Difficulty
}

function sumOutcomes(outcomes: readonly MOutcome[]): number {
  return outcomes.reduce((total, outcome) => total + outcome.value * outcome.probability, 0)
}

function pick<T>(items: readonly T[], index: number): T {
  return items[index % items.length]
}

// --- Card Hand --------------------------------------------------------------
// Difficulty grows the hand size and enriches the rank pool (Aces + face cards
// at higher levels), so the value mapping has to actually be applied.

const HAND_SIZE_BY_DIFFICULTY: Record<Difficulty, number> = { 1: 3, 2: 4, 3: 5, 4: 6, 5: 8 }

const HAND_RANK_POOL_BY_DIFFICULTY: Record<Difficulty, MCardRank[]> = {
  1: ['2', '3', '4', '5', '6'],
  2: ['2', '3', '4', '5', '6', '7', '8'],
  3: ['A', '6', '2', '8', '4', '10', '5'],
  4: ['A', '10', '3', 'J', '5', 'Q', '7', '9'],
  5: ['A', 'K', '2', 'Q', '5', 'J', '8', '10', '9', '6'],
}

function buildCardHandBody(difficulty: Difficulty, n: number, n2: number): MBody {
  const handSize = HAND_SIZE_BY_DIFFICULTY[difficulty]
  const pool = HAND_RANK_POOL_BY_DIFFICULTY[difficulty]
  const start = n % pool.length
  const cards: Array<{ rank: MCardRank; suit: MCardSuit }> = []
  for (let i = 0; i < handSize; i += 1) {
    cards.push({ rank: pool[(start + i) % pool.length], suit: SUITS[(n2 + i) % SUITS.length] })
  }
  return {
    title: 'Practice Card Hand',
    scenarioText: 'A hand of cards is dealt face-up on the table.',
    prompt: 'What is the expected value of one random card drawn from this hand?',
    givenData: { cards },
    answerInputs: ['expectedValue'],
    constraints: { numericTolerance: 0.01 },
    hints: [
      {
        id: 'hint-1',
        label: 'Where to start',
        content:
          'A random draw is equally likely to be any card, so think about the average card value (Ace = 1, 2–10 at face value, J/Q/K = 10).',
      },
      {
        id: 'hint-2',
        label: 'Finish it',
        content: 'Add up every card value, then divide by the number of cards to get the average.',
      },
    ],
  }
}

// --- Dice -------------------------------------------------------------------
// Difficulty raises the die count and (from level 3) swaps in non-six-sided
// dice. count + sides rises strictly across levels for any fixed seed.

const DICE_COUNT_BY_DIFFICULTY: Record<Difficulty, number[]> = {
  1: [1],
  2: [2],
  3: [2],
  4: [3],
  5: [4, 5],
}

const DICE_SIDES_BY_DIFFICULTY: Record<Difficulty, number[]> = {
  1: [6],
  2: [6],
  3: [8, 10],
  4: [10, 12],
  5: [12, 20],
}

function buildDiceBody(difficulty: Difficulty, n: number, n2: number): MBody {
  const count = pick(DICE_COUNT_BY_DIFFICULTY[difficulty], n)
  const sides = pick(DICE_SIDES_BY_DIFFICULTY[difficulty], n2)
  return {
    title: 'Practice Dice Roll',
    scenarioText: `You roll ${count} fair ${sides}-sided ${count === 1 ? 'die' : 'dice'}.`,
    prompt: 'What is the expected value of the sum?',
    givenData: { dice: { count, sides } },
    answerInputs: ['expectedValue'],
    constraints: { numericTolerance: 0.01 },
    hints: [
      {
        id: 'hint-1',
        label: 'Where to start',
        content: 'Every face is equally likely, so start from a single die’s average value.',
      },
      {
        id: 'hint-2',
        label: 'Finish it',
        content: 'One fair die averages (sides + 1) / 2; multiply that by the number of dice.',
      },
    ],
  }
}

// --- Deck Draw --------------------------------------------------------------
// Difficulty grows the deck from a tiny 2-value deck to the full weighted 52.
// Outcome count and probability skew both rise with level (value labels vary by
// seed, but the count + probability pattern are fixed per level).

interface DeckSpec {
  title: string
  scenarioText: string
  outcomes: MOutcome[]
  numericTolerance: number
}

function uniformDeck(values: number[]): MOutcome[] {
  const probability = 1 / values.length
  return values.map((value) => ({ label: `Value ${value}`, value, probability }))
}

function weightedDeck(parts: Array<{ value: number; probability: number }>): MOutcome[] {
  return parts.map((part) => ({ label: `Value ${part.value}`, value: part.value, probability: part.probability }))
}

function deckForDifficulty(difficulty: Difficulty, n: number): DeckSpec {
  if (difficulty === 1) {
    const valueSets = [
      [2, 10],
      [3, 9],
      [4, 8],
    ]
    const values = pick(valueSets, n)
    return {
      title: 'Practice Two-Value Deck',
      scenarioText: `A mini deck holds equal numbers of ${values[0]}-point and ${values[1]}-point cards, spread face down on the table.`,
      outcomes: uniformDeck(values),
      numericTolerance: 0.01,
    }
  }
  if (difficulty === 2) {
    const valueSets = [
      [2, 5, 10],
      [1, 4, 8],
    ]
    const v = pick(valueSets, n)
    return {
      title: 'Practice Point-Card Deck',
      scenarioText: `A custom 10-card deck holds five ${v[0]}-point cards, three ${v[1]}-point cards, and two ${v[2]}-point cards, spread face down on the table.`,
      outcomes: weightedDeck([
        { value: v[0], probability: 0.5 },
        { value: v[1], probability: 0.3 },
        { value: v[2], probability: 0.2 },
      ]),
      numericTolerance: 0.01,
    }
  }
  if (difficulty === 3) {
    const valueSets = [
      [2, 4, 6, 10],
      [1, 3, 6, 9],
    ]
    const v = pick(valueSets, n)
    return {
      title: 'Practice Four-Tier Deck',
      scenarioText: `A custom deck pays ${v[0]}, ${v[1]}, ${v[2]}, or ${v[3]} points, with the smaller values far more common, spread face down on the table.`,
      outcomes: weightedDeck([
        { value: v[0], probability: 0.4 },
        { value: v[1], probability: 0.3 },
        { value: v[2], probability: 0.2 },
        { value: v[3], probability: 0.1 },
      ]),
      numericTolerance: 0.01,
    }
  }
  if (difficulty === 4) {
    return {
      title: 'Practice No-Face Deck',
      scenarioText:
        'A 40-card deck with all face cards (J, Q, K) removed — only Aces (=1) and 2-10 at face value — is spread face down on the table.',
      outcomes: uniformDeck([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      numericTolerance: 0.01,
    }
  }
  const standard: Array<{ value: number; probability: number }> = []
  for (let value = 1; value <= 9; value += 1) {
    standard.push({ value, probability: 4 / 52 })
  }
  standard.push({ value: 10, probability: 16 / 52 })
  return {
    title: 'Practice Deck Draw',
    scenarioText:
      'A standard 52-card deck (A=1, 2-10 at face value, J/Q/K=10) is spread face down on the table.',
    outcomes: weightedDeck(standard),
    numericTolerance: 0.05,
  }
}

function buildDeckBody(difficulty: Difficulty, n: number): MBody {
  const deck = deckForDifficulty(difficulty, n)
  return {
    title: deck.title,
    scenarioText: deck.scenarioText,
    prompt: 'What is the expected value of one card you draw?',
    givenData: { outcomes: deck.outcomes },
    answerInputs: ['expectedValue'],
    constraints: { numericTolerance: deck.numericTolerance },
    hints: [
      {
        id: 'hint-1',
        label: 'Where to start',
        content:
          'Each value contributes its size times how likely you are to draw it — pair every value with its chance.',
      },
      {
        id: 'hint-2',
        label: 'Finish it',
        content:
          'Multiply each value by its probability and add every contribution to get the expected value.',
      },
    ],
  }
}

// --- Prize bag family (weighted-average / payout / fairness / fair price) ----
// One shared prize ladder: more outcomes and a wider probability spread as
// difficulty rises. Seed sets the dollar values; difficulty owns the structure.

interface PrizePart {
  valueIndex: number
  label: string
  probability: number
}

const PRIZE_RECIPE_BY_DIFFICULTY: Record<Difficulty, PrizePart[]> = {
  1: [
    { valueIndex: 3, label: 'Rare ticket', probability: 0.5 },
    { valueIndex: 0, label: 'Common ticket', probability: 0.5 },
  ],
  2: [
    { valueIndex: 3, label: 'Rare ticket', probability: 0.4 },
    { valueIndex: 0, label: 'Common ticket', probability: 0.6 },
  ],
  3: [
    { valueIndex: 3, label: 'Top prize', probability: 0.2 },
    { valueIndex: 1, label: 'Middle prize', probability: 0.3 },
    { valueIndex: 0, label: 'Small prize', probability: 0.5 },
  ],
  4: [
    { valueIndex: 3, label: 'Top prize', probability: 0.1 },
    { valueIndex: 1, label: 'Middle prize', probability: 0.4 },
    { valueIndex: 0, label: 'Small prize', probability: 0.5 },
  ],
  5: [
    { valueIndex: 3, label: 'Top prize', probability: 0.1 },
    { valueIndex: 2, label: 'High prize', probability: 0.2 },
    { valueIndex: 1, label: 'Middle prize', probability: 0.3 },
    { valueIndex: 0, label: 'Small prize', probability: 0.4 },
  ],
}

function prizeOutcomesFor(difficulty: Difficulty, n: number, n2: number): MOutcome[] {
  const prizeLow = 1 + (n % 4)
  const prizeStep = 3 + (n2 % 3)
  const ladder = [prizeLow, prizeLow + prizeStep, prizeLow + 2 * prizeStep, prizeLow + 3 * prizeStep]
  return PRIZE_RECIPE_BY_DIFFICULTY[difficulty].map((part) => ({
    label: part.label,
    value: ladder[part.valueIndex],
    probability: part.probability,
  }))
}

/**
 * Balanced fairness cost: cycle favorable / fair / unfavorable by seed so the
 * "Fair or Not?" fallback is not always favorable. Fair uses cost = payout so
 * the profit is exactly zero; the others land $2 above/below break-even.
 */
function fairnessCostFor(payout: number, n: number): number {
  const bucket = n % 3
  if (bucket === 0) {
    return payout
  }
  if (bucket === 1) {
    return payout - 2
  }
  return payout + 2
}

function buildPrizeBody(difficulty: Difficulty, n: number, n2: number): MBody {
  const outcomes = prizeOutcomesFor(difficulty, n, n2)
  const high = outcomes.reduce((max, outcome) => Math.max(max, outcome.value), 0)
  const low = outcomes.reduce((min, outcome) => Math.min(min, outcome.value), high)
  const scenarioText =
    outcomes.length <= 2
      ? `A prize bag pays $${high} on a rare ticket and $${low} otherwise.`
      : 'A prize bag holds tickets worth several different amounts; each ticket value and its chance are listed below.'
  return {
    title: 'Practice Prize Bag',
    scenarioText,
    prompt: 'What is the expected payout?',
    givenData: { outcomes },
    answerInputs: ['expectedValue'],
    constraints: { numericTolerance: 0.01 },
    hints: [
      {
        id: 'hint-1',
        label: 'Where to start',
        content: 'Each outcome contributes its value times how likely it is — set up those products.',
      },
      {
        id: 'hint-2',
        label: 'Finish it',
        content: 'Add every value times its probability; that weighted total is the expected payout.',
      },
    ],
  }
}

function buildPayoutVsProfitBody(difficulty: Difficulty, n: number, n2: number): MBody {
  const prize = buildPrizeBody(difficulty, n, n2)
  const payout = sumOutcomes(prize.givenData.outcomes ?? [])
  const cost = Math.max(1, Math.round(payout - 1))
  return {
    title: 'Practice Ticket Profit',
    scenarioText: `${prize.scenarioText} It costs $${cost} to play.`,
    prompt: 'What is the expected profit?',
    givenData: { outcomes: prize.givenData.outcomes, cost },
    answerInputs: ['expectedProfit'],
    constraints: { numericTolerance: 0.01 },
    hints: [
      {
        id: 'hint-1',
        label: 'Where to start',
        content:
          'Find the expected payout first (each payout times its probability), then remember it costs something to play.',
      },
      {
        id: 'hint-2',
        label: 'Finish it',
        content:
          'Take the weighted-average payout and subtract the cost to play; that difference is the expected profit.',
      },
    ],
  }
}

function buildFairnessBody(difficulty: Difficulty, n: number, n2: number): MBody {
  const prize = buildPrizeBody(difficulty, n, n2)
  const payout = sumOutcomes(prize.givenData.outcomes ?? [])
  const cost = fairnessCostFor(payout, n)
  return {
    title: 'Practice Fairness Sort',
    scenarioText: `${prize.scenarioText} It costs $${Math.round(cost * 100) / 100} to play.`,
    prompt: 'Is this game fair, favorable, or unfavorable for the player?',
    givenData: { outcomes: prize.givenData.outcomes, cost },
    answerInputs: ['classification'],
    constraints: { numericTolerance: 0.01 },
    hints: [
      {
        id: 'hint-1',
        label: 'Where to start',
        content: 'Compare what the player can expect to win on average against what it costs to play.',
      },
      {
        id: 'hint-2',
        label: 'Finish it',
        content:
          'Compute the expected profit (expected payout minus cost): positive is favorable, zero is fair, negative is unfavorable.',
      },
    ],
  }
}

function buildFairPriceBody(difficulty: Difficulty, n: number, n2: number): MBody {
  const prize = buildPrizeBody(difficulty, n, n2)
  const outcomes = prize.givenData.outcomes ?? []
  const high = outcomes.reduce((max, outcome) => Math.max(max, outcome.value), 0)
  const low = outcomes.reduce((min, outcome) => Math.min(min, outcome.value), high)
  return {
    title: 'Practice Fair Price',
    scenarioText:
      outcomes.length <= 2
        ? `A prize wheel pays $${high} on a rare slice and $${low} on every other slice.`
        : 'A prize wheel has several slices with different payouts, listed below with their chances.',
    prompt: 'What price to play would make this game fair?',
    givenData: { outcomes },
    answerInputs: ['expectedValue'],
    constraints: { numericTolerance: 0.01 },
    hints: [
      {
        id: 'hint-1',
        label: 'Where to start',
        content:
          'A game is fair when it costs exactly what you can expect to win back, so find the expected payout first.',
      },
      {
        id: 'hint-2',
        label: 'How to finish',
        content:
          'Add each payout times its probability; that weighted average is the break-even price that makes the expected profit zero.',
      },
    ],
  }
}

// --- Payday (profession payout) ---------------------------------------------
// Difficulty grows the number of outcomes and the probability spread. Values
// vary by seed; the outcome count + probability pattern are fixed per level.

const PAYDAY_PROBS_BY_DIFFICULTY: Record<Difficulty, number[]> = {
  1: [0.5, 0.5],
  2: [0.6, 0.4],
  3: [0.5, 0.3, 0.2],
  4: [0.5, 0.4, 0.1],
  5: [0.4, 0.3, 0.2, 0.1],
}

const PAYDAY_VALUE_SETS: Record<number, number[][]> = {
  2: [
    [120, 60],
    [200, 100],
  ],
  3: [
    [150, 90, 40],
    [260, 180, 90],
  ],
  4: [
    [300, 200, 120, 60],
    [420, 280, 160, 80],
  ],
}

const PAYDAY_LABELS = ['Best day', 'Good day', 'Slow day', 'Quiet day']

function buildPaydayBody(difficulty: Difficulty, n: number): MBody {
  const probs = PAYDAY_PROBS_BY_DIFFICULTY[difficulty]
  const values = pick(PAYDAY_VALUE_SETS[probs.length], n)
  const outcomes: MOutcome[] = probs.map((probability, index) => ({
    label: PAYDAY_LABELS[index],
    value: values[index],
    probability,
  }))
  const summary = outcomes
    .map((outcome) => `$${outcome.value} (${Math.round(outcome.probability * 100)}% chance)`)
    .join(', ')
  return {
    title: 'Practice Payday',
    scenarioText: `A day of gig work pays one of a few amounts depending on how busy it gets: ${summary}.`,
    prompt: 'What is the expected payout for the day?',
    givenData: { outcomes },
    answerInputs: ['expectedValue'],
    constraints: { numericTolerance: 0.01 },
    hints: [
      {
        id: 'hint-1',
        label: 'Where to start',
        content: 'Each result adds its payout times how likely it is — line up those products.',
      },
      {
        id: 'hint-2',
        label: 'Finish it',
        content:
          'Add every payout times its probability; that weighted total is what they can expect.',
      },
    ],
  }
}

// --- Better Game (compare EV) -----------------------------------------------
// Difficulty grows the total number of outcome cells across the two games, and
// uses misleading top prizes so the bigger jackpot is not always the better EV.

function compareGamesFor(difficulty: Difficulty): MGame[] {
  if (difficulty === 1) {
    return [
      { id: 'a', label: 'Steady Game', outcomes: [{ label: 'Every play', value: 5, probability: 1 }] },
      {
        id: 'b',
        label: 'Swingy Game',
        outcomes: [
          { label: 'Win', value: 12, probability: 0.5 },
          { label: 'Miss', value: 0, probability: 0.5 },
        ],
      },
    ]
  }
  if (difficulty === 2) {
    return [
      {
        id: 'a',
        label: 'Balanced Game',
        outcomes: [
          { label: 'High', value: 8, probability: 0.5 },
          { label: 'Low', value: 4, probability: 0.5 },
        ],
      },
      {
        id: 'b',
        label: 'Jackpot Game',
        outcomes: [
          { label: 'Jackpot', value: 20, probability: 0.2 },
          { label: 'Nothing', value: 2, probability: 0.8 },
        ],
      },
    ]
  }
  if (difficulty === 3) {
    return [
      {
        id: 'a',
        label: 'Reliable Game',
        outcomes: [
          { label: 'High', value: 7, probability: 0.5 },
          { label: 'Low', value: 5, probability: 0.5 },
        ],
      },
      {
        id: 'b',
        label: 'Longshot Game',
        outcomes: [
          { label: 'Jackpot', value: 30, probability: 0.1 },
          { label: 'Small', value: 3, probability: 0.6 },
          { label: 'Tiny', value: 1, probability: 0.3 },
        ],
      },
    ]
  }
  if (difficulty === 4) {
    return [
      {
        id: 'a',
        label: 'Even Game',
        outcomes: [
          { label: 'High', value: 9, probability: 0.3 },
          { label: 'Mid', value: 6, probability: 0.4 },
          { label: 'Low', value: 3, probability: 0.3 },
        ],
      },
      {
        id: 'b',
        label: 'Top-Heavy Game',
        outcomes: [
          { label: 'Big', value: 20, probability: 0.2 },
          { label: 'Mid', value: 5, probability: 0.4 },
          { label: 'Small', value: 2, probability: 0.4 },
        ],
      },
    ]
  }
  return [
    {
      id: 'a',
      label: 'Spread Game',
      outcomes: [
        { label: 'High', value: 10, probability: 0.3 },
        { label: 'Mid', value: 6, probability: 0.4 },
        { label: 'Low', value: 2, probability: 0.3 },
      ],
    },
    {
      id: 'b',
      label: 'Jackpot Game',
      outcomes: [
        { label: 'Jackpot', value: 25, probability: 0.1 },
        { label: 'High', value: 8, probability: 0.3 },
        { label: 'Mid', value: 4, probability: 0.4 },
        { label: 'Low', value: 2, probability: 0.2 },
      ],
    },
  ]
}

function buildCompareBody(difficulty: Difficulty): MBody {
  return {
    title: 'Practice Game Comparison',
    scenarioText: 'Two games have different outcome patterns.',
    prompt: 'Which game has the better expected value?',
    givenData: { games: compareGamesFor(difficulty) },
    answerInputs: ['bestChoice'],
    constraints: { numericTolerance: 0.01 },
    hints: [
      {
        id: 'hint-1',
        label: 'Where to start',
        content: 'A bigger top prize does not decide it — focus on each game’s long-run average.',
      },
      {
        id: 'hint-2',
        label: 'Finish it',
        content:
          'Compute each game’s weighted average (value times probability, summed) and pick the larger one.',
      },
    ],
  }
}

// --- Riskier Bet (same EV, different risk) ----------------------------------
// Both games always share the same expected value; difficulty grows the total
// outcome cells while the riskier game keeps the wider spread.

function riskGamesFor(difficulty: Difficulty): MGame[] {
  if (difficulty === 1) {
    return [
      { id: 'a', label: 'Steady Game', outcomes: [{ label: 'Every play', value: 6, probability: 1 }] },
      {
        id: 'b',
        label: 'Swingy Game',
        outcomes: [
          { label: 'Win', value: 12, probability: 0.5 },
          { label: 'Miss', value: 0, probability: 0.5 },
        ],
      },
    ]
  }
  if (difficulty === 2) {
    return [
      {
        id: 'a',
        label: 'Tight Game',
        outcomes: [
          { label: 'High', value: 7, probability: 0.5 },
          { label: 'Low', value: 5, probability: 0.5 },
        ],
      },
      {
        id: 'b',
        label: 'Wide Game',
        outcomes: [
          { label: 'High', value: 10, probability: 0.5 },
          { label: 'Low', value: 2, probability: 0.5 },
        ],
      },
    ]
  }
  if (difficulty === 3) {
    return [
      {
        id: 'a',
        label: 'Tight Game',
        outcomes: [
          { label: 'High', value: 8, probability: 0.5 },
          { label: 'Low', value: 4, probability: 0.5 },
        ],
      },
      {
        id: 'b',
        label: 'Wild Game',
        outcomes: [
          { label: 'Miss', value: 0, probability: 0.5 },
          { label: 'Mid', value: 6, probability: 0.25 },
          { label: 'Big', value: 18, probability: 0.25 },
        ],
      },
    ]
  }
  if (difficulty === 4) {
    return [
      {
        id: 'a',
        label: 'Calm Game',
        outcomes: [
          { label: 'High', value: 7, probability: 1 / 3 },
          { label: 'Mid', value: 6, probability: 1 / 3 },
          { label: 'Low', value: 5, probability: 1 / 3 },
        ],
      },
      {
        id: 'b',
        label: 'Wild Game',
        outcomes: [
          { label: 'Miss', value: 0, probability: 1 / 3 },
          { label: 'Mid', value: 6, probability: 1 / 3 },
          { label: 'Big', value: 12, probability: 1 / 3 },
        ],
      },
    ]
  }
  return [
    {
      id: 'a',
      label: 'Calm Game',
      outcomes: [
        { label: 'High', value: 8, probability: 1 / 3 },
        { label: 'Mid', value: 6, probability: 1 / 3 },
        { label: 'Low', value: 4, probability: 1 / 3 },
      ],
    },
    {
      id: 'b',
      label: 'Wild Game',
      outcomes: [
        { label: 'Miss', value: 0, probability: 0.25 },
        { label: 'Small', value: 4, probability: 0.25 },
        { label: 'Mid', value: 8, probability: 0.25 },
        { label: 'Big', value: 12, probability: 0.25 },
      ],
    },
  ]
}

function buildRiskBody(difficulty: Difficulty): MBody {
  return {
    title: 'Practice Risk Comparison',
    scenarioText: 'Two games have the same expected value but different outcome patterns.',
    prompt: 'Which game is riskier even though the expected values match?',
    givenData: { games: riskGamesFor(difficulty) },
    answerInputs: ['riskChoice'],
    constraints: { numericTolerance: 0.01 },
    hints: [
      {
        id: 'hint-1',
        label: 'Where to start',
        content: 'The expected values match, so look at how widely each game’s outcomes swing.',
      },
      {
        id: 'hint-2',
        label: 'Finish it',
        content:
          'Compare the spread between each game’s best and worst outcome; the wider spread is the riskier game.',
      },
    ],
  }
}

/**
 * Build the difficulty-varying body for any template. `n` and `n2` are two
 * independent seed-derived integers (variety within a difficulty tier). The
 * result is merged onto the generator's base shell, then finalized with the
 * deterministic feedback + answer key.
 */
export function buildPracticeBody(
  templateKind: MTemplateKind,
  rawDifficulty: number,
  n: number,
  n2: number,
): MBody {
  const difficulty = clampDifficulty(rawDifficulty)
  switch (templateKind) {
    case 'card-hand-ev':
      return buildCardHandBody(difficulty, n, n2)
    case 'dice-ev':
      return buildDiceBody(difficulty, n, n2)
    case 'card-deck-ev':
      return buildDeckBody(difficulty, n)
    case 'profession-payout':
      return buildPaydayBody(difficulty, n)
    case 'payout-vs-profit':
      return buildPayoutVsProfitBody(difficulty, n, n2)
    case 'fairness-classification':
      return buildFairnessBody(difficulty, n, n2)
    case 'fair-price-to-play':
      return buildFairPriceBody(difficulty, n, n2)
    case 'compare-ev':
      return buildCompareBody(difficulty)
    case 'same-ev-risk':
      return buildRiskBody(difficulty)
    case 'weighted-average':
    default:
      return buildPrizeBody(difficulty, n, n2)
  }
}

/**
 * A monotonic complexity score used by tests + telemetry: it strictly increases
 * with difficulty for every template, so "difficulty 5 differs structurally
 * from difficulty 2" is checkable. Card hands score by hand size, dice by
 * count + sides, comparisons by total outcome cells, and every outcome-table
 * template by outcome count plus probability skew.
 */
export function practiceComplexityScore(templateKind: MTemplateKind, givenData: MGivenData): number {
  if (templateKind === 'card-hand-ev') {
    return givenData.cards?.length ?? 0
  }
  if (templateKind === 'dice-ev') {
    return (givenData.dice?.count ?? 0) + (givenData.dice?.sides ?? 0)
  }
  if (templateKind === 'compare-ev' || templateKind === 'same-ev-risk') {
    return (givenData.games ?? []).reduce((total, game) => total + game.outcomes.length, 0)
  }
  const outcomes = givenData.outcomes ?? []
  if (outcomes.length === 0) {
    return 0
  }
  const probabilities = outcomes.map((outcome) => outcome.probability)
  const skew = Math.round((Math.max(...probabilities) - Math.min(...probabilities)) * 10)
  return outcomes.length * 10 + skew
}
