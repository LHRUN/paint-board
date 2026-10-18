export const FONT_CONFIG_VERSION = 1
export const MAX_CUSTOM_FONTS = 5
export const MAX_QUICK_FONTS = 3
export const MAX_BOARD_FONTS = 20

export const DEFAULT_FONTS = ['Georgia', 'Fredoka One', 'Hanalei Fill'] as const

const SYSTEM_FONTS = new Set([
  'georgia',
  'arial',
  'helvetica',
  'times new roman',
  'courier new',
  'verdana',
  'tahoma',
  'trebuchet ms',
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'pingfang sc',
  'microsoft yahei'
])

export interface FontLists {
  customFonts: string[]
  quickFonts: string[]
}

export type AddFontGate = 'ok' | 'invalid' | 'duplicate' | 'limit'

export type QuickFontStatus = 'unchanged' | 'added' | 'replaced' | 'rejected'

export interface QuickFontUpdate {
  status: QuickFontStatus
  quickFonts: string[]
}

export const MAX_FONT_SAMPLE_CHARS = 1000

export const normalizeFontName = (font: string) =>
  font.trim().replace(/\s+/g, ' ')

// Google splits one family into unicode-range files. A Latin probe does not
// download the file that covers the characters Fabric is about to measure.
export const fontSampleText = (text: string) => {
  const seen = new Set<string>()
  let sample = ''
  for (const ch of Array.from(text)) {
    const code = ch.codePointAt(0) ?? 0
    if (code < 32 || seen.has(ch)) {
      continue
    }
    seen.add(ch)
    sample += ch
    if (seen.size >= MAX_FONT_SAMPLE_CHARS) {
      break
    }
  }
  return sample
}

export const cssFontFamily = (font: string) =>
  `"${normalizeFontName(font).replace(/"/g, '')}"`

export const sameFont = (left: string, right: string) =>
  normalizeFontName(left).toLowerCase() ===
  normalizeFontName(right).toLowerCase()

export const isValidFontName = (font: string) => {
  const name = normalizeFontName(font)
  return (
    name.length > 0 &&
    name.length <= 80 &&
    /^[\p{L}\p{N}]+(?:[ -][\p{L}\p{N}]+)*$/u.test(name)
  )
}

export const isSystemFont = (font: string) =>
  SYSTEM_FONTS.has(normalizeFontName(font).toLowerCase())

export const isDefaultFont = (font: string) =>
  DEFAULT_FONTS.some((item) => sameFont(item, font))

export const defaultFontLists = (): FontLists => ({
  customFonts: [],
  quickFonts: [...DEFAULT_FONTS]
})

const uniqueFonts = (fonts: string[], allow: (font: string) => boolean) => {
  const result: string[] = []
  fonts.forEach((font) => {
    if (typeof font !== 'string') {
      return
    }
    const name = normalizeFontName(font)
    if (!isValidFontName(name) || !allow(name)) {
      return
    }
    if (result.some((item) => sameFont(item, name))) {
      return
    }
    result.push(name)
  })
  return result
}

export const sanitizeFontConfig = (input: unknown): FontLists => {
  const fallback = defaultFontLists()
  if (!input || typeof input !== 'object') {
    return fallback
  }
  const record = input as Record<string, unknown>
  if (record.version !== undefined && record.version !== FONT_CONFIG_VERSION) {
    return fallback
  }

  const customFonts = uniqueFonts(
    Array.isArray(record.customFonts) ? (record.customFonts as string[]) : [],
    (font) => !isDefaultFont(font)
  ).slice(0, MAX_CUSTOM_FONTS)

  const allowQuickFont = (font: string) =>
    isDefaultFont(font) || customFonts.some((item) => sameFont(item, font))

  if (!Array.isArray(record.quickFonts)) {
    return { customFonts, quickFonts: fallback.quickFonts }
  }
  if (record.quickFonts.length === 0) {
    return { customFonts, quickFonts: [] }
  }

  const quickFonts = uniqueFonts(
    record.quickFonts as string[],
    allowQuickFont
  ).slice(0, MAX_QUICK_FONTS)

  return {
    customFonts,
    quickFonts: quickFonts.length > 0 ? quickFonts : fallback.quickFonts
  }
}

export const canAddCustomFont = (
  font: string,
  customFonts: string[]
): AddFontGate => {
  const name = normalizeFontName(font)
  if (!isValidFontName(name)) {
    return 'invalid'
  }
  if (isDefaultFont(name) || customFonts.some((item) => sameFont(item, name))) {
    return 'duplicate'
  }
  if (customFonts.length >= MAX_CUSTOM_FONTS) {
    return 'limit'
  }
  return 'ok'
}

export const removeCustomFont = (lists: FontLists, font: string): FontLists => {
  if (isDefaultFont(font)) {
    return lists
  }
  return {
    customFonts: lists.customFonts.filter((item) => !sameFont(item, font)),
    quickFonts: lists.quickFonts.filter((item) => !sameFont(item, font))
  }
}

export const nextQuickFonts = (
  quickFonts: string[],
  font: string,
  allowed: string[]
): QuickFontUpdate => {
  const name = normalizeFontName(font)
  if (!allowed.some((item) => sameFont(item, name))) {
    return { status: 'rejected', quickFonts }
  }
  if (quickFonts.some((item) => sameFont(item, name))) {
    return { status: 'unchanged', quickFonts }
  }
  if (quickFonts.length < MAX_QUICK_FONTS) {
    return { status: 'added', quickFonts: [...quickFonts, name] }
  }
  return {
    status: 'replaced',
    quickFonts: [name, ...quickFonts.slice(0, -1)]
  }
}
