import { describe, expect, it } from 'vitest'
import { supportsOffscreenPng } from './canvasBlob'

describe('offscreen png support', () => {
  it('requires convertToBlob on the prototype', () => {
    expect(supportsOffscreenPng(undefined)).toBe(false)
    expect(supportsOffscreenPng({ prototype: {} })).toBe(false)
    expect(supportsOffscreenPng({ prototype: { convertToBlob() {} } })).toBe(
      true
    )
  })
})
