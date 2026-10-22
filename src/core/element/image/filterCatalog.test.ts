import { describe, expect, it } from 'vitest'
import {
  DEFAULT_QUICK_FILTERS,
  moveQuickFilter,
  QUICK_FILTER_LIMIT,
  sanitizeQuickFilters,
  stripNeutral,
  togglePreset,
  toggleQuickSelection,
  updateTypedFilter
} from './filterCatalog'

describe('quick filter preferences', () => {
  it('uses the confirmed default order', () => {
    expect(DEFAULT_QUICK_FILTERS).toEqual([
      'Sepia',
      'Invert',
      'BlackWhite',
      'Grayscale',
      'Blur',
      'Pixelate',
      'Noise',
      'Emboss',
      'Kodachrome'
    ])
    expect(DEFAULT_QUICK_FILTERS).toHaveLength(QUICK_FILTER_LIMIT)
  })

  it('drops unknown ids and keeps an explicit empty selection', () => {
    expect(sanitizeQuickFilters(['Sepia', 'nope', 'Sepia', 'Blur'])).toEqual([
      'Sepia',
      'Blur'
    ])
    expect(sanitizeQuickFilters([])).toEqual([])
    expect(sanitizeQuickFilters(null)).toEqual(DEFAULT_QUICK_FILTERS)
    expect(
      sanitizeQuickFilters(DEFAULT_QUICK_FILTERS.concat('Vintage'))
    ).toHaveLength(QUICK_FILTER_LIMIT)
  })

  it('stops at nine selected filters', () => {
    const added = toggleQuickSelection(DEFAULT_QUICK_FILTERS, 'Vintage')
    expect(added.limited).toBe(true)
    expect(added.filters).toEqual(DEFAULT_QUICK_FILTERS)
    const removed = toggleQuickSelection(DEFAULT_QUICK_FILTERS, 'Noise')
    expect(removed.filters).not.toContain('Noise')
  })

  it('reorders the selected filters', () => {
    expect(moveQuickFilter(['Sepia', 'Invert', 'Blur'], 0, 2)).toEqual([
      'Invert',
      'Blur',
      'Sepia'
    ])
  })
})

describe('filter snapshots', () => {
  it('turns a quick preset on and off without duplicating the type', () => {
    const enabled = togglePreset([], 'Brightness')
    expect(enabled).toEqual([{ type: 'Brightness', brightness: 0.6 }])
    const custom = updateTypedFilter(enabled, 'Brightness', {
      type: 'Brightness',
      brightness: 0.2
    })
    expect(togglePreset(custom, 'Brightness')).toEqual([])
    expect(togglePreset([], 'Brightness')[0].brightness).toBe(0.6)
  })

  it('treats sharpen and emboss as one convolution', () => {
    const embossed = togglePreset([], 'Emboss')
    const sharpened = togglePreset(embossed, 'Sharpen')
    expect(sharpened).toHaveLength(1)
    expect(sharpened[0].type).toBe('Convolute')
    expect(sharpened[0].matrix).toEqual([0, -1, 0, -1, 5, -1, 0, -1, 0])
    expect(togglePreset(sharpened, 'Sharpen')).toEqual([])
  })

  it('removes parameters that no longer change the image', () => {
    expect(
      stripNeutral([
        { type: 'Sepia' },
        { type: 'Brightness', brightness: 0 },
        { type: 'Gamma', gamma: [1, 1, 1] },
        { type: 'Blur', blur: 0.2 }
      ])
    ).toEqual([{ type: 'Sepia' }, { type: 'Blur', blur: 0.2 }])
  })
})
