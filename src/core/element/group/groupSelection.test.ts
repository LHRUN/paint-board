import { describe, expect, it } from 'vitest'
import { canGroupActiveObjects, groupInsertIndex } from './groupSelection'

describe('group selection', () => {
  it('offers grouping only for two or more objects', () => {
    expect(canGroupActiveObjects(0)).toBe(false)
    expect(canGroupActiveObjects(1)).toBe(false)
    expect(canGroupActiveObjects(2)).toBe(true)
    expect(canGroupActiveObjects(4)).toBe(true)
  })

  it('keeps the front-most selected slot after members leave the stack', () => {
    expect(groupInsertIndex([1, 3])).toBe(2)
    expect(groupInsertIndex([0, 1])).toBe(0)
    expect(groupInsertIndex([2, 4])).toBe(3)
    expect(groupInsertIndex([1])).toBeNull()
    expect(groupInsertIndex([-1, 2])).toBeNull()
    expect(groupInsertIndex([2, 2])).toBeNull()
  })
})
