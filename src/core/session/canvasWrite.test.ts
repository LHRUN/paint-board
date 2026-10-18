import { describe, expect, it } from 'vitest'
import {
  canWriteFile,
  isCurrentCanvasLoad,
  shouldCommitDeferredCanvasWrite
} from './canvasWrite'

describe('canvas file alignment', () => {
  it('accepts a load only when the generation and file id are still current', () => {
    expect(isCurrentCanvasLoad(2, 2, 'file-b', 'file-b')).toBe(true)
    expect(isCurrentCanvasLoad(1, 2, 'file-b', 'file-b')).toBe(false)
    expect(isCurrentCanvasLoad(2, 2, 'file-a', 'file-b')).toBe(false)
  })

  it('writes canvas state only to the file currently shown', () => {
    expect(canWriteFile('file-a', 'file-a')).toBe(true)
    expect(canWriteFile('file-a', 'file-b')).toBe(false)
    expect(canWriteFile(null, 'file-a')).toBe(false)
    expect(canWriteFile('file-a', undefined)).toBe(false)
  })

  it('drops a deferred image once the file, canvas, or history apply has moved on', () => {
    const current = {
      canvasMatches: true,
      generationMatches: true,
      canWrite: true,
      historyApplying: false
    }
    expect(shouldCommitDeferredCanvasWrite(current)).toBe(true)
    expect(
      shouldCommitDeferredCanvasWrite({ ...current, canWrite: false })
    ).toBe(false)
    expect(
      shouldCommitDeferredCanvasWrite({ ...current, generationMatches: false })
    ).toBe(false)
    expect(
      shouldCommitDeferredCanvasWrite({ ...current, canvasMatches: false })
    ).toBe(false)
    expect(
      shouldCommitDeferredCanvasWrite({ ...current, historyApplying: true })
    ).toBe(false)
  })
})
