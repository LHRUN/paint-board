import { describe, expect, it } from 'vitest'
import { EXPORT_TOO_LARGE_ERROR, exportErrorMessageKey } from './exportError'

describe('export error message', () => {
  it('keeps the cross-origin message for a tainted canvas', () => {
    expect(
      exportErrorMessageKey(
        new DOMException(
          'Tainted canvases may not be exported.',
          'SecurityError'
        )
      )
    ).toBe('tip.exportFail')
  })

  it('uses the size message when the export is over the pixel limit', () => {
    expect(exportErrorMessageKey(new Error(EXPORT_TOO_LARGE_ERROR))).toBe(
      'tip.exportTooLarge'
    )
  })

  it('uses a generic message for other export failures', () => {
    expect(exportErrorMessageKey(new Error('No selection'))).toBe(
      'tip.exportFailGeneric'
    )
    expect(exportErrorMessageKey(new Error('Canvas is empty'))).toBe(
      'tip.exportFailGeneric'
    )
  })
})
