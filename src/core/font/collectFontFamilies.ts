import {
  fontSampleText,
  isSystemFont,
  isValidFontName,
  MAX_BOARD_FONTS,
  MAX_FONT_SAMPLE_CHARS,
  normalizeFontName,
  sameFont
} from './fontConfig'

export interface FontSample {
  family: string
  text: string
}

const textTypes = new Set(['text', 'i-text', 'textbox'])

const walkFontFamilies = (
  value: unknown,
  found: Set<string>,
  depth: number
) => {
  if (!value || typeof value !== 'object' || depth > 30) {
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item) => walkFontFamilies(item, found, depth + 1))
    return
  }
  const record = value as Record<string, unknown>
  if (typeof record.fontFamily === 'string') {
    found.add(record.fontFamily)
  }
  walkFontFamilies(record.objects, found, depth + 1)
  walkFontFamilies(record._objects, found, depth + 1)
  walkFontFamilies(record.styles, found, depth + 1)
  walkFontFamilies(record.style, found, depth + 1)
}

const rememberSample = (
  buckets: Map<string, { family: string; chars: string[] }>,
  family: string,
  text: string
) => {
  const name = normalizeFontName(family)
  if (!isValidFontName(name) || isSystemFont(name)) {
    return
  }
  const key = name.toLowerCase()
  let bucket = buckets.get(key)
  if (!bucket) {
    if (buckets.size >= MAX_BOARD_FONTS) {
      return
    }
    bucket = { family: name, chars: [] }
    buckets.set(key, bucket)
  }
  const seen = new Set(bucket.chars)
  for (const ch of Array.from(fontSampleText(text))) {
    if (seen.has(ch) || bucket.chars.length >= MAX_FONT_SAMPLE_CHARS) {
      continue
    }
    seen.add(ch)
    bucket.chars.push(ch)
  }
}

const styleFontAt = (styles: unknown, lineIndex: number, charIndex: number) => {
  if (!styles || typeof styles !== 'object' || Array.isArray(styles)) {
    return ''
  }
  const line = (styles as Record<string, unknown>)[lineIndex]
  if (!line || typeof line !== 'object' || Array.isArray(line)) {
    return ''
  }
  const style = (line as Record<string, unknown>)[charIndex]
  if (!style || typeof style !== 'object' || Array.isArray(style)) {
    return ''
  }
  const family = (style as { fontFamily?: unknown }).fontFamily
  return typeof family === 'string' ? family : ''
}

const rememberObjectText = (
  buckets: Map<string, { family: string; chars: string[] }>,
  record: Record<string, unknown>
) => {
  if (typeof record.fontFamily !== 'string') {
    return
  }
  const family = record.fontFamily
  if (typeof record.text !== 'string') {
    rememberSample(buckets, family, '')
    return
  }
  const lines = record.text.split('\n')
  lines.forEach((line, lineIndex) => {
    for (let index = 0; index < line.length; index += 1) {
      const styled = styleFontAt(record.styles, lineIndex, index)
      rememberSample(buckets, styled || family, line[index] || '')
    }
  })
}

const walkFontSamples = (
  value: unknown,
  buckets: Map<string, { family: string; chars: string[] }>,
  depth: number
) => {
  if (!value || typeof value !== 'object' || depth > 30) {
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item) => walkFontSamples(item, buckets, depth + 1))
    return
  }
  const record = value as Record<string, unknown>
  const isText =
    textTypes.has(String(record.type || '')) ||
    (typeof record.text === 'string' && typeof record.fontFamily === 'string')
  if (isText) {
    rememberObjectText(buckets, record)
  } else if (typeof record.fontFamily === 'string') {
    rememberSample(buckets, record.fontFamily, '')
  }
  walkFontSamples(record.objects, buckets, depth + 1)
  walkFontSamples(record._objects, buckets, depth + 1)
}

export const collectFontSamples = (data: unknown): FontSample[] => {
  const buckets = new Map<string, { family: string; chars: string[] }>()
  walkFontSamples(data, buckets, 0)
  return Array.from(buckets.values()).map((bucket) => ({
    family: bucket.family,
    text: bucket.chars.join('')
  }))
}

export const collectPlainText = (data: unknown) => {
  const parts: string[] = []
  const walk = (value: unknown, depth: number) => {
    if (!value || typeof value !== 'object' || depth > 30) {
      return
    }
    if (Array.isArray(value)) {
      value.forEach((item) => walk(item, depth + 1))
      return
    }
    const record = value as Record<string, unknown>
    if (
      typeof record.text === 'string' &&
      (textTypes.has(String(record.type || '')) ||
        typeof record.fontFamily === 'string')
    ) {
      parts.push(record.text)
    }
    walk(record.objects, depth + 1)
    walk(record._objects, depth + 1)
  }
  walk(data, 0)
  return parts.join('')
}

export const collectFontFamilies = (data: unknown) => {
  const found = new Set<string>()
  walkFontFamilies(data, found, 0)
  const families: string[] = []
  found.forEach((font) => {
    if (families.length >= MAX_BOARD_FONTS) {
      return
    }
    const name = normalizeFontName(font)
    if (!isValidFontName(name) || isSystemFont(name)) {
      return
    }
    if (families.some((item) => sameFont(item, name))) {
      return
    }
    families.push(name)
  })
  return families
}

const styleUsesFontFamilies = (
  styles: unknown,
  families: string[],
  depth: number
): boolean => {
  if (!styles || typeof styles !== 'object' || depth > 8) {
    return false
  }
  if (Array.isArray(styles)) {
    return styles.some((item) =>
      styleUsesFontFamilies(item, families, depth + 1)
    )
  }
  const record = styles as Record<string, unknown>
  if (
    typeof record.fontFamily === 'string' &&
    families.some((font) => sameFont(font, record.fontFamily as string))
  ) {
    return true
  }
  return Object.values(record).some((value) =>
    styleUsesFontFamilies(value, families, depth + 1)
  )
}

export const textUsesFontFamilies = (
  text: { fontFamily?: string; styles?: unknown },
  families: string[]
) => {
  if (
    text.fontFamily &&
    families.some((font) => sameFont(font, text.fontFamily || ''))
  ) {
    return true
  }
  return styleUsesFontFamilies(text.styles, families, 0)
}
