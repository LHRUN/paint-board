import { describe, expect, it } from 'vitest'
import { diff, patch, unpatch } from 'jsondiffpatch'
import { appendHistoryStep } from './historyStep'

describe('appendHistoryStep', () => {
  it('stores a delta that patches the new canvas back to the previous one', () => {
    const previous = { objects: [{ id: 1 }] }
    const next = { objects: [{ id: 1 }, { id: 2 }] }
    const delta = diff(next, previous)
    const step = appendHistoryStep([], 0, delta)

    expect(step.changed).toBe(true)
    expect(step.index).toBe(1)
    expect(patch(structuredClone(next), step.diffs[0])).toEqual(previous)
    expect(unpatch(structuredClone(previous), step.diffs[0])).toEqual(next)
  })

  it('does not consume an undo step when nothing changed', () => {
    const diffs = [{ objects: {} }]
    const step = appendHistoryStep(diffs, 1, undefined)
    expect(step).toEqual({ diffs, index: 1, changed: false })
  })

  it('drops undone steps and keeps at most 50 deltas', () => {
    const diffs = Array.from({ length: 50 }, (_, index) => index)
    const undone = appendHistoryStep(diffs, 40, 100)
    expect(undone.diffs).toHaveLength(41)
    expect(undone.diffs.at(-1)).toBe(100)
    expect(undone.index).toBe(41)

    const limited = appendHistoryStep(diffs, 50, 100)
    expect(limited.diffs).toHaveLength(50)
    expect(limited.diffs[0]).toBe(1)
    expect(limited.diffs.at(-1)).toBe(100)
    expect(limited.index).toBe(50)
  })
})
