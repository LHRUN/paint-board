import { describe, expect, it } from 'vitest'
import {
  activeTextColorIndexes,
  textFillColor,
  DEFAULT_TEXT_COLORS
} from './textColor'

const palette = ['#000000', '#65CC8A', '#FF6363']

describe('text color palette', () => {
  it('uses the chosen swatch for new text and falls back to black', () => {
    expect(textFillColor(palette, 1)).toBe('#65CC8A')
    expect(textFillColor(palette, 9)).toBe('#000000')
    expect(textFillColor([], 0)).toBe(DEFAULT_TEXT_COLORS[0])
  })

  it('highlights every swatch that matches one shared fill', () => {
    expect(activeTextColorIndexes(palette, ['#65CC8A', '#65cc8a'])).toEqual([1])
    expect(
      activeTextColorIndexes(['#000000', '#111111', '#000000'], ['#000000'])
    ).toEqual([0, 2])
  })

  it('highlights nothing when fills differ or the color is not listed', () => {
    expect(activeTextColorIndexes(palette, ['#000000', '#FF6363'])).toEqual([])
    expect(activeTextColorIndexes(palette, ['#123456'])).toEqual([])
    expect(activeTextColorIndexes(palette, [])).toEqual([])
  })
})
