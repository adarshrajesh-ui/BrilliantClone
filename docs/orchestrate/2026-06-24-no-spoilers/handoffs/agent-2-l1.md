## Summary

Implemented T-002 for Lesson 1 no-spoiler cleanup. The visible input placeholders in both scoped components were already neutral, and I removed answer-bearing target values from pre-answer screen-reader live text while preserving the visual graph target lines, input behavior, demos, and completion messages.

## Files Changed

- `src/components/problems/Problem1LongRunAverage.tsx`
  - Removed the spoken `(target 7)` answer from the pre-answer live region.
- `src/components/problems/EvL1P2UnequalSpinner.tsx`
  - Removed the spoken `(target $5)` answer from the pre-answer live message.

## Verification

- `npm run build` passed.
- `npm test` passed: 35 test files, 645 tests.

## Blockers

- None.
