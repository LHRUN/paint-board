import { describe, expect, it } from 'vitest'
import { fittedImageSize } from './imageLimit'

describe('fittedImageSize', () => {
  it('leaves an image that already fits', () => {
    expect(fittedImageSize(800, 600, 2048)).toEqual({
      width: 800,
      height: 600,
      scale: 1
    })
  })

  it('shrinks the long edge to the limit', () => {
    expect(fittedImageSize(4000, 2000, 2048)).toEqual({
      width: 2048,
      height: 1024,
      scale: 2048 / 4000
    })
  })

  it('does not divide by an empty image', () => {
    expect(fittedImageSize(0, 0, 2048).scale).toBe(1)
  })
})
