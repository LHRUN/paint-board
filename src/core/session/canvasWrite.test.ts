import { describe, expect, it } from 'vitest'
import { canWriteFile, isCurrentCanvasLoad } from './canvasWrite'

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
})
