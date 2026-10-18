import { describe, expect, it } from 'vitest'
import { beginCanvasPan, endCanvasPan } from './canvasPan'

const canvas = () => ({ skipTargetFind: false })

describe('canvas pan hit testing', () => {
  it('skips hit testing while any pan is active', () => {
    const board = canvas()
    beginCanvasPan(board)
    beginCanvasPan(board)
    expect(board.skipTargetFind).toBe(true)
    endCanvasPan(board)
    expect(board.skipTargetFind).toBe(true)
    endCanvasPan(board)
    expect(board.skipTargetFind).toBe(false)
  })

  it('does not let an extra end turn hit testing back on', () => {
    const board = canvas()
    endCanvasPan(board)
    beginCanvasPan(board)
    expect(board.skipTargetFind).toBe(true)
    endCanvasPan(board)
    expect(board.skipTargetFind).toBe(false)
  })
})
