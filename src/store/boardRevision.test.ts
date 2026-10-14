import { describe, expect, it } from 'vitest'
import {
  boardDataChanged,
  contentRevisionOf,
  nextContentRevision
} from './boardRevision'

describe('board content revision', () => {
  it('ignores key order and equal documents', () => {
    expect(
      boardDataChanged(
        { objects: [], version: '5.3.0' },
        { version: '5.3.0', objects: [] }
      )
    ).toBe(false)
    expect(boardDataChanged(undefined, {})).toBe(false)
  })

  it('detects object changes', () => {
    expect(
      boardDataChanged({ objects: [] }, { objects: [{ type: 'path' }] })
    ).toBe(true)
  })

  it('keeps a missing revision at zero until the content changes', () => {
    expect(contentRevisionOf(undefined)).toBe(0)
    expect(nextContentRevision(undefined, false)).toBe(0)
    expect(nextContentRevision(undefined, true)).toBe(1)
    expect(nextContentRevision(2, true)).toBe(3)
  })
})
