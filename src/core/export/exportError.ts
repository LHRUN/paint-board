export const EXPORT_TOO_LARGE_ERROR = 'Export image is too large'

const isTaintedCanvasError = (error: unknown) => {
  if (typeof DOMException !== 'undefined' && error instanceof DOMException) {
    return error.name === 'SecurityError'
  }
  if (error instanceof Error) {
    return error.name === 'SecurityError' || /tainted/i.test(error.message)
  }
  return false
}

/** i18n key for a failed image export. */
export const exportErrorMessageKey = (error: unknown) => {
  if (error instanceof Error && error.message === EXPORT_TOO_LARGE_ERROR) {
    return 'tip.exportTooLarge'
  }
  if (isTaintedCanvasError(error)) {
    return 'tip.exportFail'
  }
  return 'tip.exportFailGeneric'
}
