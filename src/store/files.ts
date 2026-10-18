import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { v4 as uuidv4 } from 'uuid'
import { produce } from 'immer'
import { useMemo } from 'react'

import useBoardStore from './board'
import { paintBoard } from '@/core/paintBoard'
import { ActionMode } from '@/constants'
import { parseImportedBoardFile } from '@/core/utils/importBoardFile'
import {
  shouldPersistFiles,
  markFileHydrationFailed,
  markFilePersistFailed,
  waitForHydration
} from './fileHydration'
import {
  readPersistedFiles,
  writePersistedFiles,
  markFileContentDirty,
  FILE_LIST_STORAGE_KEY
} from './fileRecord'
import {
  BOARD_VERSION,
  DEFAULT_BACKGROUND_SORT,
  INITIAL_FILE_TITLE,
  canAddBoard,
  createDefaultFile
} from './fileModel'
import { deleteThumbnail } from '@/core/thumbnail/thumbnailCache'
import { boardDataChanged, nextContentRevision } from './boardRevision'
import { boardTitleIssue, idsToDelete } from './boardRules'

export {
  BOARD_VERSION,
  DEFAULT_BACKGROUND_COLOR_LIST,
  DEFAULT_BACKGROUND_SORT,
  MAX_BOARD_COUNT,
  canAddBoard
} from './fileModel'

const fileDb = {
  get: async (key: string) => (await get(key)) || null,
  set: (key: string, value: string) => set(key, value),
  del: (key: string) => del(key)
}

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await readPersistedFiles((await get(name)) || null, fileDb, name)
    } catch (error) {
      markFileHydrationFailed()
      throw error
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (!shouldPersistFiles()) {
      return
    }
    try {
      await writePersistedFiles(name, value, fileDb)
    } catch (error) {
      console.error('Failed to persist paint board file', error)
      markFilePersistFailed()
    }
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name)
  }
}

export interface IBoardData {
  version: string // fabric version
  objects: fabric.Object[]
  background: string // canvas background color ( rgba)
  backgroundImage: fabric.Image
}

export interface IFile {
  id: string // file id
  title: string // file title
  boardVersion: string // paint board version
  zoom: number // current canvas zoom
  viewportTransform?: number[] // current canvas transform
  canvasWidth: number // canvas width
  canvasHeight: number // canvas Height
  backgroundColorList: string[] // canvas background color
  currentBackgroundColor: number
  backgroundImage: string // canvas background image
  backgroundImageOpacity: number // canvas background image opacity
  backgroundSort: string[]
  boardData?: Partial<IBoardData>
  contentRevision?: number
}

interface FileState {
  currentId: string // current file id
  files: IFile[] // file list
}

interface FileAction {
  updateCurrentFile: (newId: string) => void
  updateFileTitle: (newTitle: string, id: string) => void
  updateZoom: (newZoom: number, fileId?: string) => void
  updateTransform: (newTransform: number[], fileId?: string) => void
  updateCanvasWidth: (width: number, fileId?: string) => void
  updateCanvasHeight: (height: number, fileId?: string) => void
  updateBackgroundColor: (colorIndex: number, color: string) => void
  updateCurrentBackgroundColor: (colorIndex: number) => void
  deleteBackgroundColor: (colorIndex: number) => void
  updateBackgroundImage: (image: string, fileId?: string) => void
  updateBackgroundImageOpacity: (opacity: number) => void
  updateBackgroundSort: (oldIndex?: number, newIndex?: number) => void
  updateBoardData: (data: Partial<IBoardData>, fileId?: string) => void
  addFile: (title: string) => boolean
  addBoard: (file: IFile, options?: { ignoreTitleOf?: string }) => boolean
  deleteFile: (fileId: string) => void
  deleteFiles: (ids: string[]) => void
  saveJSON: () => void
  uploadFile: (file: File | undefined) => Promise<boolean>
}

const initId = uuidv4()

const findFileIndex = (files: IFile[], fileId: string): number => {
  return files.findIndex((file) => file.id === fileId)
}

const updateFileById = (
  get: () => FileState & FileAction,
  set: (fn: any) => void,
  fileId: string,
  updateFn: (file: IFile, index: number) => void,
  beforeUpdate?: () => void
) => {
  const { files } = get()
  const updateIndex = findFileIndex(files, fileId)
  if (updateIndex > -1) {
    beforeUpdate?.()
    set(
      produce((state: FileState & FileAction) => {
        updateFn(state.files[updateIndex], updateIndex)
      })
    )
  }
}

/** Thumbnails redraw only when drawn elements change. */
const bumpContentRevision = (file: IFile) => {
  file.contentRevision = nextContentRevision(file.contentRevision, true)
}

const updateCurrentFile = (
  get: () => FileState & FileAction,
  set: (fn: any) => void,
  updateFn: (file: IFile, index: number) => void,
  beforeUpdate?: () => void
) => {
  updateFileById(get, set, get().currentId, updateFn, beforeUpdate)
}

const useFileStore = create<FileState & FileAction>()(
  persist(
    (set, get) => ({
      currentId: initId,
      files: [createDefaultFile(initId, INITIAL_FILE_TITLE)],
      updateCurrentFile(newId) {
        const currentId = get().currentId
        if (newId !== currentId) {
          set({
            currentId: newId
          })
        }
      },
      updateFileTitle(newTitle, id) {
        const files = get().files
        const current = files.find((file) => file.id === id)
        if (!current) {
          return
        }
        if (
          boardTitleIssue(
            newTitle,
            files.map((file) => file.title),
            current.title
          )
        ) {
          return
        }
        const title = newTitle.trim()
        if (current.title === title) {
          return
        }
        const updateIndex = findFileIndex(files, id)
        set(
          produce((state) => {
            state.files[updateIndex].title = title
          })
        )
      },
      updateBoardData(data, fileId) {
        const targetId = fileId || get().currentId
        const current = get().files.find((file) => file.id === targetId)
        if (!current || !boardDataChanged(current.boardData, data)) {
          return
        }
        markFileContentDirty(targetId)
        updateFileById(get, set, targetId, (file) => {
          file.boardVersion = BOARD_VERSION
          file.boardData = data
          bumpContentRevision(file)
        })
      },
      updateZoom(newZoom, fileId) {
        updateFileById(get, set, fileId || get().currentId, (file) => {
          file.zoom = newZoom
        })
      },
      updateTransform(newTransform, fileId) {
        updateFileById(get, set, fileId || get().currentId, (file) => {
          file.viewportTransform = newTransform
        })
      },
      updateCanvasWidth(width, fileId) {
        const targetId = fileId || get().currentId
        const current = get().files.find((file) => file.id === targetId)
        if (!current || current.canvasWidth === width) {
          return
        }
        updateFileById(
          get,
          set,
          targetId,
          (file) => {
            file.canvasWidth = width
          },
          () => paintBoard.updateCanvasWidth(width, targetId)
        )
      },
      updateCanvasHeight(height, fileId) {
        const targetId = fileId || get().currentId
        const current = get().files.find((file) => file.id === targetId)
        if (!current || current.canvasHeight === height) {
          return
        }
        updateFileById(
          get,
          set,
          targetId,
          (file) => {
            file.canvasHeight = height
          },
          () => paintBoard.updateCanvasHeight(height, targetId)
        )
      },
      updateCurrentBackgroundColor(colorIndex) {
        updateCurrentFile(get, set, (file) => {
          const next =
            colorIndex === file.currentBackgroundColor ? -1 : colorIndex
          if (next === file.currentBackgroundColor) {
            return
          }
          file.currentBackgroundColor = next
        })
      },
      updateBackgroundColor(colorIndex, color) {
        updateCurrentFile(get, set, (file) => {
          if (file.backgroundColorList[colorIndex] === color) {
            return
          }
          file.backgroundColorList[colorIndex] = color
        })
      },
      deleteBackgroundColor(colorIndex) {
        updateCurrentFile(get, set, (file) => {
          if (colorIndex === file.currentBackgroundColor) {
            file.currentBackgroundColor = -1
          }
          file.backgroundColorList.splice(colorIndex, 1)
        })
      },
      updateBackgroundImage(image, fileId) {
        const targetId = fileId || get().currentId
        const current = get().files.find((file) => file.id === targetId)
        if (!current || current.backgroundImage === image) {
          return
        }
        markFileContentDirty(targetId)
        updateFileById(get, set, targetId, (file) => {
          file.backgroundImage = image
        })
      },
      updateBackgroundImageOpacity(opacity) {
        updateCurrentFile(get, set, (file) => {
          if (file.backgroundImageOpacity === opacity) {
            return
          }
          file.backgroundImageOpacity = opacity
        })
      },
      updateBackgroundSort(oldIndex, newIndex) {
        if (
          typeof oldIndex !== 'number' ||
          typeof newIndex !== 'number' ||
          oldIndex === newIndex
        ) {
          return
        }
        updateCurrentFile(get, set, (file) => {
          const backgroundSort = file.backgroundSort || [
            ...DEFAULT_BACKGROUND_SORT
          ]
          const [removed] = backgroundSort.splice(oldIndex, 1)
          backgroundSort.splice(newIndex, 0, removed)
          file.backgroundSort = backgroundSort
        })
      },
      addFile(title) {
        const files = get().files
        if (
          boardTitleIssue(
            title,
            files.map((file) => file.title)
          ) ||
          !canAddBoard(files.length)
        ) {
          return false
        }
        set(
          produce((state) => {
            state.files.unshift(createDefaultFile(uuidv4(), title.trim()))
          })
        )
        return true
      },
      addBoard(file, options) {
        const files = get().files
        const ignored = options?.ignoreTitleOf
          ? files.find((item) => item.id === options.ignoreTitleOf)
          : undefined
        if (
          boardTitleIssue(
            file.title,
            files.map((item) => item.title),
            ignored?.title
          ) ||
          !canAddBoard(files.length) ||
          files.some((item) => item.id === file.id)
        ) {
          return false
        }
        let next: IFile
        try {
          next = JSON.parse(JSON.stringify(file)) as IFile
        } catch (error) {
          console.error('Failed to copy board', error)
          return false
        }
        next.title = file.title.trim()
        next.contentRevision = 0
        set(
          produce((state) => {
            state.files.unshift(next)
          })
        )
        return true
      },
      deleteFile(fileId) {
        get().deleteFiles([fileId])
      },
      deleteFiles(ids) {
        const targets = idsToDelete(get().files, ids, get().currentId)
        if (targets.length === 0) {
          return
        }
        const remove = new Set(targets)
        const deletingCurrent = remove.has(get().currentId)
        set(
          produce((state: FileState) => {
            state.files = state.files.filter((file) => !remove.has(file.id))
            if (remove.has(state.currentId) && state.files[0]) {
              state.currentId = state.files[0].id
            }
          })
        )

        if (deletingCurrent) {
          paintBoard.discardAndLoad(get().currentId)
          useBoardStore.getState().updateMode(ActionMode.DRAW)
        }
        targets.forEach((id) => {
          void deleteThumbnail(id)
        })
      },
      saveJSON() {
        const { files, currentId } = get()
        const currentData = files.find((file) => file.id === currentId)

        if (!currentData) {
          console.warn('No current file to save')
          return
        }

        try {
          const json = JSON.stringify(currentData)
          const blob = new Blob([json], { type: 'application/json' })
          const link = document.createElement('a')

          link.href = URL.createObjectURL(blob)
          link.download = `${currentData.title || 'paint-board'}.json`
          link.click()

          URL.revokeObjectURL(link.href)
        } catch (error) {
          console.error('Failed to save JSON:', error)
        }
      },
      uploadFile(file) {
        return new Promise((resolve) => {
          if (!canAddBoard(get().files.length)) {
            resolve(false)
            return
          }
          if (file) {
            const reader = new FileReader()
            reader.onload = (fEvent) => {
              const data = fEvent.target?.result
              if (typeof data !== 'string') {
                resolve(false)
                return
              }
              const imported = parseImportedBoardFile(data)
              if (!imported) {
                resolve(false)
                return
              }

              if (!canAddBoard(get().files.length)) {
                resolve(false)
                return
              }
              paintBoard.prepareForFileReplacement()
              const newFile: IFile = {
                ...imported,
                boardData: imported.boardData as IFile['boardData'],
                contentRevision: 0
              }
              set(
                produce((state) => {
                  state.files.unshift(newFile)
                  state.currentId = newFile.id
                })
              )
              resolve(true)
            }
            reader.onerror = (error) => {
              console.log('reader fail', error)
              resolve(false)
            }
            reader.readAsText(file)
          } else {
            resolve(false)
          }
        })
      }
    }),
    {
      name: FILE_LIST_STORAGE_KEY,
      storage: createJSONStorage(() => storage),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          markFileHydrationFailed()
        }
      }
    }
  )
)

export const waitForFilesHydration = () =>
  waitForHydration({
    hasHydrated: () => useFileStore.persist.hasHydrated(),
    onFinishHydration: (listener) =>
      useFileStore.persist.onFinishHydration(listener)
  })

export const useCurrentFile = () => {
  const { files, currentId } = useFileStore()

  const currentFile = useMemo(
    () => files.find((file) => file.id === currentId),
    [files, currentId]
  )

  return currentFile
}

export default useFileStore
