import { v4 as uuidv4 } from 'uuid'
import {
  BOARD_VERSION,
  DEFAULT_BACKGROUND_COLOR_LIST,
  DEFAULT_BACKGROUND_SORT,
  createDefaultFile
} from '@/store/fileModel'
import type { IFile } from '@/store/files'
import { formatPublicUrl } from '@/utils'

export interface BoardTemplate {
  templateId: string
  name: string
  thumbnailUrl: string
  boardVersion: string
  zoom: number
  viewportTransform?: number[]
  canvasWidth: number
  canvasHeight: number
  backgroundColorList: string[]
  currentBackgroundColor: number
  backgroundImage: string
  backgroundImageOpacity: number
  backgroundSort: string[]
  boardData: Record<string, unknown>
}

const templateCache = new Map<string, Promise<BoardTemplate[]>>()

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const textOf = (value: unknown, key: string) => {
  if (!isRecord(value)) {
    return ''
  }
  const text = value[key]
  return typeof text === 'string' ? text.trim() : ''
}

const numberOr = (value: unknown, fallback: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback

const stringList = (value: unknown, fallback: string[]) => {
  if (!Array.isArray(value)) {
    return [...fallback]
  }
  return value.filter((item): item is string => typeof item === 'string')
}

const viewportOf = (value: unknown) => {
  if (!Array.isArray(value) || value.length < 6) {
    return undefined
  }
  if (
    !value.every((item) => typeof item === 'number' && Number.isFinite(item))
  ) {
    return undefined
  }
  return [...value]
}

/**
 * Public files are served from Vite's base path. Reject traversal and
 * keep absolute http(s) thumbnails unchanged.
 */
export const resolveTemplateAsset = (path: string) => {
  if (typeof path !== 'string') {
    return ''
  }
  const trimmed = path.trim()
  if (!trimmed || trimmed.includes('..') || trimmed.includes('\\')) {
    return ''
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return formatPublicUrl(trimmed.replace(/^\//, ''))
}

export const parseTemplateIndex = (value: unknown) => {
  if (!isRecord(value) || !Array.isArray(value.templates)) {
    return []
  }
  return value.templates.filter(
    (item): item is string =>
      typeof item === 'string' &&
      /^[\w.-]+\.json$/i.test(item) &&
      !item.includes('..')
  )
}

export const parseTemplateDocument = (
  value: unknown,
  language: string
): BoardTemplate | null => {
  if (!isRecord(value) || !isRecord(value.boardData)) {
    return null
  }
  if (
    !Array.isArray(value.boardData.objects) ||
    value.boardData.objects.length === 0
  ) {
    return null
  }
  const templateId =
    typeof value.templateId === 'string' ? value.templateId.trim() : ''
  const localized = isRecord(value.locales)
    ? value.locales[language]
    : undefined
  const name = textOf(localized, 'name') || textOf(value, 'name')
  if (!templateId || !name) {
    return null
  }

  const defaults = createDefaultFile('template', name)
  const viewportTransform = viewportOf(value.viewportTransform)
  return {
    templateId,
    name,
    thumbnailUrl: resolveTemplateAsset(
      typeof value.thumbnail === 'string' ? value.thumbnail : ''
    ),
    boardVersion:
      typeof value.boardVersion === 'string' && value.boardVersion
        ? value.boardVersion
        : defaults.boardVersion,
    zoom: numberOr(value.zoom, defaults.zoom),
    ...(viewportTransform ? { viewportTransform } : {}),
    canvasWidth: numberOr(value.canvasWidth, defaults.canvasWidth),
    canvasHeight: numberOr(value.canvasHeight, defaults.canvasHeight),
    backgroundColorList: stringList(
      value.backgroundColorList,
      defaults.backgroundColorList.length
        ? defaults.backgroundColorList
        : DEFAULT_BACKGROUND_COLOR_LIST
    ),
    currentBackgroundColor: numberOr(
      value.currentBackgroundColor,
      defaults.currentBackgroundColor
    ),
    backgroundImage:
      typeof value.backgroundImage === 'string' ? value.backgroundImage : '',
    backgroundImageOpacity: numberOr(
      value.backgroundImageOpacity,
      defaults.backgroundImageOpacity
    ),
    backgroundSort: stringList(
      value.backgroundSort,
      defaults.backgroundSort.length
        ? defaults.backgroundSort
        : DEFAULT_BACKGROUND_SORT
    ),
    boardData: value.boardData
  }
}

const reassignObjectIds = (boardData: Record<string, unknown>) => {
  const copy = JSON.parse(JSON.stringify(boardData)) as Record<string, unknown>
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (!isRecord(value)) {
      return
    }
    if (typeof value.id === 'string') {
      value.id = uuidv4()
    }
    Object.values(value).forEach(visit)
  }
  visit(copy)
  return copy
}

/**
 * Build an independent board from a template. The template cache is not mutated,
 * and every serialized object id is replaced.
 */
export const boardFromTemplate = (
  template: BoardTemplate,
  title: string
): IFile => {
  const file = createDefaultFile(uuidv4(), title.trim())
  return {
    ...file,
    boardVersion: template.boardVersion || BOARD_VERSION,
    zoom: template.zoom,
    ...(template.viewportTransform
      ? { viewportTransform: [...template.viewportTransform] }
      : {}),
    canvasWidth: template.canvasWidth,
    canvasHeight: template.canvasHeight,
    backgroundColorList: [...template.backgroundColorList],
    currentBackgroundColor: template.currentBackgroundColor,
    backgroundImage: template.backgroundImage,
    backgroundImageOpacity: template.backgroundImageOpacity,
    backgroundSort: [...template.backgroundSort],
    boardData: reassignObjectIds(template.boardData) as IFile['boardData'],
    id: file.id,
    title: file.title,
    contentRevision: 0
  }
}

const readTemplates = async (language: string) => {
  try {
    const indexResponse = await fetch(
      resolveTemplateAsset('templates/index.json')
    )
    if (!indexResponse.ok) {
      console.error('Failed to load template index', indexResponse.status)
      return []
    }
    const names = parseTemplateIndex(await indexResponse.json())
    const loaded = await Promise.all(
      names.map(async (name) => {
        try {
          const response = await fetch(
            resolveTemplateAsset(`templates/${name}`)
          )
          if (!response.ok) {
            console.error('Failed to load template', name, response.status)
            return null
          }
          return parseTemplateDocument(await response.json(), language)
        } catch (error) {
          console.error('Failed to load template', name, error)
          return null
        }
      })
    )
    return loaded.filter((item): item is BoardTemplate => item !== null)
  } catch (error) {
    console.error('Failed to load templates', error)
    return []
  }
}

export const resetTemplateCache = () => {
  templateCache.clear()
}

export const loadTemplates = (language: string) => {
  const cached = templateCache.get(language)
  if (cached) {
    return cached
  }
  const pending = readTemplates(language).then((templates) => {
    if (templates.length === 0) {
      templateCache.delete(language)
    }
    return templates
  })
  templateCache.set(language, pending)
  return pending
}
