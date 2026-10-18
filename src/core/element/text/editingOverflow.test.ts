import { describe, expect, it } from 'vitest'
import { editingOverflowFromMetrics, unionOverflow } from './editingOverflow'

describe('editing box overflow', () => {
  it('stays flush when the glyphs sit inside the em box', () => {
    expect(
      editingOverflowFromMetrics({
        fontSize: 25,
        advanceWidth: 100,
        actualBoundingBoxLeft: 0,
        actualBoundingBoxRight: 99,
        fontBoundingBoxAscent: 19,
        fontBoundingBoxDescent: 5
      })
    ).toEqual({ left: 0, right: 0, top: 0, bottom: 0 })
  })

  it('grows to cover ascenders, descenders, and side bearings', () => {
    expect(
      editingOverflowFromMetrics({
        fontSize: 25,
        advanceWidth: 100,
        actualBoundingBoxLeft: 4.2,
        actualBoundingBoxRight: 108.1,
        fontBoundingBoxAscent: 35,
        fontBoundingBoxDescent: 12
      })
    ).toEqual({ left: 5, right: 9, top: 14, bottom: 6 })
  })

  it('ignores subpixel noise and a zero font size', () => {
    expect(
      editingOverflowFromMetrics({
        fontSize: 25,
        advanceWidth: 100,
        actualBoundingBoxLeft: 0.4,
        actualBoundingBoxRight: 100.4,
        fontBoundingBoxAscent: 19.4,
        fontBoundingBoxDescent: 5.4
      })
    ).toEqual({ left: 0, right: 0, top: 0, bottom: 0 })
    expect(
      editingOverflowFromMetrics({
        fontSize: 0,
        advanceWidth: 0,
        actualBoundingBoxLeft: 10,
        actualBoundingBoxRight: 10,
        fontBoundingBoxAscent: 10,
        fontBoundingBoxDescent: 10
      })
    ).toEqual({ left: 0, right: 0, top: 0, bottom: 0 })
  })

  it('does not widen a box that already contains a short centered line', () => {
    const lineLeft = 40
    const inkLeft = 4
    const inkRight = 80
    expect(
      editingOverflowFromMetrics({
        fontSize: 25,
        advanceWidth: 200,
        actualBoundingBoxLeft: inkLeft - lineLeft,
        actualBoundingBoxRight: lineLeft + inkRight,
        fontBoundingBoxAscent: 19,
        fontBoundingBoxDescent: 5
      })
    ).toEqual({ left: 0, right: 0, top: 0, bottom: 0 })
  })

  it('uses the largest overflow of every line', () => {
    expect(
      unionOverflow([
        { left: 1, right: 0, top: 4, bottom: 0 },
        { left: 0, right: 6, top: 2, bottom: 3 }
      ])
    ).toEqual({ left: 1, right: 6, top: 4, bottom: 3 })
  })
})
