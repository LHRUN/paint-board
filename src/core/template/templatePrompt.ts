import { INITIAL_FILE_TITLE } from '@/store/fileModel'
import { FILE_LIST_STORAGE_KEY, fileBlobKey } from '@/store/fileRecord'

export const TEMPLATE_PROMPT_KEY = 'paint-board-template-prompt'

const promptStorage = () =>
  typeof localStorage === 'undefined' ? undefined : localStorage

export const hasSeenTemplatePrompt = (
  storage: Pick<Storage, 'getItem'> | undefined = promptStorage()
) => {
  try {
    return storage?.getItem(TEMPLATE_PROMPT_KEY) === '1'
  } catch (error) {
    console.error('Failed to read template prompt', error)
    return true
  }
}

export const markTemplatePromptSeen = (
  storage: Pick<Storage, 'setItem'> | undefined = promptStorage()
) => {
  try {
    storage?.setItem(TEMPLATE_PROMPT_KEY, '1')
  } catch (error) {
    console.error('Failed to remember template prompt', error)
  }
}

export const shouldOfferTemplatePrompt = ({
  hydrationFailed,
  seen,
  hasPersistedBoards,
  templateCount
}: {
  hydrationFailed: boolean
  seen: boolean
  hasPersistedBoards: boolean
  templateCount: number
}) => !hydrationFailed && !seen && !hasPersistedBoards && templateCount > 0

/**
 * The auto-created first board can be replaced when the user picks a template.
 * Startup may save an empty object list and raise contentRevision without a
 * drawing. A renamed title, a background image, or any object keeps the board.
 */
export const isUntouchedDefaultBoard = (file: {
  title: string
  contentRevision?: number
  backgroundImage?: string
  boardData?: { objects?: unknown }
}) => {
  if (file.title !== INITIAL_FILE_TITLE) {
    return false
  }
  if (file.backgroundImage) {
    return false
  }
  const objects = file.boardData?.objects
  return !Array.isArray(objects) || objects.length === 0
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const objectCount = (boardData: unknown) => {
  if (!isRecord(boardData) || !Array.isArray(boardData.objects)) {
    return 0
  }
  return boardData.objects.length
}

/**
 * A saved list that only contains the auto-created empty board still counts as
 * a first visit. Startup can persist that board before the prompt is shown.
 * Drawn, renamed, or extra boards suppress the prompt.
 */
export const hasPersistedBoardList = async (
  read?: (key: string) => Promise<unknown>
) => {
  try {
    const load = read ?? (await import('idb-keyval')).get
    const raw = await load(FILE_LIST_STORAGE_KEY)
    if (typeof raw !== 'string' || raw.length === 0) {
      return false
    }
    const parsed = JSON.parse(raw) as { state?: { files?: unknown } }
    const files = parsed.state?.files
    if (!Array.isArray(files) || files.length === 0) {
      return false
    }
    if (files.length > 1) {
      return true
    }
    for (const file of files) {
      if (!isRecord(file) || typeof file.id !== 'string') {
        return true
      }
      const title = typeof file.title === 'string' ? file.title : ''
      if (title !== INITIAL_FILE_TITLE || objectCount(file.boardData) > 0) {
        return true
      }
      if (typeof file.backgroundImage === 'string' && file.backgroundImage) {
        return true
      }
      const blobRaw = await load(fileBlobKey(file.id))
      if (typeof blobRaw !== 'string' || blobRaw.length === 0) {
        continue
      }
      const heavy = JSON.parse(blobRaw) as {
        boardData?: unknown
        backgroundImage?: unknown
      }
      if (objectCount(heavy.boardData) > 0) {
        return true
      }
      if (typeof heavy.backgroundImage === 'string' && heavy.backgroundImage) {
        return true
      }
    }
    return false
  } catch (error) {
    console.error('Failed to check saved boards', error)
    return true
  }
}
