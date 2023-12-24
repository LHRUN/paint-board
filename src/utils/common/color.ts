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

export function getAlphaFromRgba(rgbaString: string) {
  const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)

  if (match) {
    return parseFloat(match[4])
  } else {
    return 1
  }
}

export function changeAlpha(rgbaColor: string, newAlpha: number) {
  // 提取 RGBA 组件
  const match = rgbaColor.match(/rgba?\((.*?)\)/)

  if (!match) {
    // 如果颜色字符串不符合 RGBA 格式，则直接返回
    return rgbaColor
  }

  // 提取原始颜色的 RGB 部分和透明度
  const rgbPart = match[1].split(',').map((i) => i.trim())

  // 限制新透明度值在 [0, 1] 范围内
  newAlpha = Math.min(1, Math.max(0, newAlpha))

  // 构造带有新透明度的 RGBA 格式字符串
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
