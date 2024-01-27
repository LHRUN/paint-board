import { fabric } from 'fabric'
import { ActionMode } from '@/constants'
import { DrawType } from '@/constants/draw'
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
  mode: string // operating mode
  drawType: string // draw type
  language: string // i18n language 'zh' 'en'
  canvasWidth: number // canvas width 0.1 ~ 1
  canvasHeight: number // canvas height 0.1 ~ 1
  backgroundColor: string // canvas background color
  backgroundOpacity: number // canvas background opacity
  isObjectCaching: boolean // fabric objectCaching
}

interface BoardAction {
  updateMode: (mode: string) => void
  updateDrawType: (drawType: string) => void
  updateLanguage: (language: string) => void
  initBackground: () => void
  updateCanvasWidth: (width: number) => void
  updateCanvasHeight: (height: number) => void
  updateBackgroundColor: (color: string) => void
  updateBackgroundOpacity: (opacity: number) => void
  updateCacheState: () => void
}

const initLanguage = ['en', 'en-US', 'en-us'].includes(navigator.language)
  ? 'en'
  : 'zh'

const useBoardStore = create<BoardState & BoardAction>()(
  persist(
    (set, get) => ({
      mode: ActionMode.DRAW,
      drawType: DrawType.FreeStyle,
      language: initLanguage,
      canvasWidth: 1,
      canvasHeight: 1,
      backgroundColor: 'rgba(255, 255, 255, 1)',
      backgroundOpacity: 1,
      isObjectCaching: true,
      updateMode: (mode) => {
        const oldMode = get().mode
        if (oldMode !== mode) {
          paintBoard.handleMode(mode)
          set({
            mode
          })
        }
      },
      updateDrawType: (drawType) => {
        const oldDrawType = get().drawType
        if (oldDrawType !== drawType) {
          set({
            drawType
          })
          paintBoard.handleMode()
        }
      },
      updateLanguage(language) {
        set({
          language
        })
      },
      initBackground: () => {
        const backgroundColor = paintBoard?.canvas?.backgroundColor
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
        } else if (paintBoard?.canvas) {
          paintBoard.canvas.backgroundColor = 'rgba(255, 255, 255, 1)'
        }
      },
      updateCanvasWidth: (width) => {
        const oldWidth = get().canvasWidth
        if (oldWidth !== width) {
          set({
            canvasWidth: width
          })
          paintBoard.updateCanvasWidth(width)
        }
      },
      updateCanvasHeight: (height) => {
        const oldHeight = get().canvasHeight
        if (oldHeight !== height) {
          set({
            canvasHeight: height
          })
          paintBoard.updateCanvasHeight(height)
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
      },
      updateCacheState() {
        const oldCacheState = get().isObjectCaching
        set({
          isObjectCaching: !oldCacheState
        })
        fabric.Object.prototype.set({
          objectCaching: useBoardStore.getState().isObjectCaching
        })
        paintBoard?.canvas?.renderAll()
      }
    }),
    {
      name: 'PAINT-BOARD-STORE'
    }
  )
)
export default useBoardStore
