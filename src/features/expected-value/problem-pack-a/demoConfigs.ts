// Pre-problem mini-demo configs and current-task configs for Problem Pack A.
//
// Demos never count as an attempt/hint/completed action (countsAsAttempt:false).
// The first visit shows the full demo; repeated interaction types may use a
// shorter recap (the renderer decides based on interactionType seen-state).

import type { CanonicalSlug, CurrentTaskConfig, DemoConfig } from './types'

export const problemPackADemoConfigs: Record<CanonicalSlug, DemoConfig> = {
  'l1-long-run-average': {
    problemSlug: 'l1-long-run-average',
    interactionType: 'simulate-and-predict',
    countsAsAttempt: false,
    steps: [
      { id: 's1', title: 'Two equal sections', body: 'The spinner is split 50/50: half wins $10, half wins $0. Equal section size means both outcomes are equally likely.', highlight: 'spinner' },
      { id: 's2', title: 'The spin buttons', body: 'Spin Once does one spin; Spin 10 and Spin 100 run a batch so you can gather many results quickly.', highlight: 'spin-buttons' },
      { id: 's3', title: 'The counters', body: 'Watch total winnings, the number of spins, and the average per spin update as you go.', highlight: 'stats' },
      { id: 's4', title: 'The running-average graph', body: 'The line shows how the average per spin changes over time and where it tends to settle.', highlight: 'graph' },
    ],
    closingPrompt: 'Predict where the average settles, then run at least 100 spins.',
  },
  'l1-unequal-spinner': {
    problemSlug: 'l1-unequal-spinner',
    interactionType: 'simulate-and-predict',
    countsAsAttempt: false,
    steps: [
      { id: 's1', title: 'A small $20 slice', body: 'One quarter of the spinner pays $20. That quarter is its probability — 25%.', highlight: 'segment-20' },
      { id: 's2', title: 'A large $0 slice', body: 'Three quarters of the spinner pay $0, so $0 happens 75% of the time.', highlight: 'segment-0' },
      { id: 's3', title: 'Section size is probability', body: 'A bigger slice means a more likely outcome. Bigger payouts do not always mean bigger averages.', highlight: 'spinner' },
      { id: 's4', title: 'Where will it settle?', body: 'Use the running-average graph to see where the average lands after many spins.', highlight: 'graph' },
    ],
    closingPrompt: 'Predict the average, then run at least 100 spins to check it.',
  },
  'l1-short-run-vs-long-run': {
    problemSlug: 'l1-short-run-vs-long-run',
    interactionType: 'compare-simulations',
    countsAsAttempt: false,
    steps: [
      { id: 's1', title: 'Same game, two samples', body: 'Both panels use the same 50/50 $10-or-$0 game. Only the number of spins differs.', highlight: 'panels' },
      { id: 's2', title: 'Count the trials', body: 'One panel runs 10 spins; the other runs 500 spins.', highlight: 'panel-counts' },
      { id: 's3', title: 'Short samples jump', body: 'A 10-spin run can land far from $5 just by chance.', highlight: 'short-graph' },
      { id: 's4', title: 'Large samples stabilize', body: 'A 500-spin run usually settles much closer to the long-run average.', highlight: 'long-graph' },
    ],
    closingPrompt: 'Run both samples, then decide which graph is stronger evidence.',
  },
  'l1-compare-spinners': {
    problemSlug: 'l1-compare-spinners',
    interactionType: 'compare-and-choose',
    countsAsAttempt: false,
    steps: [
      { id: 's1', title: 'Spinner A wins often', body: 'Spinner A pays $10 half the time — frequent but smaller wins.', highlight: 'spinner-a' },
      { id: 's2', title: 'Spinner B pays big', body: 'Spinner B pays $20 a quarter of the time — rare but larger wins.', highlight: 'spinner-b' },
      { id: 's3', title: 'Combine payout and probability', body: 'To compare fairly, weight each payout by how often it occurs.', highlight: 'compare' },
      { id: 's4', title: 'Make the call', body: 'Use the selector to choose which spinner has the higher expected value.', highlight: 'selector' },
    ],
    closingPrompt: 'Compare the weighted averages, then choose and explain your answer.',
  },
  'l2-build-weighted-average': {
    problemSlug: 'l2-build-weighted-average',
    interactionType: 'tap-to-place-formula',
    countsAsAttempt: false,
    steps: [
      { id: 's1', title: 'Dollar cards are outcomes', body: 'The $20 and $0 cards are the possible payouts.', highlight: 'outcome-cards' },
      { id: 's2', title: 'Percent cards are probabilities', body: 'The 25% and 75% cards are how often each payout occurs.', highlight: 'probability-cards' },
      { id: 's3', title: 'Tap a card, then a slot', body: 'Tap a card to select it, then tap a formula slot to place it. Tap again to replace.', highlight: 'formula' },
      { id: 's4', title: 'Every term is outcome × probability', body: 'Build EV = outcome × probability + outcome × probability.', highlight: 'formula' },
    ],
    closingPrompt: 'Place both pairs, then compute the expected value.',
  },
  'l2-match-outcomes-probabilities': {
    problemSlug: 'l2-match-outcomes-probabilities',
    interactionType: 'tap-to-match',
    countsAsAttempt: false,
    steps: [
      { id: 's1', title: 'Outcome column', body: 'The left column lists the payouts: $12, $3, and $0.', highlight: 'outcomes' },
      { id: 's2', title: 'Probability column', body: 'The right column lists the chances: 1/3, 1/2, 1/6.', highlight: 'probabilities' },
      { id: 's3', title: 'Tap to match', body: 'Tap an outcome, then tap its probability to connect them. Tap again to replace.', highlight: 'rows' },
      { id: 's4', title: 'Biggest is not always likeliest', body: 'The largest payout does not automatically get the largest probability — read the data.', highlight: 'outcomes' },
    ],
    closingPrompt: 'Match all three outcomes to their exact probabilities.',
  },
  'l2-fill-missing-formula': {
    problemSlug: 'l2-fill-missing-formula',
    interactionType: 'tap-to-fill-slots',
    countsAsAttempt: false,
    steps: [
      { id: 's1', title: 'Outcome slots', body: 'A blank before a × sign is an outcome slot — it needs a payout.', highlight: 'outcome-slot' },
      { id: 's2', title: 'Probability slots', body: 'A blank after a payout is a probability slot — it needs a chance.', highlight: 'probability-slot' },
      { id: 's3', title: 'Place a card', body: 'Select a card from the bank and tap the matching blank.', highlight: 'card-bank' },
      { id: 's4', title: 'Add the contributions', body: 'Once the slots are correct, each row gives a contribution; add them for the final EV.', highlight: 'ev-field' },
    ],
    closingPrompt: 'Fill the two blanks, then add the contributions for the final EV.',
  },
  'l2-diagnose-bad-ev-setups': {
    problemSlug: 'l2-diagnose-bad-ev-setups',
    interactionType: 'diagnose-formulas',
    countsAsAttempt: false,
    steps: [
      { id: 's1', title: 'The formula checklist', body: 'A complete EV model passes three checks.', highlight: 'checklist' },
      { id: 's2', title: 'Does each payout have a probability?', body: 'Every outcome must be multiplied by its probability.', highlight: 'check-weighting' },
      { id: 's3', title: 'Are all outcomes represented?', body: 'Every possible outcome must appear — including $0.', highlight: 'check-complete' },
      { id: 's4', title: 'Zero still counts', body: 'A $0 contribution is still part of the model because it accounts for that probability.', highlight: 'check-total' },
    ],
    closingPrompt: 'Pick the valid setup, then identify the defect in the other two.',
  },
  'l3-mystery-box-outcomes': {
    problemSlug: 'l3-mystery-box-outcomes',
    interactionType: 'reveal-and-table',
    countsAsAttempt: false,
    steps: [
      { id: 's1', title: 'Tap to reveal', body: 'Tap each of the six boxes to reveal its prize.', highlight: 'boxes' },
      { id: 's2', title: 'Matching colors', body: 'Boxes with the same payout share a color so you can group them.', highlight: 'boxes' },
      { id: 's3', title: 'Count means matching boxes', body: 'A count is how many boxes show that payout.', highlight: 'count-column' },
      { id: 's4', title: 'Probability is count ÷ 6', body: 'Probability compares the matching count with all 6 boxes.', highlight: 'probability-column' },
    ],
    closingPrompt: 'Reveal every box, then complete the count and probability for each row.',
  },
  'l3-calculate-ev-from-table': {
    problemSlug: 'l3-calculate-ev-from-table',
    interactionType: 'fill-contributions',
    countsAsAttempt: false,
    steps: [
      { id: 's1', title: 'One row at a time', body: 'Each table row is one outcome with its probability.', highlight: 'row' },
      { id: 's2', title: 'Contribution = outcome × probability', body: 'Multiply the payout by its probability to get the row contribution.', highlight: 'contribution-cell' },
      { id: 's3', title: 'Colored chunks', body: 'Each contribution is a colored chunk linked to its outcome group.', highlight: 'chunks' },
      { id: 's4', title: 'Sum the contributions', body: 'The final EV is the sum of all row contributions.', highlight: 'ev-field' },
    ],
    closingPrompt: 'Fill each contribution, then add them for the final EV.',
  },
}

export const problemPackACurrentTaskConfigs: Record<CanonicalSlug, CurrentTaskConfig> = {
  'l1-long-run-average': {
    intro: 'You are looking at a 50/50 spinner. First predict the long-run average, then gather evidence by spinning.',
    steps: [
      { id: 'predict', label: 'Submit a prediction ($0, $5, or $10)' },
      { id: 'spin', label: 'Run at least 100 total spins' },
      { id: 'identify', label: 'Identify the long-run average' },
    ],
  },
  'l1-unequal-spinner': {
    intro: 'This spinner pays $20 only a quarter of the time. Predict the average, then test it with many spins.',
    steps: [
      { id: 'predict', label: 'Predict the average' },
      { id: 'spin', label: 'Run at least 100 spins' },
      { id: 'compare', label: 'Compare the observed average with your prediction' },
      { id: 'identify', label: 'Submit the long-run average' },
    ],
  },
  'l1-short-run-vs-long-run': {
    intro: 'Two samples come from the same game. Decide which sample is stronger evidence of the long-run average.',
    steps: [
      { id: 'short', label: 'Run the 10-spin sample' },
      { id: 'short-q', label: 'Answer whether 10 spins must average $5' },
      { id: 'long', label: 'Run the 500-spin sample' },
      { id: 'graph-q', label: 'Select the stronger long-run graph' },
    ],
  },
  'l1-compare-spinners': {
    intro: 'Compare two spinners by their weighted averages, not by prize size or win frequency alone.',
    steps: [
      { id: 'choose', label: 'Choose which spinner has the higher EV' },
      { id: 'explain', label: 'Choose the explanation' },
    ],
  },
  'l2-build-weighted-average': {
    intro: 'Build the EV formula by pairing each outcome with its probability, then compute the result.',
    steps: [
      { id: 'outcomes', label: 'Place the two outcome cards' },
      { id: 'probabilities', label: 'Place the two probability cards' },
      { id: 'check-pairs', label: 'Check both outcome–probability pairs' },
      { id: 'ev', label: 'Submit the numeric EV' },
    ],
  },
  'l2-match-outcomes-probabilities': {
    intro: 'Match each payout to the probability of that exact payout. No probability card is used twice.',
    steps: [
      { id: 'match-12', label: 'Match the $12 outcome' },
      { id: 'match-3', label: 'Match the $3 outcome' },
      { id: 'match-0', label: 'Match the $0 outcome' },
    ],
  },
  'l2-fill-missing-formula': {
    intro: 'Fill the missing outcome and probability, then add the three contributions for the EV.',
    steps: [
      { id: 'outcome-slot', label: 'Fill the outcome slot (before × 0.4)' },
      { id: 'probability-slot', label: 'Fill the probability slot (after 5 ×)' },
      { id: 'ev', label: 'Submit the final EV' },
    ],
  },
  'l2-diagnose-bad-ev-setups': {
    intro: 'Decide which formula is a complete EV model, then explain what is wrong with the others.',
    steps: [
      { id: 'valid', label: 'Select the valid setup' },
      { id: 'defect-a', label: 'Identify Formula A’s defect' },
      { id: 'defect-b', label: 'Identify Formula B’s defect' },
    ],
  },
  'l3-mystery-box-outcomes': {
    intro: 'Reveal all six boxes, then turn the counts into probabilities over 6 total boxes.',
    steps: [
      { id: 'reveal', label: 'Reveal all six boxes' },
      { id: 'row-12', label: 'Complete the $12 row' },
      { id: 'row-6', label: 'Complete the $6 row' },
      { id: 'row-0', label: 'Complete the $0 row' },
      { id: 'sum', label: 'Confirm probabilities account for all six boxes' },
    ],
  },
  'l3-calculate-ev-from-table': {
    intro: 'Turn each table row into a contribution (outcome × probability), then add them for the EV.',
    steps: [
      { id: 'contrib-12', label: 'Fill the $12 contribution' },
      { id: 'contrib-6', label: 'Fill the $6 contribution' },
      { id: 'contrib-0', label: 'Fill the $0 contribution' },
      { id: 'ev', label: 'Submit the final EV' },
    ],
  },
}
