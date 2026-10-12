export const FILE_BLOB_PREFIX = 'paint-board-file:'
export const FILE_LIST_BACKUP_KEY = 'PAINT-BOARD-FILES-BACKUP'

export interface StoredFile {
  id: string
  boardData?: unknown
  backgroundImage?: string
  [key: string]: unknown
}

export interface PersistEnvelope {
  state: {
    currentId?: string
    files: StoredFile[]
    [key: string]: unknown
  }
  version?: number
}

export interface KeyValueDb {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  del(key: string): Promise<void>
}

const blobCache = new Map<string, string>()
const dirtyIds = new Set<string>()

export const fileBlobKey = (id: string) => `${FILE_BLOB_PREFIX}${id}`

export const markFileContentDirty = (id: string) => {
  dirtyIds.add(id)
}

export const resetFilePersistenceCache = () => {
  blobCache.clear()
  dirtyIds.clear()
}

export const heavyFilePayload = (file: StoredFile) => ({
  boardData: file.boardData ?? {},
  backgroundImage:
    typeof file.backgroundImage === 'string' ? file.backgroundImage : ''
})

export const stripFileForList = (file: StoredFile) => {
  const {
    boardData: _boardData,
    backgroundImage: _backgroundImage,
    ...rest
  } = file
  return rest
}

export const isLegacyFileRecord = (file: StoredFile) =>
  Object.prototype.hasOwnProperty.call(file, 'boardData')

const parseEnvelope = (raw: string): PersistEnvelope => {
  const parsed = JSON.parse(raw) as PersistEnvelope
  if (!parsed?.state || !Array.isArray(parsed.state.files)) {
    throw new Error('invalid file list')
  }
  return parsed
}

const stripEnvelope = (envelope: PersistEnvelope): PersistEnvelope => ({
  ...envelope,
  state: {
    ...envelope.state,
    files: envelope.state.files.map(stripFileForList)
  }
})

const mergeFile = (file: StoredFile, blobRaw: string | null): StoredFile => {
  if (!blobRaw) {
    return { ...file, boardData: {}, backgroundImage: '' }
  }
  const heavy = JSON.parse(blobRaw) as {
    boardData?: unknown
    backgroundImage?: string
  }
  return {
    ...file,
    boardData: heavy.boardData ?? {},
    backgroundImage: heavy.backgroundImage ?? ''
  }
}

/**
 * Load the file list. A legacy record still has boardData inline; split it into
 * one key per file and keep the original string as a backup. If splitting throws,
 * the caller keeps the legacy value and stops further writes.
 */
export const readPersistedFiles = async (
  raw: string | null,
  db: KeyValueDb,
  listKey: string
): Promise<string | null> => {
  if (!raw) {
    return null
  }
  const envelope = parseEnvelope(raw)
  const files = envelope.state.files
  if (files.some(isLegacyFileRecord)) {
    for (const file of files) {
      const serialized = JSON.stringify(heavyFilePayload(file))
      await db.set(fileBlobKey(file.id), serialized)
      blobCache.set(file.id, serialized)
    }
    await db.set(FILE_LIST_BACKUP_KEY, raw)
    await db.set(listKey, JSON.stringify(stripEnvelope(envelope)))
    return raw
  }

  const mergedFiles: StoredFile[] = []
  for (const file of files) {
    const blobRaw = await db.get(fileBlobKey(file.id))
    if (blobRaw) {
      blobCache.set(file.id, blobRaw)
    }
    mergedFiles.push(mergeFile(file, blobRaw))
  }
  return JSON.stringify({
    ...envelope,
    state: { ...envelope.state, files: mergedFiles }
  })
}

/**
 * Write drawing data for dirty files only, then store the list without it.
 * Removes blobs for files that are no longer in the list.
 */
export const writePersistedFiles = async (
  listKey: string,
  value: string,
  db: KeyValueDb
): Promise<void> => {
  const envelope = parseEnvelope(value)
  const files = envelope.state.files
  const nextIds = new Set(files.map((file) => file.id))

  for (const cachedId of [...blobCache.keys()]) {
    if (!nextIds.has(cachedId)) {
      await db.del(fileBlobKey(cachedId))
      blobCache.delete(cachedId)
      dirtyIds.delete(cachedId)
    }
  }

  for (const file of files) {
    const mustWrite = dirtyIds.has(file.id) || !blobCache.has(file.id)
    if (!mustWrite) {
      continue
    }
    const serialized = JSON.stringify(heavyFilePayload(file))
    if (blobCache.get(file.id) !== serialized) {
      await db.set(fileBlobKey(file.id), serialized)
      blobCache.set(file.id, serialized)
    }
    dirtyIds.delete(file.id)
  }

  await db.set(listKey, JSON.stringify(stripEnvelope(envelope)))
  await db.del(FILE_LIST_BACKUP_KEY)
}
