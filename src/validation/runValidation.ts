// Validation and Test Coverage — Expected Value Lab MVP
// ------------------------------------------------------
// Self-contained, deterministic validation runner for the established 8-problem
// MVP. It imports the existing (unmodified) answer parser + checker and runs the
// hand-built cases in answerValidationMatrix.ts / problemBehaviorValidation.ts.
//
// SAFE-BY-DESIGN:
//   * It only *imports* existing functions — it does not modify any app file.
//   * It has no AI / model calls and no Firebase imports.
//   * It does not edit package.json. The main agent can wire it up later via
//     either `npm run test` / `npm run validate:answers` (a Vitest wrapper, see
//     the TODO at the bottom) or a direct `tsx src/validation/runValidation.ts`.
//
// Usage today (no config changes required):
//   import { runAllValidations, formatValidationReport } from './runValidation'
//   const report = runAllValidations()
//   console.log(formatValidationReport(report))

import {
  areNumbersClose,
  areProbabilitiesEquivalent,
  normalizeClassificationAnswer,
  normalizeMoneyAnswer,
  parseProbabilityAnswer,
} from '../lib/answerParser'
import { checkProblem, isGradedAttempt } from '../lib/answerChecker'
import type { ProblemCheckInput } from '../types/problem'
import {
  allProblemCheckerCases,
  classificationAnswerCases,
  moneyAnswerCases,
  probabilityAnswerCases,
  type ValidationCase,
} from './answerValidationMatrix'
import { gradedAttemptExpectations } from './problemBehaviorValidation'

export interface ValidationFailure {
  caseId: string
  reason: string
}

export interface ValidationReport {
  passed: number
  failed: ValidationFailure[]
  total: number
}

function record(
  report: ValidationReport,
  ok: boolean,
  caseId: string,
  reason: () => string,
): void {
  report.total += 1
  if (ok) {
    report.passed += 1
  } else {
    report.failed.push({ caseId, reason: reason() })
  }
}

function runMoneyCases(report: ValidationReport): void {
  for (const c of moneyAnswerCases) {
    const parsed = normalizeMoneyAnswer(c.input)
    const ok = c.expectedCorrect
      ? parsed !== null && areNumbersClose(parsed, Number(c.expectedNormalized), 0.0001)
      : parsed === null
    record(report, ok, c.id, () => `money "${String(c.input)}" -> ${String(parsed)}, expected ${c.expectedCorrect ? String(c.expectedNormalized) : 'null'}`)
  }
}

function runProbabilityCases(report: ValidationReport): void {
  for (const c of probabilityAnswerCases) {
    const ok = c.expectedCorrect
      ? areProbabilitiesEquivalent(c.input, Number(c.expectedNormalized))
      : parseProbabilityAnswer(c.input) === null
    record(report, ok, c.id, () => `probability "${String(c.input)}" -> ${String(parseProbabilityAnswer(c.input))}, expected ${c.expectedCorrect ? `~${String(c.expectedNormalized)}` : 'null'}`)
  }
}

function runClassificationCases(report: ValidationReport): void {
  for (const c of classificationAnswerCases) {
    const got = normalizeClassificationAnswer(c.input)
    const ok = c.expectedCorrect ? got === c.expectedNormalized : got === null
    record(report, ok, c.id, () => `classification "${String(c.input)}" -> ${String(got)}, expected ${c.expectedCorrect ? String(c.expectedNormalized) : 'null'}`)
  }
}

function runCheckerCase(report: ValidationReport, c: ValidationCase): void {
  const result = checkProblem(c.problemId, c.input as ProblemCheckInput)

  // 1. completion expectation
  record(
    report,
    result.canComplete === c.expectedCorrect,
    c.id,
    () => `${c.problemId} canComplete=${String(result.canComplete)}, expected ${String(c.expectedCorrect)} (${c.description})`,
  )

  // 2. mistakeType expectation (when asserted)
  if (c.expectedMistakeType !== undefined) {
    record(
      report,
      result.mistakeType === c.expectedMistakeType,
      `${c.id}:mistakeType`,
      () => `${c.problemId} mistakeType="${String(result.mistakeType)}", expected "${c.expectedMistakeType}"`,
    )

    // 3. attempt-counting policy implied by the mistakeType
    if (c.expectedMistakeType === '') {
      // Guard result: must NOT be a graded attempt.
      record(
        report,
        isGradedAttempt(result) === false,
        `${c.id}:guard-not-graded`,
        () => `${c.problemId} guard incorrectly counted as a graded attempt`,
      )
    } else {
      // Graded wrong result: must count as an attempt.
      record(
        report,
        isGradedAttempt(result) === true,
        `${c.id}:wrong-graded`,
        () => `${c.problemId} graded-wrong result not counted as an attempt`,
      )
    }
  } else if (c.expectedCorrect) {
    // Correct answers are graded attempts too.
    record(
      report,
      isGradedAttempt(result) === true,
      `${c.id}:correct-graded`,
      () => `${c.problemId} correct result not counted as a graded attempt`,
    )
  }
}

function runGradedAttemptCases(report: ValidationReport): void {
  for (const e of gradedAttemptExpectations) {
    record(
      report,
      isGradedAttempt(e.result) === e.expectedGraded,
      e.id,
      () => `isGradedAttempt(${e.description}) = ${String(isGradedAttempt(e.result))}, expected ${String(e.expectedGraded)}`,
    )
  }
}

/** Runs every deterministic validation case and returns a structured report. */
export function runAllValidations(): ValidationReport {
  const report: ValidationReport = { passed: 0, failed: [], total: 0 }
  runMoneyCases(report)
  runProbabilityCases(report)
  runClassificationCases(report)
  for (const c of allProblemCheckerCases) {
    runCheckerCase(report, c)
  }
  runGradedAttemptCases(report)
  return report
}

/** Renders a human-readable report string. */
export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = []
  lines.push('Expected Value Lab — Validation Report')
  lines.push('======================================')
  lines.push(`Checks passed: ${report.passed}/${report.total}`)
  if (report.failed.length === 0) {
    lines.push('All deterministic validation checks passed.')
  } else {
    lines.push(`Failures: ${report.failed.length}`)
    for (const f of report.failed) {
      lines.push(`  ✗ [${f.caseId}] ${f.reason}`)
    }
  }
  return lines.join('\n')
}

function main(): void {
  const report = runAllValidations()
  // console is available in both browser and Node runtimes.
  console.log(formatValidationReport(report))
  const proc = (globalThis as { process?: { exitCode?: number } }).process
  if (proc) {
    proc.exitCode = report.failed.length > 0 ? 1 : 0
  }
}

// Auto-run only when executed directly (e.g. `tsx src/validation/runValidation.ts`).
// We detect this without depending on @types/node so the file type-checks under
// the app's tsconfig (types: ["vite/client"]).
const runtimeArgv = (globalThis as { process?: { argv?: string[] } }).process?.argv
if (Array.isArray(runtimeArgv) && runtimeArgv.some((arg) => arg.includes('runValidation'))) {
  main()
}

// ---------------------------------------------------------------------------
// TODO (for the main agent — no config changes were made here):
//
// Option A — Vitest (preferred; `npm run test` and `npm run validate:answers`
// already run `vitest run`). Create a NEW test file, e.g.
// `src/validation/runValidation.test.ts`, with:
//
//   import { describe, expect, it } from 'vitest'
//   import { runAllValidations } from './runValidation'
//   describe('PRD validation matrix', () => {
//     it('passes every deterministic case', () => {
//       const report = runAllValidations()
//       expect(report.failed).toEqual([])
//     })
//   })
//
// Option B — standalone script (requires a dev dependency such as `tsx`):
//   npx tsx src/validation/runValidation.ts
//   This prints the report and exits nonzero on failure.
// ---------------------------------------------------------------------------
