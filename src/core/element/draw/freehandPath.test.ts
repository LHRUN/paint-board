import { describe, expect, it } from 'vitest'
import {
  buildFreehandPath,
  clampPenPressure,
  freehandStrokeOptions,
  isFarEnough,
  outlineStroke,
  outlineToSvgPath,
  readPenPressure,
  type FreehandSettings
} from './freehandPath'

const settings: FreehandSettings = {
  size: 10,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  startTaper: 0,
  endTaper: 20
}

describe('freehand stroke options', () => {
  it('scales size and taper with zoom and marks an in-progress stroke', () => {
    expect(freehandStrokeOptions(settings, 2, false, true)).toMatchObject({
      size: 5,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.5,
      simulatePressure: true,
      last: false,
      start: { cap: true, taper: 0 },
      end: { cap: true, taper: 10 }
    })
  })

  it('closes the outline when the stroke is finished', () => {
    const svg = buildFreehandPath(
      [
        [0, 0],
        [20, 8],
        [40, 12],
        [70, 40],
        [90, 28]
      ],
      settings,
      1,
      true,
      true
    )

    expect(svg.startsWith('M')).toBe(true)
    expect(svg.trimEnd().endsWith('Z')).toBe(true)
  })

  it('keeps a short outline instead of dropping it', () => {
    expect(
      outlineToSvgPath([
        [0, 0],
        [2, 0],
        [1, 1]
      ])
    ).toBe('M0.00,0.00 L2.00,0.00 L1.00,1.00 Z')
  })
})

describe('freehand input', () => {
  it('uses pen pressure and ignores a mouse placeholder', () => {
    expect(readPenPressure({ pointerType: 'pen', pressure: 0.8 })).toBe(0.8)
    expect(readPenPressure({ pointerType: 'pen', pressure: 0 })).toBe(0.05)
    expect(readPenPressure({ pointerType: 'mouse', pressure: 0.5 })).toBe(
      undefined
    )
    expect(readPenPressure({ pointerType: 'touch', pressure: 0.4 })).toBe(
      undefined
    )
    expect(
      readPenPressure({
        changedTouches: [{ touchType: 'stylus', force: 0.3 }]
      })
    ).toBe(0.3)
    expect(clampPenPressure(2)).toBeUndefined()
  })

  it('keeps a plain pen unstroked and scales an outlined border', () => {
    expect(outlineStroke(false, 2, '#FF6363', 2)).toEqual({ strokeWidth: 0 })
    expect(outlineStroke(true, 0, '#FF6363', 1)).toEqual({ strokeWidth: 0 })
    expect(outlineStroke(true, 2, '#FF6363', 2)).toEqual({
      stroke: '#FF6363',
      strokeWidth: 1,
      strokeLineCap: 'round',
      strokeLineJoin: 'round'
    })
  })

  it('drops samples that have not moved a screen pixel', () => {
    expect(isFarEnough(undefined, { x: 1, y: 1 }, 1)).toBe(true)
    expect(isFarEnough({ x: 0, y: 0 }, { x: 0.2, y: 0.2 }, 1)).toBe(false)
    expect(isFarEnough({ x: 0, y: 0 }, { x: 2, y: 0 }, 1)).toBe(true)
  })
})
