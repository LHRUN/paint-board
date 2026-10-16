import { StrokeStyleType, FillStyleType } from '@/constants/shape'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { produce } from 'immer'
import { SHAPE_ELEMENT_CUSTOM_TYPE } from '@/constants'

interface ShapeState {
  currentShapeIcon: string // current shape icon
  shapeIconList: string[] // shape icon list
  strokeStyle: string // shape stroke style
  currentStrokeColor: number // current stroke color
  strokeColorList: string[] // stroke Color list
  strokeWidth: number // stroke width
  currentFillColor: number // current fill color
  fillColorList: string[]
  fillStyle: string // shape fill style
  shapeLinePointCount: number // Number of line segment turning points
}

interface ShapeAction {
  updateCurrentShapeIcon: (shapeIcon: string) => void
  addShapeIcon: (shapeIcon: string) => void
  deleteShapeIcon: (shapeIcon: string) => void
  updateStrokeStyle: (strokeStyle: string) => void
  updateCurrentStrokeColor: (strokeColorIndex: number) => void
  updateStrokeColor: (strokeColor: string, strokeColorIndex: number) => void
  deleteStrokeColor: (strokeColorIndex: number) => void
  updateStrokeWidth: (strokeWidth: number) => void
  updateCurrentFillColor: (fillColorIndex: number) => void
  updateFillColor: (fillColor: string, fillColorIndex: number) => void
  deleteFillColor: (fillColorIndex: number) => void
  updateFillStyle: (fillStyle: string) => void
  updateShapeLinePointCount: (count: number) => void
}

const useShapeStore = create<ShapeState & ShapeAction>()(
  persist(
    (set, get) => ({
      currentShapeIcon: SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_LINE,
      shapeIconList: [
        'MessageCircle',
        'MessageSquare',
        'Cloud',
        'Badge',
        'Heart',
        'Zap',
        'Flame',
        'Moon',
        'Folder',
        'Sparkle',
        'Star',
        'Angry',
        'Annoyed',
        'Laugh',
        'Meh',
        'Frown',
        'Smile'
      ],
      strokeStyle: StrokeStyleType.Solid,
      currentStrokeColor: 0,
      strokeColorList: ['#000000', '#65CC8A', '#FF6363', '#3A59D1'],
      strokeWidth: 3,
      shapeLinePointCount: 3,
      currentFillColor: 0,
      fillColorList: ['#000000', '#65CC8A', '#FF6363', '#3A59D1'],
      fillStyle: FillStyleType.Transparent,
      updateCurrentShapeIcon(shapeIcon) {
        set({
          currentShapeIcon: shapeIcon
        })

        const { strokeStyle } = get()
        if (
          (shapeIcon === SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_LINE ||
            shapeIcon === SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_ARROW_LINE) &&
          strokeStyle === StrokeStyleType.Sketch
        ) {
          set({
            strokeStyle: StrokeStyleType.Solid
          })
        }
      },
      addShapeIcon(shapeIcon) {
        set(
          produce((state) => {
            const findColorIndex = state.shapeIconList.findIndex(
              (item: string) => item === shapeIcon
            )
            if (findColorIndex === -1) {
              state.shapeIconList.push(shapeIcon)
            }
          })
        )
      },
      deleteShapeIcon(shapeIcon) {
        set(
          produce((state) => {
            state.shapeIconList = state.shapeIconList.filter(
              (item: string) => item !== shapeIcon
            )
          })
        )
      },
      updateStrokeStyle(strokeStyle) {
        const { strokeStyle: oldStrokeStyle, fillStyle } = get()
        if (oldStrokeStyle !== strokeStyle) {
          set({
            strokeStyle
          })

          if (
            (fillStyle === FillStyleType.Hachure ||
              fillStyle === FillStyleType.CrossHatch ||
              fillStyle === FillStyleType.Dots) &&
            strokeStyle !== StrokeStyleType.Sketch
          ) {
            set({
              fillStyle: FillStyleType.Transparent
            })
          }
        }
      },
      updateCurrentStrokeColor(colorIndex) {
        set({
          currentStrokeColor: colorIndex
        })
      },
      updateStrokeColor: (color: string, colorIndex: number) => {
        set(
          produce((state) => {
            state.strokeColorList[colorIndex] = color
          })
        )
      },
      deleteStrokeColor(colorIndex) {
        set(
          produce((state) => {
            state.strokeColorList.splice(colorIndex, 1)
          })
        )
      },
      updateStrokeWidth: (strokeWidth) => {
        const oldStrokeWidth = get().strokeWidth
        if (oldStrokeWidth !== strokeWidth) {
          set({
            strokeWidth
          })
        }
      },
      updateShapeLinePointCount(count) {
        const oldCount = get().shapeLinePointCount
        if (count !== oldCount) {
          set({
            shapeLinePointCount: count
          })
        }
      },
      updateCurrentFillColor(colorIndex) {
        set({
          currentFillColor: colorIndex
        })
      },
      updateFillColor(color: string, colorIndex: number) {
        set(
          produce((state) => {
            state.fillColorList[colorIndex] = color
          })
        )
      },
      deleteFillColor(colorIndex) {
        set(
          produce((state) => {
            state.fillColorList.splice(colorIndex, 1)
          })
        )
      },
      updateFillStyle(fillStyle) {
        const oldFillStyle = get().fillStyle
        if (oldFillStyle !== fillStyle) {
          set({
            fillStyle
          })
        }
      }
    }),
    {
      name: 'PAINT-BOARD-SHAPE-STORE'
    }
  )
)

export default useShapeStore
