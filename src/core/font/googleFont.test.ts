import { describe, expect, it, vi } from 'vitest'
import {
  FontLoadDeps,
  FontLoadError,
  googleFontStylesheetUrl,
  interpretGoogleFontResponse,
  isGoogleFontStylesheet,
  listedFontFaceStatus,
  loadGoogleFont,
  loadUiChineseFont,
  UI_CHINESE_FONT
} from './googleFont'

const stylesheet =
  "@font-face { font-family: 'Roboto'; src: url(https://fonts.gstatic.com/s/roboto.woff2) format('woff2'); }"

const depsFor = (
  response: { status: number; text: string } | Error,
  loadFace: () => Promise<boolean> = async () => true
): FontLoadDeps & {
  injectStylesheet: ReturnType<typeof vi.fn>
  removeStylesheet: ReturnType<typeof vi.fn>
} => {
  const injectStylesheet = vi.fn()
  const removeStylesheet = vi.fn()
  return {
    fetchStylesheet: vi.fn(async () => {
      if (response instanceof Error) {
        throw response
      }
      return response
    }),
    injectStylesheet,
    removeStylesheet,
    loadFace
  }
}

describe('google font loading', () => {
  it('treats an undeclared family as missing so it is downloaded again', () => {
    expect(listedFontFaceStatus([], 'Yarndings 12')).toBe('missing')
    expect(
      listedFontFaceStatus(
        [{ family: '"Bitcount Ink"', status: 'loading' }],
        'Bitcount Ink'
      )
    ).toBe('pending')
    expect(
      listedFontFaceStatus(
        [{ family: 'Bitcount Ink', status: 'loaded' }],
        'bitcount ink'
      )
    ).toBe('loaded')
  })

  it('encodes spaces in the stylesheet url', () => {
    expect(googleFontStylesheetUrl('  Noto   Sans SC ')).toBe(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+SC&display=swap'
    )
  })

  it('accepts a stylesheet only when it contains a font file', () => {
    expect(isGoogleFontStylesheet(stylesheet)).toBe(true)
    expect(isGoogleFontStylesheet('not a font')).toBe(false)
    expect(interpretGoogleFontResponse(200, stylesheet)).toBe('ok')
    expect(interpretGoogleFontResponse(400, 'missing')).toBe('not-found')
    expect(interpretGoogleFontResponse(200, '<html></html>')).toBe('not-found')
    expect(interpretGoogleFontResponse(503, '')).toBe('network')
  })

  it('adds a font only after the face finishes loading', async () => {
    const deps = depsFor({ status: 200, text: stylesheet })
    await loadGoogleFont('Roboto', deps)
    expect(deps.injectStylesheet).toHaveBeenCalledWith('Roboto', stylesheet)
    expect(deps.removeStylesheet).not.toHaveBeenCalled()
  })

  it('does not add a missing font or a font that fails to load', async () => {
    const missing = depsFor({ status: 400, text: 'missing' })
    await expect(
      loadGoogleFont('Not A Real Font', missing)
    ).rejects.toMatchObject({
      reason: 'not-found'
    })
    expect(missing.injectStylesheet).not.toHaveBeenCalled()

    const failed = depsFor({ status: 200, text: stylesheet }, async () => false)
    await expect(loadGoogleFont('Roboto', failed)).rejects.toBeInstanceOf(
      FontLoadError
    )
    expect(failed.removeStylesheet).toHaveBeenCalledWith('Roboto')
  })

  it('reports network and invalid-name failures', async () => {
    const offline = depsFor(new Error('offline'))
    await expect(loadGoogleFont('Roboto', offline)).rejects.toMatchObject({
      reason: 'network'
    })
    const invalid = depsFor(new Error('offline'))
    await expect(loadGoogleFont('Roboto!', invalid)).rejects.toMatchObject({
      reason: 'invalid'
    })
    expect(invalid.fetchStylesheet).not.toHaveBeenCalled()
  })

  it('treats a missing font hidden by CORS as not found', async () => {
    const missing = depsFor(new Error('opaque'))
    missing.loadStylesheetLink = vi.fn(async () => 'error' as const)
    missing.isOnline = () => true
    await expect(loadGoogleFont('Roboto', missing)).rejects.toMatchObject({
      reason: 'not-found'
    })
    expect(missing.injectStylesheet).not.toHaveBeenCalled()
  })

  it('does not fail the interface when the chinese font cannot load', async () => {
    const offline = depsFor(new Error('offline'))
    offline.loadStylesheetLink = vi.fn(async () => 'error' as const)
    offline.isOnline = () => false
    await expect(loadUiChineseFont(offline)).resolves.toBeUndefined()
    expect(offline.injectStylesheet).not.toHaveBeenCalled()
    expect(UI_CHINESE_FONT).toBe('ZCOOL KuaiLe')
  })

  it('reports a network error when the browser is offline', async () => {
    const offline = depsFor(new Error('offline'))
    offline.loadStylesheetLink = vi.fn(async () => 'error' as const)
    offline.isOnline = () => false
    await expect(loadGoogleFont('Roboto', offline)).rejects.toMatchObject({
      reason: 'network'
    })
  })
})
