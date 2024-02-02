import { DrawShape, DrawStyle } from '@/constants/draw'
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
  drawWidth: number // draw brush width
  drawColors: string[] // draw brush colors
  shadowWidth: number // brush shadow blur
  shadowColor: string // brush shadow color
  drawTextValue: string // text draws the content
  drawStyle: string // draw style
  drawShapeCount: number // count of shape mode
  drawShape: string // the shape of the shape mode
  materialType: string // material brush type
  eraserWidth: number // eraser width
  multiColorType: string // 'col' | 'row' | 'circle'
  textFontFamily: string // current text drawing font
  openAutoDraw: boolean // autodraw toggle state
  fontStyles: string[] // ['bold', 'italic', 'underLine', 'lineThrough']
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
  updateAutoDrawState: () => void
  updateFontStyles: (type: string) => void
}

const useDrawStore = create<DrawState & DrawAction>()(
  persist(
    (set, get) => ({
      drawWidth: 10,
      drawColors: ['#000000'],
      shadowWidth: 0,
      shadowColor: '#000000',
      drawTextValue: 'draw',
      drawStyle: DrawStyle.Basic,
      drawShapeCount: 2,
      materialType: MATERIAL_TYPE.CRAYON,
      drawShape: DrawShape.Bubble,
      eraserWidth: 20,
      multiColorType: MultiColorType.COL,
      textFontFamily: 'Georgia',
      openAutoDraw: false,
      fontStyles: [],
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
            case DrawStyle.Basic:
              if (paintBoard.canvas) {
                paintBoard.canvas.freeDrawingBrush.color = drawColors[0]
              }
              break
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
      },
      updateAutoDrawState() {
        const newOpenAutoDraw = !get().openAutoDraw
        set({
          openAutoDraw: newOpenAutoDraw
        })
      },
      updateFontStyles(type) {
        const fontStyles = [...get().fontStyles]
        const typeIndex = fontStyles.findIndex((item) => item === type)
        if (typeIndex !== -1) {
          fontStyles.splice(typeIndex, 1)
        } else {
          fontStyles.push(type)
        }
        set({
          fontStyles
        })
      }
    }),
    {
      name: 'PAINT-BOARD-DRAW-STORE'
    }
  )
)

export default useDrawStore
