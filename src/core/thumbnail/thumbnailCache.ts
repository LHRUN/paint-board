import { del, get, set } from 'idb-keyval'

export const THUMBNAIL_KEY_PREFIX = 'paint-board-thumb:v2:'
const LEGACY_THUMBNAIL_KEY_PREFIX = 'paint-board-thumb:'

export interface ThumbnailRecord {
  revision: number
  blob?: Blob
  empty?: boolean
}

export interface CachedThumbnail {
  revision: number
  url: string
}

const memory = new Map<string, CachedThumbnail>()
const epochs = new Map<string, number>()
const tokens = new Map<string, number>()
const listeners = new Set<() => void>()

export const thumbnailKey = (id: string) => `${THUMBNAIL_KEY_PREFIX}${id}`

const legacyThumbnailKey = (id: string) => `${LEGACY_THUMBNAIL_KEY_PREFIX}${id}`

const dropLegacyThumbnail = (id: string) => {
  void del(legacyThumbnailKey(id)).catch((error) => {
    console.error('Failed to drop a legacy board thumbnail', error)
  })
}

const epochOf = (id: string) => epochs.get(id) ?? 0

export const subscribeThumbnails = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export const emitThumbnails = () => {
  listeners.forEach((listener) => listener())
}

export const cachedThumbnail = (id: string) => memory.get(id)

export const nextThumbnailToken = (id: string) => {
  const token = (tokens.get(id) ?? 0) + 1
  tokens.set(id, token)
  return token
}

export const isThumbnailToken = (id: string, token: number) =>
  tokens.get(id) === token

export const resetThumbnailMemory = () => {
  memory.forEach((item) => {
    if (item.url) {
      URL.revokeObjectURL(item.url)
    }
  })
  memory.clear()
  epochs.clear()
  tokens.clear()
}

const remember = (id: string, revision: number, blob: Blob | null) => {
  const previous = memory.get(id)
  if (previous?.url) {
    URL.revokeObjectURL(previous.url)
  }
  memory.set(id, {
    revision,
    url: blob ? URL.createObjectURL(blob) : ''
  })
  emitThumbnails()
}

export const hydrateThumbnail = async (id: string) => {
  const existing = memory.get(id)
  if (existing) {
    return existing
  }
  const epoch = epochOf(id)
  try {
    const raw = (await get(thumbnailKey(id))) as
      | Partial<ThumbnailRecord>
      | undefined
    if (epochOf(id) !== epoch) {
      return memory.get(id)
    }
    if (!raw || typeof raw.revision !== 'number') {
      return undefined
    }
    if (!raw.empty && !(raw.blob instanceof Blob)) {
      return undefined
    }
    const current = memory.get(id)
    if (current && current.revision >= raw.revision) {
      return current
    }
    if (epochOf(id) !== epoch) {
      return memory.get(id)
    }
    remember(id, raw.revision, raw.empty ? null : (raw.blob as Blob))
    return memory.get(id)
  } catch (error) {
    console.error('Failed to read board thumbnail', error)
    return undefined
  }
}

export const saveThumbnail = async (
  id: string,
  revision: number,
  blob: Blob | null,
  stillCurrent: () => boolean
) => {
  const epoch = epochOf(id)
  if (!stillCurrent() || epochOf(id) !== epoch) {
    return false
  }
  const record: ThumbnailRecord = blob
    ? { revision, blob }
    : { revision, empty: true }
  try {
    await set(thumbnailKey(id), record)
  } catch (error) {
    console.error('Failed to store board thumbnail', error)
    return false
  }
  if (!stillCurrent() || epochOf(id) !== epoch) {
    try {
      await del(thumbnailKey(id))
    } catch (error) {
      console.error('Failed to drop a stale board thumbnail', error)
    }
    return false
  }
  remember(id, revision, blob)
  dropLegacyThumbnail(id)
  return true
}

export const deleteThumbnail = async (id: string) => {
  epochs.set(id, epochOf(id) + 1)
  nextThumbnailToken(id)
  const previous = memory.get(id)
  if (previous) {
    if (previous.url) {
      URL.revokeObjectURL(previous.url)
    }
    memory.delete(id)
    emitThumbnails()
  }
  try {
    await del(thumbnailKey(id))
    await del(legacyThumbnailKey(id))
  } catch (error) {
    console.error('Failed to delete board thumbnail', error)
  }
}
