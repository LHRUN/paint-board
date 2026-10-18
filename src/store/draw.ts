import { DrawShape, DrawStyle } from '@/constants/draw'
import { DrawLineType } from '@/constants/draw'
import { getDrawWidth, getEraserWidth } from '@/core/utils/draw'
import { getStrokeDashArray } from '@/core/element/draw/utils'
import { MATERIAL_TYPE, material } from '@/core/element/draw/material'
import {
  MultiColorType,
  renderMultiColor
} from '@/core/element/draw/multiColor'
import { shouldApplyMultiColorBrush } from '@/core/element/draw/multiColorBrush'
import { paintBoard } from '@/core/paintBoard'
import useBoardStore from '@/store/board'
import {
  DEFAULT_TEXT_COLORS,
  TEXT_COLOR_LIMIT
} from '@/core/element/text/textColor'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { produce } from 'immer'
import { fabric } from 'fabric'
import { reindexDrawColorSelection } from './drawColor'
import {
  DEFAULT_FREEHAND_STROKE_COLOR_INDEX,
  DEFAULT_FREEHAND_STROKE_COLORS,
  FREEHAND_STROKE_COLOR_LIMIT
} from './freehandStrokeColor'

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
  freehandThinning: number
  freehandSmoothing: number
  freehandStreamline: number
  freehandStartTaper: number
  freehandEndTaper: number
  freehandStrokeColors: string[]
  currentFreehandStrokeColor: number
  freehandStrokeWidth: number
  fontStyles: string[] // ['bold', 'italic', 'underLine', 'lineThrough']
  textColors: string[] // text palette, separate from brush colors
  currentTextColor: number // swatch used for the next new text
}

interface DrawAction {
  updateDrawWidth: (drawWidth: number) => void
  updateCurrentDrawColor: (colorIndex: number) => void
  focusDrawColor: (colorIndex: number) => void
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
  updateFreehandThinning: (value: number) => void
  updateFreehandSmoothing: (value: number) => void
  updateFreehandStreamline: (value: number) => void
  updateFreehandStartTaper: (value: number) => void
  updateFreehandEndTaper: (value: number) => void
  updateCurrentFreehandStrokeColor: (colorIndex: number) => void
  updateFreehandStrokeColor: (color: string, colorIndex: number) => void
  deleteFreehandStrokeColor: (colorIndex: number) => void
  updateFreehandStrokeWidth: (value: number) => void
  updateFontStyles: (type: string) => void
  updateCurrentTextColor: (colorIndex: number) => void
  updateTextColor: (color: string, colorIndex: number) => void
  deleteTextColor: (colorIndex: number) => void
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
      freehandThinning: 0.5,
      freehandSmoothing: 0.5,
      freehandStreamline: 0.5,
      freehandStartTaper: 0,
      freehandEndTaper: 20,
      freehandStrokeColors: [...DEFAULT_FREEHAND_STROKE_COLORS],
      currentFreehandStrokeColor: DEFAULT_FREEHAND_STROKE_COLOR_INDEX,
      freehandStrokeWidth: 2,
      fontStyles: [],
      textColors: [...DEFAULT_TEXT_COLORS],
      currentTextColor: 0,
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
      focusDrawColor(colorIndex) {
        const { drawColors, currentDrawColor } = get()
        if (
          colorIndex < 0 ||
          colorIndex >= drawColors.length ||
          currentDrawColor === colorIndex
        ) {
          return
        }
        set({ currentDrawColor: colorIndex })
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
      updateFreehandThinning(value) {
        set({ freehandThinning: value })
      },
      updateFreehandSmoothing(value) {
        set({ freehandSmoothing: value })
      },
      updateFreehandStreamline(value) {
        set({ freehandStreamline: value })
      },
      updateFreehandStartTaper(value) {
        set({ freehandStartTaper: value })
      },
      updateFreehandEndTaper(value) {
        set({ freehandEndTaper: value })
      },
      updateCurrentFreehandStrokeColor(colorIndex) {
        const { freehandStrokeColors, currentFreehandStrokeColor } = get()
        if (
          colorIndex < 0 ||
          colorIndex >= freehandStrokeColors.length ||
          currentFreehandStrokeColor === colorIndex
        ) {
          return
        }
        set({ currentFreehandStrokeColor: colorIndex })
      },
      updateFreehandStrokeColor(color, colorIndex) {
        const { freehandStrokeColors } = get()
        if (colorIndex < 0 || colorIndex > freehandStrokeColors.length) {
          return
        }
        if (colorIndex === freehandStrokeColors.length) {
          if (freehandStrokeColors.length >= FREEHAND_STROKE_COLOR_LIMIT) {
            return
          }
          set({ freehandStrokeColors: [...freehandStrokeColors, color] })
          return
        }
        set(
          produce((state) => {
            state.freehandStrokeColors[colorIndex] = color
          })
        )
      },
      deleteFreehandStrokeColor(colorIndex) {
        const { freehandStrokeColors, currentFreehandStrokeColor } = get()
        const next = reindexDrawColorSelection(
          freehandStrokeColors,
          colorIndex,
          currentFreehandStrokeColor,
          [currentFreehandStrokeColor]
        )
        if (!next) {
          return
        }
        set({
          freehandStrokeColors: next.drawColors,
          currentFreehandStrokeColor: next.currentDrawColor
        })
      },
      updateFreehandStrokeWidth(value) {
        set({ freehandStrokeWidth: value })
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
      },
      updateCurrentTextColor(colorIndex) {
        const { textColors, currentTextColor } = get()
        if (
          colorIndex < 0 ||
          colorIndex >= textColors.length ||
          currentTextColor === colorIndex
        ) {
          return
        }
        set({ currentTextColor: colorIndex })
      },
      updateTextColor(color, colorIndex) {
        const { textColors } = get()
        if (colorIndex < 0 || colorIndex > textColors.length) {
          return
        }
        if (colorIndex === textColors.length) {
          if (textColors.length >= TEXT_COLOR_LIMIT) {
            return
          }
          set({ textColors: [...textColors, color] })
          return
        }
        set(
          produce((state) => {
            state.textColors[colorIndex] = color
          })
        )
      },
      deleteTextColor(colorIndex) {
        const { textColors, currentTextColor } = get()
        const next = reindexDrawColorSelection(
          textColors,
          colorIndex,
          currentTextColor,
          [currentTextColor]
        )
        if (!next) {
          return
        }
        set({
          textColors: next.drawColors,
          currentTextColor: next.currentDrawColor
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
      if (!shouldApplyMultiColorBrush(useBoardStore.getState().mode)) {
        break
      }
      renderMultiColor({})
      break
    default:
      break
  }
}

export default useDrawStore
