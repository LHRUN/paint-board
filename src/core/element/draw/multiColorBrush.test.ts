import { describe, expect, it } from 'vitest'
import { shouldApplyMultiColorBrush } from './multiColorBrush'

describe('shouldApplyMultiColorBrush', () => {
  it('rebuilds only while drawing', () => {
    expect(shouldApplyMultiColorBrush('draw')).toBe(true)
  })

  it('leaves select, erase, and board mode on their current brush', () => {
    expect(shouldApplyMultiColorBrush('select')).toBe(false)
    expect(shouldApplyMultiColorBrush('erase')).toBe(false)
    expect(shouldApplyMultiColorBrush('board')).toBe(false)
  })
})
