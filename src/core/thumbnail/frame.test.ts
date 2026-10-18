import { describe, expect, it } from 'vitest'
import {
  fitContentFrame,
  needsThumbnail,
  shouldRetryThumbnailMeasure
} from './frame'

describe('thumbnail frame', () => {
  it('returns nothing when the board has no elements', () => {
    expect(fitContentFrame(null)).toBeNull()
    expect(
      fitContentFrame({ left: 0, top: 0, width: 0, height: 10 })
    ).toBeNull()
  })

  it('frames the elements and ignores the rest of the canvas', () => {
    const frame = fitContentFrame({
      left: 100,
      top: 40,
      width: 200,
      height: 80
    })
    expect(frame).toMatchObject({
      left: 100,
      top: 40,
      width: 200,
      height: 80,
      scale: 1,
      outputWidth: 200,
      outputHeight: 80
    })
  })

  it('scales the long edge to 480', () => {
    const frame = fitContentFrame({
      left: -10,
      top: 0,
      width: 1920,
      height: 1080
    })
    expect(frame?.outputWidth).toBe(480)
    expect(frame?.outputHeight).toBe(270)
    expect(frame?.scale).toBeCloseTo(480 / 1920)
  })

  it('does not enlarge content that is already small', () => {
    const frame = fitContentFrame({ left: 0, top: 0, width: 120, height: 80 })
    expect(frame?.scale).toBe(1)
    expect(frame?.outputWidth).toBe(120)
    expect(frame?.outputHeight).toBe(80)
  })

  it('caches a board whose objects are all hidden or transparent', () => {
    expect(
      shouldRetryThumbnailMeasure([
        { visible: false },
        { opacity: 0 },
        { visible: false, opacity: 0 }
      ])
    ).toBe(false)
    expect(shouldRetryThumbnailMeasure([])).toBe(false)
  })

  it('retries when a visible object cannot be measured', () => {
    expect(shouldRetryThumbnailMeasure([{ visible: true, opacity: 1 }])).toBe(
      true
    )
    expect(shouldRetryThumbnailMeasure([{}])).toBe(true)
    expect(
      shouldRetryThumbnailMeasure([{ visible: false }, { opacity: 0.2 }])
    ).toBe(true)
  })

  it('reuses a thumbnail only when the revision matches', () => {
    expect(needsThumbnail(undefined, null)).toBe(true)
    expect(needsThumbnail(undefined, 0)).toBe(false)
    expect(needsThumbnail(2, 1)).toBe(true)
    expect(needsThumbnail(2, 2)).toBe(false)
  })
})
