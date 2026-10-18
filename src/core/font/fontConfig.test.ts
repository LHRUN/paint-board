import { describe, expect, it } from 'vitest'
import {
  canAddCustomFont,
  DEFAULT_FONTS,
  fontSampleText,
  nextQuickFonts,
  normalizeFontName,
  removeCustomFont,
  sanitizeFontConfig
} from './fontConfig'
import {
  collectFontFamilies,
  collectFontSamples,
  collectPlainText,
  textUsesFontFamilies
} from './collectFontFamilies'

const defaults = [...DEFAULT_FONTS]

describe('font config', () => {
  it('collapses extra spaces in a font name', () => {
    expect(normalizeFontName('  Noto   Sans SC  ')).toBe('Noto Sans SC')
  })

  it('restores defaults when storage is missing or the version is unknown', () => {
    expect(sanitizeFontConfig(undefined)).toEqual({
      customFonts: [],
      quickFonts: defaults
    })
    expect(sanitizeFontConfig({ version: 2, customFonts: ['Roboto'] })).toEqual(
      {
        customFonts: [],
        quickFonts: defaults
      }
    )
  })

  it('keeps a valid empty quick list and drops invalid custom fonts', () => {
    expect(
      sanitizeFontConfig({
        version: 1,
        customFonts: [
          'Roboto',
          'roboto',
          'Georgia',
          'Bad/Font',
          12,
          'Noto Sans SC'
        ],
        quickFonts: []
      })
    ).toEqual({
      customFonts: ['Roboto', 'Noto Sans SC'],
      quickFonts: []
    })
  })

  it('falls back when every saved quick font is unusable', () => {
    expect(
      sanitizeFontConfig({
        version: 1,
        customFonts: [],
        quickFonts: ['Roboto', '!!!']
      }).quickFonts
    ).toEqual(defaults)
  })

  it('keeps a custom font in the quick list only when it is still configured', () => {
    expect(
      sanitizeFontConfig({
        version: 1,
        customFonts: ['Roboto'],
        quickFonts: ['Georgia', 'Roboto', 'Fredoka One', 'Hanalei Fill']
      })
    ).toEqual({
      customFonts: ['Roboto'],
      quickFonts: ['Georgia', 'Roboto', 'Fredoka One']
    })
  })

  it('limits custom fonts to five', () => {
    const fonts = ['One', 'Two', 'Three', 'Four', 'Five', 'Six']
    expect(
      sanitizeFontConfig({
        version: 1,
        customFonts: fonts,
        quickFonts: defaults
      }).customFonts
    ).toEqual(['One', 'Two', 'Three', 'Four', 'Five'])
    expect(canAddCustomFont('Six', fonts.slice(0, 5))).toBe('limit')
  })

  it('rejects invalid and duplicate font names before they are added', () => {
    expect(canAddCustomFont('  ', [])).toBe('invalid')
    expect(canAddCustomFont('Roboto!', [])).toBe('invalid')
    expect(canAddCustomFont('Georgia', [])).toBe('duplicate')
    expect(canAddCustomFont('roboto', ['Roboto'])).toBe('duplicate')
    expect(canAddCustomFont(' Noto Sans SC ', [])).toBe('ok')
  })

  it('removes a custom font from the quick list without touching default fonts', () => {
    expect(
      removeCustomFont(
        { customFonts: ['Roboto'], quickFonts: ['Georgia', 'Roboto'] },
        'Roboto'
      )
    ).toEqual({
      customFonts: [],
      quickFonts: ['Georgia']
    })
    expect(
      removeCustomFont(
        { customFonts: ['Roboto'], quickFonts: ['Georgia'] },
        'Georgia'
      )
    ).toEqual({
      customFonts: ['Roboto'],
      quickFonts: ['Georgia']
    })
  })

  it('adds a quick font and moves a full list forward', () => {
    const allowed = [...defaults, 'Roboto']
    expect(nextQuickFonts(['Georgia'], 'Roboto', allowed)).toEqual({
      status: 'added',
      quickFonts: ['Georgia', 'Roboto']
    })
    expect(nextQuickFonts(defaults, 'Georgia', allowed)).toEqual({
      status: 'unchanged',
      quickFonts: defaults
    })
    expect(nextQuickFonts(defaults, 'Roboto', allowed)).toEqual({
      status: 'replaced',
      quickFonts: ['Roboto', 'Georgia', 'Fredoka One']
    })
    expect(nextQuickFonts(defaults, 'Missing', allowed)).toEqual({
      status: 'rejected',
      quickFonts: defaults
    })
  })
})

describe('collect canvas fonts', () => {
  it('collects nested and per-character fonts and skips system fonts', () => {
    expect(
      collectFontFamilies({
        objects: [
          { type: 'i-text', fontFamily: 'Georgia' },
          {
            type: 'group',
            objects: [
              {
                type: 'text',
                fontFamily: 'Lobster',
                styles: [{ style: { fontFamily: 'Roboto' } }]
              }
            ]
          },
          { fontFamily: '  Fredoka   One ' }
        ]
      })
    ).toEqual(['Lobster', 'Roboto', 'Fredoka One'])
  })

  it('caps the number of families loaded for one board', () => {
    const objects = Array.from({ length: 25 }, (_, index) => ({
      fontFamily: `Font ${index}`
    }))
    expect(collectFontFamilies({ objects })).toHaveLength(20)
  })

  it('keeps the characters each web font actually draws', () => {
    expect(fontSampleText('A你 好A\n你')).toBe('A你 好')
    expect(
      collectFontSamples({
        objects: [
          {
            type: 'i-text',
            text: 'A你好',
            fontFamily: 'Noto Sans SC',
            styles: { 0: { 0: { fontFamily: 'Roboto' } } }
          },
          { type: 'text', text: 'Georgia', fontFamily: 'Georgia' }
        ]
      })
    ).toEqual([
      { family: 'Roboto', text: 'A' },
      { family: 'Noto Sans SC', text: '你好' }
    ])
    expect(
      collectPlainText({
        type: 'group',
        _objects: [{ type: 'text', text: '你', fontFamily: 'Noto Sans SC' }]
      })
    ).toBe('你')
  })

  it('matches a font used by a single character style', () => {
    expect(
      textUsesFontFamilies(
        {
          fontFamily: 'Georgia',
          styles: { 0: { 1: { fontFamily: 'Roboto' } } }
        },
        ['Roboto']
      )
    ).toBe(true)
    expect(textUsesFontFamilies({ fontFamily: 'Georgia' }, ['Roboto'])).toBe(
      false
    )
  })
})
