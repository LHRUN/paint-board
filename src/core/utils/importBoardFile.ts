import { v4 as uuidv4 } from 'uuid'
import {
  BOARD_VERSION,
  DEFAULT_BACKGROUND_COLOR_LIST,
  DEFAULT_BACKGROUND_SORT,
  createDefaultFile
} from '@/store/fileModel'

export interface ImportedBoardFile {
  id: string
  title: string
  boardVersion: string
  boardData: Record<string, unknown>
  zoom: number
  canvasWidth: number
  canvasHeight: number
  backgroundColorList: string[]
  currentBackgroundColor: number
  backgroundImage: string
  backgroundImageOpacity: number
  backgroundSort: string[]
  viewportTransform?: number[]
  contentRevision: number
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const finiteNumber = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined

/**
 * Fabric stores pan and zoom together in a 6-number viewport matrix.
 * A short or non-numeric list is ignored so a bad export cannot move the canvas.
 */
const viewportOf = (value: unknown) => {
  if (!Array.isArray(value) || value.length !== 6) {
    return undefined
  }
  if (
    !value.every((item) => typeof item === 'number' && Number.isFinite(item))
  ) {
    return undefined
  }
  return [...value]
}

export const parseImportedBoardFile = (
  raw: string
): ImportedBoardFile | null => {
  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return null
  }
  if (!isRecord(json) || !isRecord(json.boardData)) {
    return null
  }
  if (typeof json.title !== 'string' || json.title.length === 0) {
    return null
  }

  const { background, backgroundImage, ...otherBoardData } = json.boardData
  const backgroundImageRecord = isRecord(backgroundImage)
    ? backgroundImage
    : null

  let backgroundColorList = [...DEFAULT_BACKGROUND_COLOR_LIST]
  let currentBackgroundColor = -1
  if (typeof background === 'string' && background) {
    backgroundColorList = [background]
    currentBackgroundColor = 0
  } else if (Array.isArray(json.backgroundColorList)) {
    backgroundColorList = json.backgroundColorList.filter(
      (color): color is string => typeof color === 'string'
    )
    currentBackgroundColor =
      typeof json.currentBackgroundColor === 'number'
        ? json.currentBackgroundColor
        : -1
  }

  const backgroundImageSrc =
    typeof json.backgroundImage === 'string'
      ? json.backgroundImage
      : typeof backgroundImageRecord?.src === 'string'
      ? backgroundImageRecord.src
      : ''

  const zoom = finiteNumber(json.zoom)
  const viewportTransform = viewportOf(json.viewportTransform)

  return {
    ...createDefaultFile(uuidv4(), json.title),
    boardVersion:
      typeof json.boardVersion === 'string' ? json.boardVersion : BOARD_VERSION,
    boardData: otherBoardData,
    ...(zoom !== undefined && zoom > 0 ? { zoom } : {}),
    ...(viewportTransform ? { viewportTransform } : {}),
    canvasWidth: typeof json.canvasWidth === 'number' ? json.canvasWidth : 1,
    canvasHeight: typeof json.canvasHeight === 'number' ? json.canvasHeight : 1,
    backgroundColorList,
    currentBackgroundColor,
    backgroundImage: backgroundImageSrc,
    backgroundImageOpacity:
      typeof json.backgroundImageOpacity === 'number'
        ? json.backgroundImageOpacity
        : 1,
    backgroundSort: Array.isArray(json.backgroundSort)
      ? json.backgroundSort.filter(
          (item): item is string => typeof item === 'string'
        )
      : [...DEFAULT_BACKGROUND_SORT],
    contentRevision: 0
  }
}
