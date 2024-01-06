/**
 * hexToRgba
 * @param hex hexadecimal color
 * @param alpha
 * @returns rgba
 */
export function hexToRgba(hex: string, alpha = 1) {
  const bigint = parseInt(hex.slice(1), 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function rgbaToHex(rgba: string) {
  if (!rgba) {
    return rgba
  }

  const values = rgba.match(/\d+/g) as RegExpMatchArray
  const hex = `#${(
    (1 << 24) +
    (parseInt(values[0]) << 16) +
    (parseInt(values[1]) << 8) +
    parseInt(values[2])
  )
    .toString(16)
    .slice(1)}`
  return hex
}

/**
 * get rgba alpha
 * @param rgbaString rgba color
 * @returns
 */
export function getAlphaFromRgba(rgbaString: string) {
  const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)

  if (match) {
    return parseFloat(match[4])
  } else {
    return 1
  }
}

/**
 * Get the rgba of the new alpha
 * @param rgbaColor
 * @param newAlpha
 * @returns newRgbaColor
 */
export function changeAlpha(rgbaColor: string, newAlpha: number) {
  const match = rgbaColor.match(/rgba?\((.*?)\)/)
  if (!match) {
    return rgbaColor
  }

  const rgbPart = match[1].split(',').map((i) => i.trim())
  newAlpha = Math.min(1, Math.max(0, newAlpha))

  const newRgbaColor = `rgba(${rgbPart[0]}, ${rgbPart[1]}, ${rgbPart[2]}, ${newAlpha})`
  return newRgbaColor
}

export function isHexColor(color: string) {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color)
}

export function isRgbaColor(color: string) {
  return /^rgba?\((\d+,\s*){2}\d+,\s*(0(\.\d+)?|1(\.0)?)\)$/.test(color)
}

export function getColorFormat(color: string) {
  if (isHexColor(color)) {
    return 'hex'
  } else if (isRgbaColor(color)) {
    return 'rgba'
  } else {
    return 'unknown'
  }
}
