import { beforeEach, describe, expect, it } from 'vitest'
import {
  FILE_LIST_BACKUP_KEY,
  fileBlobKey,
  markFileContentDirty,
  readPersistedFiles,
  resetFilePersistenceCache,
  writePersistedFiles,
  type KeyValueDb
} from './fileRecord'

const createDb = (): KeyValueDb & { store: Map<string, string> } => {
  const store = new Map<string, string>()
  return {
    store,
    get: async (key) => store.get(key) ?? null,
    set: async (key, value) => {
      store.set(key, value)
    },
    del: async (key) => {
      store.delete(key)
    }
  }
}

const legacy = JSON.stringify({
  state: {
    currentId: 'a',
    files: [
      {
        id: 'a',
        title: 'one',
        boardData: { objects: [{ type: 'rect' }] },
        backgroundImage: 'data:image/png;base64,aaa'
      },
      {
        id: 'b',
        title: 'two',
        boardData: {},
        backgroundImage: ''
      }
    ]
  },
  version: 0
})

describe('file records', () => {
  beforeEach(() => {
    resetFilePersistenceCache()
  })

  it('splits a legacy list and can read it back', async () => {
    const db = createDb()
    const hydrated = await readPersistedFiles(legacy, db, 'list')

    expect(hydrated).toBe(legacy)
    expect(db.store.get(FILE_LIST_BACKUP_KEY)).toBe(legacy)
    expect(JSON.parse(db.store.get(fileBlobKey('a')) || '{}')).toEqual({
      boardData: { objects: [{ type: 'rect' }] },
      backgroundImage: 'data:image/png;base64,aaa'
    })
    const list = JSON.parse(db.store.get('list') || '{}')
    expect(list.state.files[0].boardData).toBeUndefined()
    expect(list.state.files[0].title).toBe('one')

    resetFilePersistenceCache()
    const again = await readPersistedFiles(
      db.store.get('list') || null,
      db,
      'list'
    )
    expect(JSON.parse(again || '{}').state.files[0].boardData).toEqual({
      objects: [{ type: 'rect' }]
    })
  })

  it('writes only the dirty file and drops a removed file blob', async () => {
    const db = createDb()
    await readPersistedFiles(legacy, db, 'list')
    const full = JSON.parse(legacy)
    full.state.files[0].boardData = { objects: [{ type: 'path' }] }
    full.state.files = [full.state.files[0]]
    markFileContentDirty('a')

    await writePersistedFiles('list', JSON.stringify(full), db)

    expect(
      JSON.parse(db.store.get(fileBlobKey('a')) || '{}').boardData
    ).toEqual({
      objects: [{ type: 'path' }]
    })
    expect(db.store.has(fileBlobKey('b'))).toBe(false)
    expect(db.store.has(FILE_LIST_BACKUP_KEY)).toBe(false)
    const writtenList = JSON.parse(db.store.get('list') || '{}')
    expect(writtenList.state.files[0].boardData).toBeUndefined()
  })

  it('keeps the legacy list when splitting fails', async () => {
    const db = createDb()
    db.set = async (key) => {
      if (key === fileBlobKey('b')) {
        throw new Error('quota')
      }
      db.store.set(key, 'x')
    }

    await expect(readPersistedFiles(legacy, db, 'list')).rejects.toThrow(
      'quota'
    )
    expect(db.store.has('list')).toBe(false)
  })
})
