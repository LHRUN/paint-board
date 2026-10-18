import { describe, expect, it } from 'vitest'
import { shouldRecordObjectModified } from './recordObject'

describe('shouldRecordObjectModified', () => {
  it('records moving a text object when the text did not change', () => {
    expect(
      shouldRecordObjectModified({
        action: 'drag',
        target: { type: 'i-text', text: 'Hello', _textBeforeEdit: 'Hello' }
      })
    ).toBe(true)
  })

  it('records a later drag even if the pre-edit text is still different', () => {
    expect(
      shouldRecordObjectModified({
        action: 'drag',
        target: { type: 'i-text', text: 'Hello!', _textBeforeEdit: 'Hello' }
      })
    ).toBe(true)
  })

  it('skips text content edits because they have no transform action', () => {
    expect(
      shouldRecordObjectModified({
        target: { type: 'i-text', text: 'Hello!', _textBeforeEdit: 'Hello' }
      })
    ).toBe(false)
  })

  it('records ordinary object transforms', () => {
    expect(
      shouldRecordObjectModified({
        action: 'scale',
        target: { type: 'rect' }
      })
    ).toBe(true)
  })

  it('ignores events without an action', () => {
    expect(
      shouldRecordObjectModified({
        target: { type: 'rect' }
      })
    ).toBe(false)
  })
})
