// Validation and Test Coverage — Expected Value Lab (active problem flow)
// ----------------------------------------------------------------------
// Self-contained, deterministic validation runner. It imports the existing
// (unmodified) answer parser and the REAL co-located checkers (via
// ./liveCheckers) and runs the hand-built cases in answerValidationMatrix.ts.
//
// SAFE-BY-DESIGN:
//   * It only *imports* existing functions — it does not modify any app file.
//   * It has no AI / model calls and no Firebase imports.
//   * The Vitest wrappers live in liveCheckerValidation.test.ts and
//     prdCoverage.test.ts, which `npm run test` / `npm run validate:answers`
//     (both `vitest run`) execute.
//
// Programmatic usage:
//   import { runAllValidations, formatValidationReport } from './runValidation'
//   console.log(formatValidationReport(runAllValidations()))

import {
  areNumbersClose,
  areProbabilitiesEquivalent,
  normalizeClassificationAnswer,
  normalizeMoneyAnswer,
  parseProbabilityAnswer,
} from '../lib/answerParser'
import { isGradedAttempt } from '../lib/answerChecker'
import {
  classificationAnswerCases,
  liveCheckerCases,
  moneyAnswerCases,
  probabilityAnswerCases,
  type LiveCheckerCase,
  type ValidationCase,
} from './answerValidationMatrix'
import { runLiveChecker } from './liveCheckers'
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

function runLiveCheckerCase(report: ValidationReport, c: LiveCheckerCase): void {
  const result = runLiveChecker(c.storageId, c.input)

  if (c.kind === 'correct') {
    record(report, result.canComplete === true, c.id, () => `${c.storageId} canComplete=${String(result.canComplete)}, expected true (${c.description})`)
    record(report, isGradedAttempt(result) === true, `${c.id}:graded`, () => `${c.storageId} correct result not counted as a graded attempt`)
    return
  }

  if (c.kind === 'guard') {
    record(report, result.canComplete === false, c.id, () => `${c.storageId} guard canComplete=${String(result.canComplete)}, expected false (${c.description})`)
    record(report, isGradedAttempt(result) === false, `${c.id}:not-graded`, () => `${c.storageId} guard incorrectly counted as a graded attempt`)
    return
  }

  // kind === 'mistake'
  record(report, result.canComplete === false, c.id, () => `${c.storageId} mistake canComplete=${String(result.canComplete)}, expected false (${c.description})`)
  record(report, result.mistakeType === c.expectedMistakeType, `${c.id}:mistakeType`, () => `${c.storageId} mistakeType="${String(result.mistakeType)}", expected "${String(c.expectedMistakeType)}"`)
  record(report, isGradedAttempt(result) === true, `${c.id}:graded`, () => `${c.storageId} graded-wrong result not counted as an attempt`)
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
  for (const c of liveCheckerCases) {
    runLiveCheckerCase(report, c)
  }
  runGradedAttemptCases(report)
  return report
}

/** Renders a human-readable report string. */
export function formatValidationReport(report: ValidationReport): string {
  const lines: string[] = []
  lines.push('Expected Value Lab — Validation Report (14-problem active flow)')
  lines.push('==========================================================')
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

// Re-export the case type for downstream consumers/tests.
export type { ValidationCase }

function main(): void {
  const report = runAllValidations()
  console.log(formatValidationReport(report))
  const proc = (globalThis as { process?: { exitCode?: number } }).process
  if (proc) {
    proc.exitCode = report.failed.length > 0 ? 1 : 0
  }
}

// Auto-run only when executed directly (e.g. `tsx src/validation/runValidation.ts`).
const runtimeArgv = (globalThis as { process?: { argv?: string[] } }).process?.argv
if (Array.isArray(runtimeArgv) && runtimeArgv.some((arg) => arg.includes('runValidation'))) {
  main()
}
