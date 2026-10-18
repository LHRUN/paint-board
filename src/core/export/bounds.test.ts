import { describe, expect, it } from 'vitest'
import {
  boundsAroundInk,
  chooseExportMultiplier,
  contentBounds,
  intersectVisibleCanvas,
  opaqueBounds,
  shadowPadding,
  type MeasurableObject
} from './bounds'

const object = (
  rect: { left: number; top: number; width: number; height: number },
  extra: Partial<MeasurableObject> = {}
): MeasurableObject => ({
  visible: true,
  type: 'rect',
  strokeWidth: 0,
  shadow: null,
  getBoundingRect: () => rect,
  getObjectScaling: () => ({ scaleX: 1, scaleY: 1 }),
  ...extra
})

describe('visible canvas intersection', () => {
  it('keeps the whole canvas when it fits in the window', () => {
    expect(intersectVisibleCanvas(800, 600, 1200, 900)).toEqual({
      left: 0,
      top: 0,
      width: 800,
      height: 600
    })
  })

  it('keeps the whole canvas when it matches the window', () => {
    expect(intersectVisibleCanvas(1000, 800, 1000, 800)).toEqual({
      left: 0,
      top: 0,
      width: 1000,
      height: 800
    })
  })

  it('crops to the centered window when the canvas is larger', () => {
    expect(intersectVisibleCanvas(2000, 1000, 1000, 800)).toEqual({
      left: 500,
      top: 100,
      width: 1000,
      height: 800
    })
  })
})

describe('content bounds', () => {
  it('expands a shadow using Fabric padding in canvas pixels', () => {
    expect(
      shadowPadding({ offsetX: 10, offsetY: 4, blur: 2 }, 2, 3, 2)
    ).toEqual({
      x: 2 * Math.round(12) * 2 * 2,
      y: 2 * Math.round(6) * 3 * 2
    })
  })

  it('ignores viewport zoom for a non-scaling shadow scale', () => {
    expect(
      shadowPadding({ offsetX: 5, blur: 0, nonScaling: true }, 4, 4, 2)
    ).toEqual({
      x: 2 * 5 * 1 * 2,
      y: 0
    })
  })

  it('unions objects and includes child shadow outside the group box', () => {
    const child = object(
      { left: 0, top: 0, width: 10, height: 10 },
      {
        type: 'path',
        shadow: { offsetX: 10, offsetY: 0, blur: 0 },
        getObjectScaling: () => ({ scaleX: 2, scaleY: 2 })
      }
    )
    const group = object(
      { left: 5, top: 5, width: 20, height: 20 },
      {
        type: 'group',
        getObjects: () => [child]
      }
    )

    expect(contentBounds([group], 1)).toEqual({
      left: 5 - 44,
      top: 1,
      width: 20 + 88,
      height: 20 + 8
    })
  })

  it('skips hidden objects and returns null when nothing is visible', () => {
    expect(
      contentBounds(
        [
          object({ left: 0, top: 0, width: 10, height: 10 }, { visible: false })
        ],
        1
      )
    ).toBeNull()
  })

  it('measures a selected object in canvas pixels instead of group coordinates', () => {
    const grouped = object(
      { left: -80, top: -20, width: 10, height: 10 },
      {
        calcACoords: () => ({
          tl: { x: 195, y: 75 },
          tr: { x: 205, y: 75 },
          bl: { x: 195, y: 85 },
          br: { x: 205, y: 85 }
        }),
        calcTransformMatrix: () => [2, 0, 0, 2, 200, 80],
        _getTransformedDimensions: () => ({ x: 10, y: 10 })
      }
    )

    expect(contentBounds([grouped], 1, [1, 0, 0, 1, 0, 0])).toEqual({
      left: 191,
      top: 71,
      width: 18,
      height: 18
    })
  })

  it('keeps a scaled-down object at the size already baked into its corners', () => {
    const scaled = object(
      { left: 0, top: 0, width: 40, height: 40 },
      {
        calcACoords: () => ({
          tl: { x: 90, y: 90 },
          tr: { x: 110, y: 90 },
          bl: { x: 90, y: 110 },
          br: { x: 110, y: 110 }
        }),
        calcTransformMatrix: () => [0.5, 0, 0, 0.5, 100, 100],
        _getTransformedDimensions: () => ({ x: 20, y: 20 })
      }
    )

    expect(contentBounds([scaled], 1, [1, 0, 0, 1, 0, 0])).toEqual({
      left: 86,
      top: 86,
      width: 28,
      height: 28
    })
  })

  it('applies a group scale once to corners that already include child scale', () => {
    const group = object(
      { left: 0, top: 0, width: 20, height: 10 },
      {
        type: 'activeSelection',
        calcTransformMatrix: () => [2, 0, 0, 2, 100, 50]
      }
    )
    const child = object(
      { left: -10, top: -5, width: 20, height: 10 },
      {
        group,
        calcACoords: () => ({
          tl: { x: -10, y: -5 },
          tr: { x: 10, y: -5 },
          bl: { x: -10, y: 5 },
          br: { x: 10, y: 5 }
        }),
        calcTransformMatrix: () => [1, 0, 0, 1, 100, 50],
        _getTransformedDimensions: () => ({ x: 20, y: 10 })
      }
    )

    expect(contentBounds([child], 1, [2, 0, 0, 2, 10, 20])).toEqual({
      left: 166,
      top: 96,
      width: 88,
      height: 48
    })
  })
})

describe('ink framing', () => {
  it('finds the opaque pixel rectangle', () => {
    const alpha = new Uint8ClampedArray(4 * 4 * 4)
    alpha[(1 * 4 + 2) * 4 + 3] = 255
    expect(opaqueBounds(alpha, 4, 4)).toEqual({
      left: 2,
      top: 1,
      width: 1,
      height: 1
    })
  })

  it('adds an even margin around the painted pixels', () => {
    expect(
      boundsAroundInk(
        { left: 10, top: 20, width: 100, height: 80 },
        { left: 5, top: 8, width: 20, height: 10 },
        2,
        16
      )
    ).toEqual({
      left: -3.5,
      top: 8,
      width: 42,
      height: 37
    })
  })
})

describe('export size limit', () => {
  it('keeps the retina multiplier when the result fits', () => {
    expect(chooseExportMultiplier(1000, 800, 2)).toBe(2)
  })

  it('falls back to 1x when only the retina image is too large', () => {
    expect(chooseExportMultiplier(9000, 4000, 2)).toBe(1)
  })

  it('rejects an image that is still too large at 1x', () => {
    expect(chooseExportMultiplier(20000, 20000, 2)).toBeNull()
  })
})
