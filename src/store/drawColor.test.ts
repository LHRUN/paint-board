import { describe, expect, it } from 'vitest'
import { reindexDrawColorSelection } from './drawColor'

describe('reindexDrawColorSelection', () => {
  it('shifts later multi-color indexes when an earlier color is deleted', () => {
    const next = reindexDrawColorSelection(['A', 'B', 'C'], 0, 2, [1, 2])
    expect(next).toEqual({
      drawColors: ['B', 'C'],
      currentDrawColor: 1,
      currentMultiColor: [0, 1]
    })
  })

  it('drops the deleted index and keeps the remaining selection', () => {
    const next = reindexDrawColorSelection(['A', 'B', 'C'], 1, 0, [1, 2])
    expect(next).toEqual({
      drawColors: ['A', 'C'],
      currentDrawColor: 0,
      currentMultiColor: [1]
    })
  })

  it('falls back to the first color when the only selected multi-color is deleted', () => {
    const next = reindexDrawColorSelection(['A', 'B'], 1, 1, [1])
    expect(next).toEqual({
      drawColors: ['A'],
      currentDrawColor: 0,
      currentMultiColor: [0]
    })
  })

  it('refuses to delete the last remaining color', () => {
    expect(reindexDrawColorSelection(['A'], 0, 0, [0])).toBeNull()
  })
})
