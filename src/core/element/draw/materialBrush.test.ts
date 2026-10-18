import { describe, expect, it } from 'vitest'
import { shouldApplyMaterialBrush } from './materialBrush'

describe('shouldApplyMaterialBrush', () => {
  const current = {
    mode: 'draw',
    drawType: 'freeStyle',
    drawStyle: 'material',
    canvasMatches: true,
    generationMatches: true
  }

  it('applies while material is still the active brush', () => {
    expect(shouldApplyMaterialBrush(current)).toBe(true)
  })

  it('does not replace a brush the user already changed', () => {
    expect(shouldApplyMaterialBrush({ ...current, drawStyle: 'basic' })).toBe(
      false
    )
    expect(shouldApplyMaterialBrush({ ...current, canvasMatches: false })).toBe(
      false
    )
  })
})
