import { v4 as uuidv4 } from 'uuid'

export const DEFAULT_BACKGROUND_SORT = ['camera', 'image', 'color']
export const DEFAULT_BACKGROUND_COLOR_LIST = [
  'rgba(102, 204, 138, 0.4)',
  'linear-gradient(60deg, rgba(172,233,194,1) 0%, RGBA(23, 185, 48, 0.8) 49%, rgba(102,204,138,1) 100%)',
  'radial-gradient(circle, rgba(160,186,165,1) 0%, rgba(79,190,119,1) 35%, RGB(20, 78, 44) 100%)'
]

export const BOARD_VERSION = '3.1.0'
export const INITIAL_FILE_TITLE = 'paint-board'

/**
 * Every board keeps its full drawing JSON in memory, and imported images
 * can be as large as 2048px on the long edge. Twenty boards is enough for
 * normal use without letting the list, thumbnails, or IndexedDB grow unbounded.
 * Boards already saved above this limit stay available; only new ones are blocked.
 */
export const MAX_BOARD_COUNT = 20

export const canAddBoard = (count: number, max = MAX_BOARD_COUNT) => count < max

export const createDefaultFile = (
  id: string = uuidv4(),
  title: string = 'empty title'
) => ({
  id,
  title,
  boardVersion: BOARD_VERSION,
  boardData: {},
  zoom: 1,
  canvasWidth: 1,
  canvasHeight: 1,
  backgroundColorList: [...DEFAULT_BACKGROUND_COLOR_LIST],
  currentBackgroundColor: -1,
  backgroundImage: '',
  backgroundImageOpacity: 1,
  backgroundSort: [...DEFAULT_BACKGROUND_SORT],
  contentRevision: 0
})
