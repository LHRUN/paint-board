import { create } from 'zustand'
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'
import { get, set, del } from 'idb-keyval'
import { v4 as uuidv4 } from 'uuid'
import { produce } from 'immer'
import useBoardStore from './board'

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value)
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name)
  }
}

export interface IBoardData {
  version: string // fabric version
  objects: fabric.Object[]
  background: string // canvas background color (rgba)
  backgroundImage: fabric.Image
}

interface IFile {
  id: string // file id
  title: string // file title
  boardVersion: string // paint board version
  zoom: number // current canvas zoom
  viewportTransform?: number[] // current canvas transform
  canvasWidth: number // canvas width
  canvasHeight: number // canvas Height
  boardData?: Partial<IBoardData>
}

interface FileState {
  currentId: string // current file id
  files: IFile[] // file list
}

interface FileAction {
  updateCurrentFile: (newId: string) => void
  updateTitle: (newTitle: string, id: string) => void
  updateZoom: (newZoom: number) => void
  updateTransform: (newTransform: number[]) => void
  updateCanvasWidth: (width: number) => void
  updateCanvasHeight: (height: number) => void
  updateBoardData: (data: Partial<IBoardData>) => void
  addFile: () => void
  deleteFile: () => void
  saveJSON: () => void
  uploadFile: (file: File | undefined) => Promise<boolean>
}

const initId = uuidv4()
export const BOARD_VERSION = '1.4.0'

const useFileStore = create<FileState & FileAction>()(
  persist(
    (set, get) => ({
      currentId: initId,
      files: [
        {
          id: initId,
          title: 'paint-board',
          boardVersion: BOARD_VERSION,
          boardData: {},
          zoom: 1,
          canvasWidth: 1,
          canvasHeight: 1
        }
      ],
      updateCurrentFile(newId) {
        const currentId = get().currentId
        if (newId !== currentId) {
          set({
            currentId: newId
          })
        }
      },
      updateTitle(newTitle, id) {
        const files = get().files
        const updateIndex = files?.findIndex((file) => file.id === id)
        if (files?.[updateIndex]?.title !== newTitle) {
          set(
            produce((state) => {
              state.files[updateIndex].title = newTitle
            })
          )
        }
      },
      updateBoardData(data) {
        const files = get().files
        const updateIndex = files?.findIndex(
          (file) => file.id === get().currentId
        )
        set(
          produce((state) => {
            state.files[updateIndex].boardVersion = BOARD_VERSION
            state.files[updateIndex].boardData = data
          })
        )
      },
      updateZoom(newZoom) {
        const files = get().files
        const updateIndex = files?.findIndex(
          (file) => file.id === get().currentId
        )
        if (updateIndex > -1) {
          set(
            produce((state) => {
              state.files[updateIndex].zoom = newZoom
            })
          )
        }
      },
      updateTransform(newTransform) {
        const files = get().files
        const updateIndex = files?.findIndex(
          (file) => file.id === get().currentId
        )
        if (updateIndex > -1) {
          set(
            produce((state) => {
              state.files[updateIndex].viewportTransform = newTransform
            })
          )
        }
      },
      updateCanvasWidth(width) {
        const files = get().files
        const updateIndex = files?.findIndex(
          (file) => file.id === get().currentId
        )
        if (updateIndex > -1) {
          set(
            produce((state) => {
              state.files[updateIndex].canvasWidth = width
            })
          )
        }
      },
      updateCanvasHeight(height) {
        const files = get().files
        const updateIndex = files?.findIndex(
          (file) => file.id === get().currentId
        )
        if (updateIndex > -1) {
          set(
            produce((state) => {
              state.files[updateIndex].canvasHeight = height
            })
          )
        }
      },
      addFile() {
        const id = uuidv4()
        set(
          produce((state) => {
            state.files.unshift({
              id,
              title: 'empty title',
              boardVersion: BOARD_VERSION,
              boardData: {},
              zoom: 1,
              canvasWidth: useBoardStore.getState().canvasWidth,
              canvasHeight: useBoardStore.getState().canvasHeight
            })
          })
        )
      },
      deleteFile() {
        const files = get().files
        if (files.length > 1) {
          const updateIndex = files?.findIndex(
            (file) => file.id === get().currentId
          )
          set(
            produce((state) => {
              state.files.splice(updateIndex, 1)
              state.currentId = state.files[0].id
            })
          )
        }
      },
      saveJSON() {
        const currentData = get().files?.find(
          (file) => file.id === get().currentId
        )
        if (currentData) {
          const json = JSON.stringify(currentData)
          const blob = new Blob([json], { type: 'application/json' })

          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = 'paint-board.json'

          link.click()
          URL.revokeObjectURL(link.href)
        }
      },
      uploadFile(file) {
        return new Promise((resolve) => {
          if (file) {
            const reader = new FileReader()
            reader.onload = (fEvent) => {
              const data = fEvent.target?.result as string
              let result = false
              if (data) {
                const json = JSON.parse(data)
                if (json?.boardData && json?.title) {
                  const id = uuidv4()
                  set(
                    produce((state) => {
                      state.files.unshift({
                        id,
                        title: json?.title,
                        boardVersion: json?.boardVersion || BOARD_VERSION,
                        boardData: json?.boardData,
                        canvasWidth: json?.canvasWidth || 1,
                        canvasHeight: json?.canvasHeight || 1
                      })
                      state.currentId = state.files[0].id
                    })
                  )
                  result = true
                }
              }
              resolve(result)
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
      name: 'PAINT-BOARD-FILES',
      storage: createJSONStorage(() => storage)
    }
  )
)

export default useFileStore
