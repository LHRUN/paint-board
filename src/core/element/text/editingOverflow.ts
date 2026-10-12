export const FONT_SIZE_FRACTION = 0.222

/** Fabric multiplies the em square by this when it builds the text box. */
export const FONT_SIZE_MULT = 1.13

export type BoxOverflow = {
  left: number
  right: number
  top: number
  bottom: number
}

const emptyOverflow = (): BoxOverflow => ({
  left: 0,
  right: 0,
  top: 0,
  bottom: 0
})

const positive = (value: number) => (value > 0.5 ? Math.ceil(value) : 0)

/**
 * Fabric's editing highlight is the layout box: advance wide, and
 * fontSize * fontSizeMult tall. The baseline sits (1 - fontSizeFraction)
 * of the way down that box. These insets are the extra pixels needed on
 * each side so the box covers the browser's glyph bounds.
 */
export const editingOverflowFromMetrics = ({
  fontSize,
  fontSizeFraction = FONT_SIZE_FRACTION,
  fontSizeMult = FONT_SIZE_MULT,
  advanceWidth,
  actualBoundingBoxLeft,
  actualBoundingBoxRight,
  fontBoundingBoxAscent,
  fontBoundingBoxDescent
}: {
  fontSize: number
  fontSizeFraction?: number
  fontSizeMult?: number
  advanceWidth: number
  actualBoundingBoxLeft: number
  actualBoundingBoxRight: number
  fontBoundingBoxAscent: number
  fontBoundingBoxDescent: number
}): BoxOverflow => {
  if (fontSize <= 0 || fontSizeMult <= 0) {
    return emptyOverflow()
  }
  const boxHeight = fontSize * fontSizeMult
  const baseline = boxHeight * (1 - fontSizeFraction)
  return {
    left: positive(actualBoundingBoxLeft),
    right: positive(actualBoundingBoxRight - advanceWidth),
    top: positive(fontBoundingBoxAscent - baseline),
    bottom: positive(fontBoundingBoxDescent - (boxHeight - baseline))
  }
}

export const unionOverflow = (boxes: BoxOverflow[]): BoxOverflow =>
  boxes.reduce<BoxOverflow>(
    (acc, box) => ({
      left: Math.max(acc.left, box.left),
      right: Math.max(acc.right, box.right),
      top: Math.max(acc.top, box.top),
      bottom: Math.max(acc.bottom, box.bottom)
    }),
    emptyOverflow()
  )
