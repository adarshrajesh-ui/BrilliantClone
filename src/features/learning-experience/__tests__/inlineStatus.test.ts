import { describe, expect, it } from 'vitest'
import { toInlineStatus } from '../InlineFieldStatus'

describe('toInlineStatus', () => {
  it('maps answer-checker field statuses to presentation statuses', () => {
    expect(toInlineStatus('ok')).toBe('correct')
    expect(toInlineStatus('bad')).toBe('needs-correction')
    expect(toInlineStatus('empty')).toBe('empty')
    expect(toInlineStatus(undefined)).toBe('current')
  })
})
