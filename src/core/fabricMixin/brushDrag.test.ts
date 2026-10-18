import { describe, expect, it } from 'vitest'
import {
  advanceBrushPress,
  beginBrushPress,
  hasBrushDrag,
  pointerClientPoint
} from './brushDrag'

describe('brush drag threshold', () => {
  const origin = { x: 10, y: 20 }

  it('keeps a click and sub-threshold jitter from starting a stroke', () => {
    expect(hasBrushDrag(origin, origin)).toBe(false)
    expect(hasBrushDrag(origin, { x: 11.9, y: 20 })).toBe(false)
    expect(hasBrushDrag(origin, { x: 11, y: 21 })).toBe(false)
  })

  it('starts once the pointer has moved 2 screen pixels', () => {
    expect(hasBrushDrag(origin, { x: 12, y: 20 })).toBe(true)
    expect(hasBrushDrag(origin, { x: 11.5, y: 21.5 })).toBe(true)
  })

  it('does not start on the press, and starts on the first move past the threshold', () => {
    const pressed = beginBrushPress({ x: 0, y: 0 }, { x: 4, y: 8 })
    const jitter = advanceBrushPress(pressed, { x: 1, y: 0 })
    expect(jitter.start).toBe(false)
    expect(jitter.state.drawing).toBe(false)
    expect(jitter.state.origin).toEqual({ x: 4, y: 8 })

    const drag = advanceBrushPress(jitter.state, { x: 3, y: 0 })
    expect(drag.start).toBe(true)
    expect(drag.state.drawing).toBe(true)
    expect(drag.state.origin).toEqual({ x: 4, y: 8 })

    expect(advanceBrushPress(drag.state, { x: 20, y: 0 }).start).toBe(false)
  })

  it('reads touch points before mouse coordinates', () => {
    expect(
      pointerClientPoint({
        clientX: 1,
        clientY: 2,
        touches: [{ clientX: 8, clientY: 9 }]
      })
    ).toEqual({ x: 8, y: 9 })
    expect(pointerClientPoint({ clientX: 3, clientY: 4 })).toEqual({
      x: 3,
      y: 4
    })
    expect(pointerClientPoint({})).toBeNull()
  })
})
