import { describe, expect, it } from 'vitest'
import { isModalDialogOpen } from './modalGuard'

describe('modal shortcut guard', () => {
  it('blocks canvas shortcuts only while a dialog is open', () => {
    expect(isModalDialogOpen(null)).toBe(false)
    expect(
      isModalDialogOpen({
        querySelector: () => null
      })
    ).toBe(false)
    expect(
      isModalDialogOpen({
        querySelector: (selector) => (selector === 'dialog[open]' ? {} : null)
      })
    ).toBe(true)
  })
})
