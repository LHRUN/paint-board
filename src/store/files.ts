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
  waitForHydration
} from './fileHydration'
import {
  BOARD_VERSION,
  DEFAULT_BACKGROUND_SORT,
  createDefaultFile
} from './fileModel'

export {
  BOARD_VERSION,
  DEFAULT_BACKGROUND_COLOR_LIST,
  DEFAULT_BACKGROUND_SORT
} from './fileModel'

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    if (!shouldPersistFiles()) {
      return
    }
    await set(name, value)
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
  updateBackgroundImage: (image: string) => void
  updateBackgroundImageOpacity: (opacity: number) => void
  updateBackgroundSort: (oldIndex?: number, newIndex?: number) => void
  updateBoardData: (data: Partial<IBoardData>, fileId?: string) => void
  addFile: () => void
  deleteFile: (fileId: string) => void
  saveJSON: () => void
  uploadFile: (file: File | undefined) => Promise<boolean>
  orderFileList: (oldIndex?: number, newIndex?: number) => void
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
      files: [createDefaultFile(initId, 'paint-board')],
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
        const updateIndex = findFileIndex(files, id)
        if (updateIndex > -1 && files[updateIndex].title !== newTitle) {
          set(
            produce((state) => {
              state.files[updateIndex].title = newTitle
            })
          )
        }
      },
      updateBoardData(data, fileId) {
        const targetId = fileId || get().currentId
        updateFileById(get, set, targetId, (file) => {
          file.boardVersion = BOARD_VERSION
          file.boardData = data
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
          file.currentBackgroundColor =
            colorIndex === file.currentBackgroundColor ? -1 : colorIndex
        })
      },
      updateBackgroundColor(colorIndex, color) {
        updateCurrentFile(get, set, (file) => {
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
      updateBackgroundImage(image) {
        updateCurrentFile(get, set, (file) => {
          file.backgroundImage = image
        })
      },
      updateBackgroundImageOpacity(opacity) {
        updateCurrentFile(get, set, (file) => {
          file.backgroundImageOpacity = opacity
        })
      },
      updateBackgroundSort(oldIndex, newIndex) {
        if (typeof oldIndex !== 'number' || typeof newIndex !== 'number') {
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
      addFile() {
        set(
          produce((state) => {
            state.files.unshift(createDefaultFile())
          })
        )
      },
      deleteFile(fileId) {
        const files = get().files
        if (files.length <= 1) {
          console.warn('Cannot delete the last file')
          return
        }

        const updateIndex = findFileIndex(files, fileId)
        if (updateIndex < 0) {
          return
        }

        const deletingCurrent = get().currentId === fileId
        set(
          produce((state: FileState) => {
            const index = state.files.findIndex((file) => file.id === fileId)
            if (index < 0) {
              return
            }
            state.files.splice(index, 1)
            if (state.currentId === fileId && state.files[0]) {
              state.currentId = state.files[0].id
            }
          })
        )

        if (deletingCurrent) {
          paintBoard.discardAndLoad(get().currentId)
          useBoardStore.getState().updateMode(ActionMode.DRAW)
        }
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

              paintBoard.prepareForFileReplacement()
              const newFile: IFile = {
                ...imported,
                boardData: imported.boardData as IFile['boardData']
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
      },
      orderFileList(oldIndex, newIndex) {
        if (typeof oldIndex !== 'number' || typeof newIndex !== 'number') {
          return
        }

        set(
          produce((state) => {
            const removed = state.files.splice(oldIndex, 1)[0]
            state.files.splice(newIndex, 0, removed)
          })
        )
      }
    }),
    {
      name: 'PAINT-BOARD-FILES',
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
