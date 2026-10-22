import { describe, expect, it } from 'vitest'
import { eraserScreenDiameter } from './cursor'

describe('eraser cursor diameter', () => {
  it('matches the brush width when zoom and canvas size are unchanged', () => {
    expect(eraserScreenDiameter(20, 1, 800, 800)).toBe(20)
  })

  it('keeps the slider size on screen after the brush is divided by zoom', () => {
    const slider = 20
    const zoom = 2
    expect(eraserScreenDiameter(slider / zoom, zoom, 800, 800)).toBe(slider)
  })

  it('follows a canvas element that is not the same size as its logical width', () => {
    expect(eraserScreenDiameter(10, 2, 1000, 500)).toBe(10)
  })

  it('returns no diameter when the brush or zoom cannot paint', () => {
    expect(eraserScreenDiameter(0, 1, 800, 800)).toBe(0)
    expect(eraserScreenDiameter(20, 0, 800, 800)).toBe(0)
    expect(eraserScreenDiameter(-4, 1, 800, 800)).toBe(0)
  })
})
