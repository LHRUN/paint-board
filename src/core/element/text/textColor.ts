/** Fits beside the label on one row of the select panel. */
export const TEXT_COLOR_LIMIT = 4

export const DEFAULT_TEXT_COLORS = ['#000000']

const normalizeColor = (color: unknown) =>
  typeof color === 'string' ? color.trim().toLowerCase() : ''

/** One swatch index for new text. Out-of-range indexes fall back to black. */
export const textFillColor = (colors: string[], index: number) =>
  colors[index] || colors[0] || DEFAULT_TEXT_COLORS[0]

/**
 * Highlight every swatch that matches the shared fill.
 * Mixed fills, or a fill that is not in the palette, highlight nothing.
 */
export const activeTextColorIndexes = (colors: string[], fills: unknown[]) => {
  if (fills.length === 0) {
    return []
  }
  const shared = normalizeColor(fills[0])
  if (!shared || fills.some((fill) => normalizeColor(fill) !== shared)) {
    return []
  }
  return colors.flatMap((color, index) =>
    normalizeColor(color) === shared ? [index] : []
  )
}
