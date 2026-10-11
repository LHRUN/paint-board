import { DrawShape, DrawStyle } from '@/constants/draw'
import { DrawLineType } from '@/constants/draw'
import { getDrawWidth, getEraserWidth } from '@/core/utils/draw'
import { getStrokeDashArray } from '@/core/element/draw/utils'
import { MATERIAL_TYPE, material } from '@/core/element/draw/material'
import {
  MultiColorType,
  renderMultiColor
} from '@/core/element/draw/multiColor'
import { paintBoard } from '@/core/paintBoard'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { produce } from 'immer'
import { fabric } from 'fabric'
import { reindexDrawColorSelection } from './drawColor'

interface DrawState {
  drawWidth: number // draw brush width
  currentDrawColor: number // current draw brush color
  currentMultiColor: number[]
  drawColors: string[] // draw brush colors
  lineType: string // line type 'solid' | 'dashed' | 'dotted'
  shadowBlur: number // brush shadow blur
  shadowColor: string // brush shadow color
  shadowOffsetX: number // brush shadow offset x
  shadowOffsetY: number // brush shadow offset y
  drawTextValue: string // text draws the content
  drawStyle: string // draw style
  drawShapeCount: number // count of shape mode
  drawShape: string // the shape of the shape mode
  materialType: string // material brush type
  eraserWidth: number // eraser width
  multiColorType: string // 'col' | 'row' | 'circle'
  textFontFamily: string // current text drawing font
  fontStyles: string[] // ['bold', 'italic', 'underLine', 'lineThrough']
}

interface DrawAction {
  updateDrawWidth: (drawWidth: number) => void
  updateCurrentDrawColor: (colorIndex: number) => void
  updateDrawColor: (color: string, colorIndex: number) => void
  deleteDrawColor: (colorIndex: number) => void
  updateLineType: (lineType: string) => void
  updateShadowBlur: (shadowBlur: number) => void
  updateShadowColor: (shadowColor: string) => void
  updateShadowOffsetX: (shadowOffsetX: number) => void
  updateShadowOffsetY: (shadowOffsetY: number) => void
  updateDrawShape: (drawShape: string) => void
  updateDrawStyle: (drawStyle: string) => void
  updateDrawShapeCount: (drawShapeCount: number) => void
  updateDrawTextValue: (drawTextValue: string) => void
  updateMaterialType: (materialType: string) => void
  updateEraserWidth: (eraserWidth: number) => void
  updateMultiColorType: (multiColorType: string) => void
  updateTextFontFamily: (fontFamily: string) => void
  updateFontStyles: (type: string) => void
}

const useDrawStore = create<DrawState & DrawAction>()(
  persist(
    (set, get) => ({
      drawWidth: 10,
      currentDrawColor: 0,
      currentMultiColor: [0, 1],
      drawColors: ['#000000', '#65CC8A', '#FF6363', '#3A59D1'],
      lineType: DrawLineType.Solid,
      shadowBlur: 0,
      shadowColor: '#000000',
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      drawTextValue: 'draw',
      drawStyle: DrawStyle.Basic,
      drawShapeCount: 2,
      materialType: MATERIAL_TYPE.CRAYON,
      drawShape: DrawShape.Bubble,
      eraserWidth: 20,
      multiColorType: MultiColorType.COL,
      textFontFamily: 'Georgia',
      fontStyles: [],
      updateDrawWidth(drawWidth) {
        const { drawWidth: oldDrawWidth, drawStyle } = get()
        if (oldDrawWidth !== drawWidth && paintBoard.canvas) {
          paintBoard.canvas.freeDrawingBrush.width = getDrawWidth(drawWidth)

          set({
            drawWidth
          })

          if (
            [
              DrawStyle.Basic,
              DrawStyle.Material,
              DrawStyle.MultiColor
            ].includes(drawStyle) &&
            paintBoard.canvas?.freeDrawingBrush
          ) {
            paintBoard.canvas.freeDrawingBrush.strokeDashArray =
              getStrokeDashArray()
          }
        }
      },
      updateCurrentDrawColor(colorIndex) {
        const { drawStyle, currentMultiColor, currentDrawColor, drawColors } =
          get()

        // 确保索引在有效范围内
        if (colorIndex < 0 || colorIndex >= drawColors.length) {
          return
        }

        switch (drawStyle) {
          case DrawStyle.MultiColor:
          case DrawStyle.Pixels:
          case DrawStyle.Shape:
            if (currentMultiColor.includes(colorIndex)) {
              if (currentMultiColor.length > 1) {
                set({
                  currentMultiColor: currentMultiColor.filter(
                    (item) => item !== colorIndex
                  )
                })
              }
            } else {
              set({
                currentMultiColor: [...currentMultiColor, colorIndex]
              })
            }
            break
          default:
            if (currentDrawColor === colorIndex) {
              return
            }
            set({
              currentDrawColor: colorIndex
            })
            break
        }
        updateDrawColors()
      },
      updateDrawColor: (color: string, colorIndex: number) => {
        set(
          produce((state) => {
            state.drawColors[colorIndex] = color
          })
        )

        const { currentMultiColor, currentDrawColor } = get()
        if (
          currentMultiColor.includes(colorIndex) ||
          currentDrawColor === colorIndex
        ) {
          updateDrawColors()
        }
      },
      deleteDrawColor(colorIndex) {
        const { drawColors, currentDrawColor, currentMultiColor } = get()
        const next = reindexDrawColorSelection(
          drawColors,
          colorIndex,
          currentDrawColor,
          currentMultiColor
        )
        if (!next) {
          return
        }
        set({
          drawColors: next.drawColors,
          currentDrawColor: next.currentDrawColor,
          currentMultiColor: next.currentMultiColor
        })
        updateDrawColors()
      },
      updateLineType(lineType) {
        const { lineType: oldLineType, drawStyle } = get()
        if (oldLineType !== lineType) {
          set({
            lineType
          })

          if (
            [
              DrawStyle.Basic,
              DrawStyle.Material,
              DrawStyle.MultiColor
            ].includes(drawStyle) &&
            paintBoard.canvas?.freeDrawingBrush
          ) {
            paintBoard.canvas.freeDrawingBrush.strokeDashArray =
              getStrokeDashArray()
          }
        }
      },
      updateShadowBlur: (shadowBlur) => {
        set(() => {
          const freeDrawingBrush = paintBoard?.canvas?.freeDrawingBrush
          const shadow = freeDrawingBrush?.shadow as fabric.Shadow

          if (shadowBlur) {
            if (shadow) {
              shadow.blur = shadowBlur
            } else if (freeDrawingBrush) {
              const { shadowOffsetX, shadowOffsetY, shadowColor } = get()
              freeDrawingBrush.shadow = new fabric.Shadow({
                offsetX: shadowOffsetX,
                offsetY: shadowOffsetY,
                color: shadowColor,
                blur: shadowBlur
              })
            }
          } else if (freeDrawingBrush?.shadow) {
            freeDrawingBrush.shadow = ''
          }

          return { shadowBlur }
        })
      },
      updateShadowColor: (shadowColor) => {
        set(() => {
          const shadow = paintBoard?.canvas?.freeDrawingBrush
            ?.shadow as fabric.Shadow
          if (shadow) {
            shadow.color = shadowColor
          }
          return { shadowColor }
        })
      },
      updateShadowOffsetX: (shadowOffsetX) => {
        set(() => {
          const shadow = paintBoard?.canvas?.freeDrawingBrush
            ?.shadow as fabric.Shadow
          if (shadow) {
            shadow.offsetX = shadowOffsetX
          }
          return { shadowOffsetX }
        })
      },
      updateShadowOffsetY: (shadowOffsetY) => {
        set(() => {
          const shadow = paintBoard?.canvas?.freeDrawingBrush
            ?.shadow as fabric.Shadow
          if (shadow) {
            shadow.offsetY = shadowOffsetY
          }
          return { shadowOffsetY }
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

const updateDrawColors = () => {
  const { drawStyle, currentDrawColor, drawColors } = useDrawStore.getState()

  switch (drawStyle) {
    case DrawStyle.Basic:
      if (paintBoard.canvas) {
        paintBoard.canvas.freeDrawingBrush.color = drawColors[currentDrawColor]
      }
      break
    case DrawStyle.Material:
      material.render({})
      break
    case DrawStyle.MultiColor:
      renderMultiColor({})
      break
    default:
      break
  }
}

export default useDrawStore
