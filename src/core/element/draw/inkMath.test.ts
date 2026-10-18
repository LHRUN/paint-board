import { describe, expect, it } from 'vitest'
import {
  inkBristleCount,
  inkBristleOffset,
  inkShouldSplash,
  inkSplashCount,
  inkStrokeWidth
} from './inkMath'

describe('ink brush', () => {
  it('grows a bundle of about 26 bristles at width 30', () => {
    expect(inkBristleCount(30)).toBe(26)
    expect(inkBristleCount(10)).toBe(22)
  })

  it('keeps slow strokes thick and thins fast strokes', () => {
    expect(inkStrokeWidth(30, 10)).toBe(6)
    expect(inkStrokeWidth(30, 40)).toBeCloseTo(30 * (7 / 41))
  })

  it('splashes only after a long step', () => {
    expect(inkShouldSplash(30)).toBe(false)
    expect(inkShouldSplash(30.1)).toBe(true)
    expect(inkSplashCount(() => 0.5)).toBe(6)
  })

  it('places a bristle inside the tip range', () => {
    const offset = inkBristleOffset(13, () => 0.25)
    expect(Math.hypot(offset.x, offset.y)).toBeLessThanOrEqual(13)
  })
})
