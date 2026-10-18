import { collectFontFamilies, collectFontSamples } from './collectFontFamilies'
import {
  fontSampleText,
  isSystemFont,
  isValidFontName,
  MAX_BOARD_FONTS,
  normalizeFontName
} from './fontConfig'

const FONT_PROBE = 'Aa'
export const BOARD_FONT_WAIT_MS = 8000
const FONT_FACE_PROBE_MS = 400

export type FontLoadFailure =
  | 'invalid'
  | 'not-found'
  | 'network'
  | 'load-failed'

export class FontLoadError extends Error {
  reason: FontLoadFailure

  constructor(reason: FontLoadFailure) {
    super(reason)
    this.name = 'FontLoadError'
    this.reason = reason
  }
}

export interface FontStylesheetResponse {
  status: number
  text: string
}

export interface FontLoadDeps {
  fetchStylesheet: (url: string) => Promise<FontStylesheetResponse>
  injectStylesheet: (family: string, css: string) => void
  removeStylesheet: (family: string) => void
  loadFace: (family: string) => Promise<boolean>
  loadStylesheetLink?: (
    family: string,
    url: string
  ) => Promise<'load' | 'error'>
  isOnline?: () => boolean
}

const delay = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export const googleFontStylesheetUrl = (family: string) => {
  const query = encodeURIComponent(normalizeFontName(family)).replace(
    /%20/g,
    '+'
  )
  return `https://fonts.googleapis.com/css2?family=${query}&display=swap`
}

export const isGoogleFontStylesheet = (css: string) =>
  /@font-face/i.test(css) && /url\(/i.test(css)

export const interpretGoogleFontResponse = (
  status: number,
  css: string
): 'ok' | 'not-found' | 'network' => {
  if (status === 400) {
    return 'not-found'
  }
  if (status < 200 || status >= 300) {
    return 'network'
  }
  if (!isGoogleFontStylesheet(css)) {
    return 'not-found'
  }
  return 'ok'
}

const styleElementId = (family: string) =>
  `paint-board-font-${encodeURIComponent(family)}`

const linkElementId = (family: string) =>
  `paint-board-font-link-${encodeURIComponent(family)}`

const fontShorthand = (family: string) => `16px "${family}"`

export type ListedFontFaceStatus = 'missing' | 'loaded' | 'pending'

export const listedFontFaceStatus = (
  faces: Iterable<{ family: string; status: string }>,
  family: string
): ListedFontFaceStatus => {
  const target = normalizeFontName(family).toLowerCase()
  let pending = false
  for (const face of faces) {
    const name = face.family
      .replace(/^['"]|['"]$/g, '')
      .trim()
      .toLowerCase()
    if (name !== target) {
      continue
    }
    if (face.status === 'loaded') {
      return 'loaded'
    }
    pending = true
  }
  return pending ? 'pending' : 'missing'
}

const currentFontFaceStatus = (family: string): ListedFontFaceStatus => {
  if (typeof document === 'undefined' || !document.fonts) {
    return 'missing'
  }
  return listedFontFaceStatus(document.fonts, family)
}

export const isFontFaceReadySync = (family: string) => {
  if (typeof document === 'undefined' || !document.fonts?.check) {
    return false
  }
  const name = normalizeFontName(family)
  if (!name) {
    return false
  }
  return document.fonts.check(fontShorthand(name), FONT_PROBE)
}

const isFontFaceReady = async (family: string, timeoutMs: number) => {
  if (
    typeof document === 'undefined' ||
    !document.fonts?.load ||
    !document.fonts.check
  ) {
    return false
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    await Promise.race([
      document.fonts.load(fontShorthand(family), FONT_PROBE),
      new Promise((resolve) => {
        timer = setTimeout(resolve, timeoutMs)
      })
    ])
  } catch {
    return false
  } finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
  return document.fonts.check(fontShorthand(family), FONT_PROBE)
}

const fetchStylesheet = async (
  url: string
): Promise<FontStylesheetResponse> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), BOARD_FONT_WAIT_MS)
  try {
    const response = await fetch(url, { signal: controller.signal })
    const text =
      response.ok || response.status === 400 ? await response.text() : ''
    return { status: response.status, text }
  } catch {
    // A missing family is a 400 without CORS headers, so fetch rejects.
    throw new Error('font-stylesheet-unavailable')
  } finally {
    clearTimeout(timer)
  }
}

const injectStylesheet = (family: string, css: string) => {
  if (typeof document === 'undefined') {
    return
  }
  const id = styleElementId(family)
  let style = document.getElementById(id)
  if (!style) {
    style = document.createElement('style')
    style.id = id
    document.head.appendChild(style)
  }
  style.textContent = css
}

const removeStylesheet = (family: string) => {
  if (typeof document === 'undefined') {
    return
  }
  document.getElementById(styleElementId(family))?.remove()
  document.getElementById(linkElementId(family))?.remove()
}

const loadStylesheetLink = (family: string, url: string) =>
  new Promise<'load' | 'error'>((resolve) => {
    if (typeof document === 'undefined') {
      resolve('error')
      return
    }
    const id = linkElementId(family)
    let link = document.getElementById(id) as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    const finish = (result: 'load' | 'error') => {
      if (!link) {
        return
      }
      link.onload = null
      link.onerror = null
      resolve(result)
    }
    const timer = setTimeout(() => finish('error'), BOARD_FONT_WAIT_MS)
    link.onload = () => {
      clearTimeout(timer)
      finish('load')
    }
    link.onerror = () => {
      clearTimeout(timer)
      link?.remove()
      finish('error')
    }
    link.href = url
  })

const browserIsOnline = () =>
  typeof navigator === 'undefined' || navigator.onLine !== false

const defaultFontLoadDeps: FontLoadDeps = {
  fetchStylesheet,
  injectStylesheet,
  removeStylesheet,
  loadFace: (family) => isFontFaceReady(family, BOARD_FONT_WAIT_MS),
  loadStylesheetLink,
  isOnline: browserIsOnline
}

const inflightLoads = new Map<string, Promise<void>>()

const confirmFontLink = async (family: string, deps: FontLoadDeps) => {
  if (!deps.loadStylesheetLink) {
    throw new FontLoadError('network')
  }
  const linked = await deps.loadStylesheetLink(
    family,
    googleFontStylesheetUrl(family)
  )
  if (linked === 'error') {
    const online = deps.isOnline ? deps.isOnline() : browserIsOnline()
    throw new FontLoadError(online ? 'not-found' : 'network')
  }
  const ready = await deps.loadFace(family)
  if (!ready) {
    deps.removeStylesheet(family)
    throw new FontLoadError('load-failed')
  }
}

const loadGoogleFontOnce = async (family: string, deps: FontLoadDeps) => {
  let response: FontStylesheetResponse
  try {
    response = await deps.fetchStylesheet(googleFontStylesheetUrl(family))
  } catch (error) {
    if (error instanceof FontLoadError) {
      throw error
    }
    await confirmFontLink(family, deps)
    return
  }
  const result = interpretGoogleFontResponse(response.status, response.text)
  if (result === 'not-found') {
    throw new FontLoadError('not-found')
  }
  if (result === 'network') {
    throw new FontLoadError('network')
  }
  deps.injectStylesheet(family, response.text)
  const ready = await deps.loadFace(family)
  if (!ready) {
    deps.removeStylesheet(family)
    throw new FontLoadError('load-failed')
  }
}

export const loadGoogleFont = async (
  family: string,
  deps: FontLoadDeps = defaultFontLoadDeps
) => {
  const name = normalizeFontName(family)
  if (!isValidFontName(name)) {
    throw new FontLoadError('invalid')
  }
  if (deps !== defaultFontLoadDeps) {
    await loadGoogleFontOnce(name, deps)
    return
  }
  const key = name.toLowerCase()
  const existing = inflightLoads.get(key)
  if (existing) {
    await existing
    return
  }
  const task = loadGoogleFontOnce(name, deps).finally(() => {
    inflightLoads.delete(key)
  })
  inflightLoads.set(key, task)
  await task
}

export const ensureFontReady = async (family: string) => {
  const name = normalizeFontName(family)
  if (!isValidFontName(name)) {
    throw new FontLoadError('invalid')
  }
  if (isSystemFont(name)) {
    return
  }
  // check() is true for a family that has no @font-face yet, so a refresh
  // would skip the download and the saved font would render as a fallback.
  const status = currentFontFaceStatus(name)
  if (status === 'loaded' && isFontFaceReadySync(name)) {
    return
  }
  if (
    status === 'pending' &&
    (await isFontFaceReady(name, FONT_FACE_PROBE_MS))
  ) {
    return
  }
  await loadGoogleFont(name)
}

const coveredSamples = new Map<string, Set<string>>()
const failedSamples = new Map<string, Set<string>>()
const sampleQueues = new Map<string, Promise<void>>()

export const isFontTextReadySync = (family: string, text: string) => {
  const name = normalizeFontName(family)
  if (!name || isSystemFont(name)) {
    return true
  }
  const sample = fontSampleText(text)
  if (!sample) {
    return true
  }
  const covered = coveredSamples.get(name.toLowerCase())
  if (!covered) {
    return false
  }
  return Array.from(sample).every((ch) => covered.has(ch))
}

const sampleSet = (store: Map<string, Set<string>>, family: string) => {
  const key = family.toLowerCase()
  const current = store.get(key) ?? new Set<string>()
  store.set(key, current)
  return current
}

const markSampleCovered = (family: string, sample: string) => {
  const covered = sampleSet(coveredSamples, family)
  const failed = failedSamples.get(family.toLowerCase())
  Array.from(sample).forEach((ch) => {
    covered.add(ch)
    failed?.delete(ch)
  })
}

const markSampleFailed = (family: string, sample: string) => {
  const failed = sampleSet(failedSamples, family)
  const covered = coveredSamples.get(family.toLowerCase())
  Array.from(sample).forEach((ch) => {
    if (!covered?.has(ch)) {
      failed.add(ch)
    }
  })
}

export const canMeasureFontText = (family: string, text: string) => {
  if (isFontTextReadySync(family, text)) {
    return true
  }
  const name = normalizeFontName(family)
  const failed = name ? failedSamples.get(name.toLowerCase()) : undefined
  if (!failed) {
    return false
  }
  return Array.from(fontSampleText(text)).every((ch) => failed.has(ch))
}

const loadFontSample = async (family: string, sample: string) => {
  if (!sample || typeof document === 'undefined' || !document.fonts?.load) {
    return
  }
  let settled = false
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const pending = document.fonts
      .load(fontShorthand(family), sample)
      .then((faces) => {
        settled =
          faces.length > 0 && faces.every((face) => face.status === 'loaded')
        return faces
      })
    await Promise.race([
      pending,
      new Promise((resolve) => {
        timer = setTimeout(resolve, BOARD_FONT_WAIT_MS)
      })
    ])
  } catch {
    return
  } finally {
    if (timer) {
      clearTimeout(timer)
    }
  }
  if (settled) {
    markSampleCovered(family, sample)
  }
}

const enqueueFontSample = (family: string, task: () => Promise<void>) => {
  const key = family.toLowerCase()
  const previous = sampleQueues.get(key) ?? Promise.resolve()
  const next = previous.then(task, task)
  sampleQueues.set(key, next)
  return next
}

export const ensureFontTextReady = async (family: string, text: string) => {
  const name = normalizeFontName(family)
  const sample = fontSampleText(text)
  if (!isValidFontName(name)) {
    if (sample) {
      markSampleFailed(name || family, sample)
    }
    throw new FontLoadError('invalid')
  }
  if (isSystemFont(name)) {
    return
  }
  try {
    const failed = failedSamples.get(name.toLowerCase())
    Array.from(sample).forEach((ch) => failed?.delete(ch))
    await ensureFontReady(name)
    if (!sample || isFontTextReadySync(name, sample)) {
      return
    }
    await enqueueFontSample(name, async () => {
      const covered = coveredSamples.get(name.toLowerCase())
      const missing = Array.from(sample)
        .filter((ch) => !covered?.has(ch))
        .join('')
      if (!missing) {
        return
      }
      await loadFontSample(name, missing)
    })
    if (sample && !isFontTextReadySync(name, sample)) {
      markSampleFailed(name, sample)
    }
  } catch (error) {
    if (sample) {
      markSampleFailed(name, sample)
    }
    throw error
  }
}

export const ensureFontsLoaded = async (families: string[]) => {
  const seen = new Set<string>()
  const pending: Promise<void>[] = []
  families.forEach((family) => {
    const name = normalizeFontName(family)
    const key = name.toLowerCase()
    if (!name || seen.has(key) || seen.size >= MAX_BOARD_FONTS) {
      return
    }
    seen.add(key)
    pending.push(ensureFontReady(name).catch(() => undefined))
  })
  await Promise.all(pending)
}

const fontJobsForBoard = (boardData: unknown) => {
  const jobs: { family: string; text: string }[] = []
  const seen = new Set<string>()
  const push = (family: string, text: string) => {
    const key = normalizeFontName(family).toLowerCase()
    if (!key || seen.has(key) || jobs.length >= MAX_BOARD_FONTS) {
      return
    }
    seen.add(key)
    jobs.push({ family: normalizeFontName(family), text })
  }
  collectFontSamples(boardData).forEach((item) => push(item.family, item.text))
  collectFontFamilies(boardData).forEach((family) => push(family, ''))
  return jobs
}

export const ensureFontSamples = async (
  jobs: { family: string; text: string }[]
) => {
  await Promise.all(
    jobs.map((job) =>
      ensureFontTextReady(job.family, job.text).catch(() => undefined)
    )
  )
}

export const prepareBoardFonts = async (boardData: unknown) => {
  const jobs = fontJobsForBoard(boardData)
  const families = jobs.map((job) => job.family)
  let completed = false
  const finished = ensureFontSamples(jobs).finally(() => {
    completed = true
  })
  await Promise.race([finished, delay(BOARD_FONT_WAIT_MS)])
  return {
    families,
    timedOut: !completed,
    finished
  }
}
