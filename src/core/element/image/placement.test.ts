import { describe, expect, it } from 'vitest'
import {
  dropCenters,
  fitCanvasImageScale,
  imageOriginAtCenter,
  invertViewport,
  isBoardImageFile,
  scenePoint
} from './placement'

describe('board image files', () => {
  it('accepts the same jpeg and png types as the file picker', () => {
    expect(isBoardImageFile({ name: 'a.png', type: 'image/png' })).toBe(true)
    expect(isBoardImageFile({ name: 'a.jpg', type: 'image/jpeg' })).toBe(true)
    expect(isBoardImageFile({ name: 'photo.JPEG', type: '' })).toBe(true)
    expect(isBoardImageFile({ name: 'notes.txt', type: 'text/plain' })).toBe(
      false
    )
    expect(isBoardImageFile({ name: 'anim.webp', type: 'image/webp' })).toBe(
      false
    )
  })
})

describe('drop coordinates', () => {
  it('keeps a point when the canvas is unscaled and unmoved', () => {
    expect(
      scenePoint(
        120,
        80,
        { left: 20, top: 10, width: 400, height: 300 },
        { width: 400, height: 300 },
        [1, 0, 0, 1, 0, 0]
      )
    ).toEqual({ x: 100, y: 70 })
  })

  it('removes zoom and pan from the pointer', () => {
    expect(invertViewport(300, 150, [2, 0, 0, 2, 100, 50])).toEqual({
      x: 100,
      y: 50
    })
  })

  it('uses logical canvas pixels when the element is displayed at another size', () => {
    expect(
      scenePoint(
        250,
        100,
        { left: 0, top: 0, width: 500, height: 200 },
        { width: 1000, height: 400 },
        [1, 0, 0, 1, 0, 0]
      )
    ).toEqual({ x: 500, y: 200 })
  })
})

describe('image placement', () => {
  it('puts the image center on the requested point', () => {
    expect(imageOriginAtCenter({ x: 200, y: 80 }, 40, 20)).toEqual({
      left: 180,
      top: 70
    })
  })

  it('does not enlarge an image and caps it at half the canvas', () => {
    expect(fitCanvasImageScale(100, 80, 800, 600)).toBe(1)
    expect(fitCanvasImageScale(1000, 400, 800, 600)).toBe(0.4)
  })

  it('centers one image on the drop point and spreads several around it', () => {
    const origin = { x: 100, y: 50 }
    expect(dropCenters([{ width: 80, height: 40 }], origin, 10)).toEqual([
      origin
    ])

    const byStep = dropCenters(
      [
        { width: 40, height: 40 },
        { width: 40, height: 40 }
      ],
      origin,
      30
    )
    expect((byStep[0].x + byStep[1].x) / 2).toBe(origin.x)
    expect((byStep[0].y + byStep[1].y) / 2).toBe(origin.y)
    expect(byStep[1].x - byStep[0].x).toBe(30)

    const bySize = dropCenters(
      [
        { width: 200, height: 100 },
        { width: 200, height: 100 }
      ],
      origin,
      10
    )
    expect(bySize[1].x - bySize[0].x).toBe(20)
  })
})
