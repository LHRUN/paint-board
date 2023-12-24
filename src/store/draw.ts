import { DrawShape, DrawStyle } from '@/constants'
import {
  getDrawWidth,
  getEraserWidth,
  getShadowWidth
} from '@/utils/common/draw'
import { MATERIAL_TYPE, material } from '@/utils/element/draw/material'
import {
  MultiColorType,
  renderMultiColor
} from '@/utils/element/draw/multiColor'
import { paintBoard } from '@/utils/paintBoard'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DrawState {
  drawWidth: number
  drawColors: string[]
  shadowWidth: number
  shadowColor: string
  drawTextValue: string
  drawStyle: string
  drawShapeCount: number
  drawShape: string
  materialType: string
  eraserWidth: number
  multiColorType: string
  textFontFamily: string
}

interface DrawAction {
  updateDrawWidth: (drawWidth: number) => void
  updateDrawColors: (drawColors: string[]) => void
  updateShadowWidth: (shadowWidth: number) => void
  updateShadowColor: (shadowColor: string) => void
  updateDrawShape: (drawShape: string) => void
  updateDrawStyle: (drawStyle: string) => void
  updateDrawShapeCount: (drawShapeCount: number) => void
  updateDrawTextValue: (drawTextValue: string) => void
  updateMaterialType: (materialType: string) => void
  updateEraserWidth: (eraserWidth: number) => void
  updateMultiColorType: (multiColorType: string) => void
  updateTextFontFamily: (fontFamily: string) => void
}

const useDrawStore = create<DrawState & DrawAction>()(
  persist(
    (set, get) => ({
      drawWidth: 5,
      drawColors: ['#000000'],
      shadowWidth: 15,
      shadowColor: '#000000',
      drawTextValue: 'DrawText',
      drawStyle: DrawStyle.Text,
      drawShapeCount: 1,
      materialType: MATERIAL_TYPE.CRAYON,
      drawShape: DrawShape.Bubble,
      eraserWidth: 20,
      multiColorType: MultiColorType.COL,
      textFontFamily: 'Georgia',
      updateDrawWidth(drawWidth) {
        const oldDrawWidth = get().drawWidth
        if (oldDrawWidth !== drawWidth && paintBoard.canvas) {
          paintBoard.canvas.freeDrawingBrush.width = getDrawWidth(drawWidth)
          set({
            drawWidth
          })
        }
      },
      updateDrawColors: (drawColors) => {
        set((state) => {
          switch (state.drawStyle) {
            case DrawStyle.Material:
              if (state.drawColors[0] !== drawColors[0]) {
                material.render({})
              }
              break
            case DrawStyle.MultiColor:
              renderMultiColor({
                colors: drawColors
              })
              break
            default:
              break
          }
          return { drawColors }
        })
      },
      updateShadowWidth: (shadowWidth) => {
        set(() => {
          if (paintBoard.canvas) {
            ;(paintBoard.canvas.freeDrawingBrush.shadow as fabric.Shadow).blur =
              getShadowWidth(shadowWidth)
          }
          return { shadowWidth }
        })
      },
      updateShadowColor: (shadowColor) => {
        set(() => {
          if (paintBoard.canvas) {
            ;(
              paintBoard.canvas.freeDrawingBrush.shadow as fabric.Shadow
            ).color = shadowColor
          }
          return { shadowColor }
        })
      },
      updateDrawShape: (drawShape) => set({ drawShape }),
      updateDrawStyle: (drawStyle) => {
        set({ drawStyle })
        paintBoard.handleDrawStyle()
      },
      updateDrawShapeCount: (drawShapeCount) => set({ drawShapeCount }),
      updateDrawTextValue: (drawTextValue) => set({ drawTextValue }),
      updateMaterialType(materialType) {
        set((state) => {
          if (state.materialType !== materialType) {
            material.render({
              materialType
            })
          }
          return { materialType }
        })
      },
      updateEraserWidth(eraserWidth) {
        set((state) => {
          if (state.drawWidth !== eraserWidth && paintBoard.canvas) {
            paintBoard.canvas.freeDrawingBrush.width =
              getEraserWidth(eraserWidth)
          }
          return { eraserWidth }
        })
      },
      updateMultiColorType(multiColorType) {
        set((state) => {
          if (state.multiColorType !== multiColorType) {
            renderMultiColor({
              type: multiColorType
            })
          }
          return { multiColorType }
        })
      },
      updateTextFontFamily(fontFamily) {
        set({
          textFontFamily: fontFamily
        })
      }
    }),
    {
      name: 'PAINT-BOARD-DRAW-STORE' //存储的名称
    }
  )
)

export default useDrawStore
