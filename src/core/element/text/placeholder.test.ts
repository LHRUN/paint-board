import { describe, expect, it } from 'vitest'
import {
  DEFAULT_TEXT_PLACEHOLDER,
  isCanvasTextObject,
  shouldDiscardUneditedText
} from './placeholder'

describe('text placeholder', () => {
  it('discards a new text box that is still the placeholder', () => {
    expect(
      shouldDiscardUneditedText({
        isNew: true,
        text: DEFAULT_TEXT_PLACEHOLDER
      })
    ).toBe(true)
  })

  it('keeps a new text box after the user types', () => {
    expect(shouldDiscardUneditedText({ isNew: true, text: 'Hello' })).toBe(
      false
    )
  })

  it('keeps stored text even when the content is the placeholder', () => {
    expect(
      shouldDiscardUneditedText({
        isNew: false,
        text: DEFAULT_TEXT_PLACEHOLDER
      })
    ).toBe(false)
  })

  it('recognizes an i-text object and ignores other shapes', () => {
    expect(isCanvasTextObject({ type: 'i-text' })).toBe(true)
    expect(isCanvasTextObject({ _customType: 'itext' })).toBe(true)
    expect(isCanvasTextObject({ type: 'rect' })).toBe(false)
    expect(isCanvasTextObject(undefined)).toBe(false)
  })
})
