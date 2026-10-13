import { describe, expect, it } from 'vitest'
import { placeMenu } from './placeMenu'

describe('export menu placement', () => {
  const viewport = { width: 1000, height: 800 }
  const menu = { width: 180, height: 120 }

  it('opens above the button when there is room', () => {
    expect(
      placeMenu({ left: 400, top: 700, width: 32, height: 32 }, menu, viewport)
    ).toEqual({ top: 572, left: 326 })
  })

  it('opens below the button when the top edge is too close', () => {
    expect(
      placeMenu({ left: 400, top: 10, width: 32, height: 32 }, menu, viewport)
    ).toEqual({ top: 50, left: 326 })
  })

  it('shifts left so the menu stays inside the viewport', () => {
    expect(
      placeMenu({ left: 900, top: 700, width: 32, height: 32 }, menu, viewport)
    ).toEqual({ top: 572, left: 812 })
  })
})
