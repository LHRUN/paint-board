import { ActionMode } from '@/constants'
import {
  changeAlpha,
  getAlphaFromRgba,
  getColorFormat,
  hexToRgba
} from '@/utils/common/color'
import { paintBoard } from '@/utils/paintBoard'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BoardState {
  mode: string
  language: string
  backgroundColor: string
  backgroundOpacity: number
}

interface BoardAction {
  updateMode: (mode: string) => void
  updateLanguage: (language: string) => void
  initBackground: (canvas: fabric.Canvas) => void
  updateBackgroundColor: (color: string) => void
  updateBackgroundOpacity: (opacity: number) => void
}

const initLanguage = ['en', 'en-US', 'en-us'].includes(navigator.language)
  ? 'en'
  : 'zh'

const useBoardStore = create<BoardState & BoardAction>()(
  persist(
    (set, get) => ({
      mode: ActionMode.DRAW,
      language: initLanguage,
      backgroundColor: 'rgba(255, 255, 255, 1)',
      backgroundOpacity: 1,
      updateMode: (mode) => {
        const oldMode = get().mode
        if (oldMode !== mode) {
          paintBoard.handleMode(mode)
          set({
            mode
          })
        }
      },
      updateLanguage(language) {
        set({
          language
        })
      },
      initBackground: (canvas) => {
        const backgroundColor = canvas?.backgroundColor
        if (backgroundColor && typeof backgroundColor === 'string') {
          const type = getColorFormat(backgroundColor)
          if (type === 'hex') {
            const color = hexToRgba(backgroundColor)
            const opacity = getAlphaFromRgba(color)
            set({
              backgroundColor: color,
              backgroundOpacity: opacity
            })
          } else if (type === 'rgba') {
            const opacity = getAlphaFromRgba(backgroundColor)
            set({
              backgroundColor: backgroundColor,
              backgroundOpacity: opacity
            })
          }
        } else {
          canvas.backgroundColor = 'rgba(255, 255, 255, 1)'
        }
      },
      updateBackgroundColor: (color) => {
        const canvas = paintBoard.canvas
        if (canvas && color !== canvas?.backgroundColor) {
          set((state) => {
            const bgColor = hexToRgba(color, state.backgroundOpacity)
            canvas.backgroundColor = bgColor
            return {
              backgroundColor: bgColor
            }
          })
        }
      },
      updateBackgroundOpacity: (opacity) => {
        set((state) => {
          const canvas = paintBoard.canvas
          if (canvas && opacity !== state.backgroundOpacity) {
            const newColor = changeAlpha(state.backgroundColor, opacity)
            canvas.backgroundColor = newColor
            return {
              backgroundOpacity: opacity,
              backgroundColor: newColor
            }
          }
          return {}
        })
      }
    }),
    {
      name: 'PAINT-BOARD-STORE' //存储的名称
    }
  )
)
export default useBoardStore
