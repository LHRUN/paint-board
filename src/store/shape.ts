import { ShapeBorderType, ShapeFillType, ShapeStyle } from '@/constants/shape'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ShapeState {
  shapeStyle: string // shape style
  borderType: string // shape border type
  borderColor: string // border Color
  borderWidth: number // border width
  fillColor: string // shape fill color
  fillType: string // shape fill type
  shapeLinePointCount: number // Number of line segment turning points
}

interface ShapeAction {
  updateShapeStyle: (shapeStyle: string) => void
  updateBorderType: (borderType: string) => void
  updateBorderColor: (borderColor: string) => void
  updateBorderWidth: (borderWidth: number) => void
  updateFillColor: (fillColor: string) => void
  updateFillType: (fillType: string) => void
  updateShapeLinePointCount: (count: number) => void
}

const useShapeStore = create<ShapeState & ShapeAction>()(
  persist(
    (set, get) => ({
      shapeStyle: ShapeStyle.Rect,
      borderType: ShapeBorderType.Solid,
      borderColor: '#000000',
      borderWidth: 3,
      fillColor: '#FFFFFF',
      fillType: ShapeFillType.Transparent,
      shapeLinePointCount: 3,
      updateShapeStyle(shapeStyle) {
        const oldShapeStyle = get().shapeStyle
        if (oldShapeStyle !== shapeStyle) {
          set({
            shapeStyle
          })
        }
      },
      updateBorderType(borderType) {
        const oldBorderType = get().borderType
        if (oldBorderType !== borderType) {
          set({
            borderType
          })
        }
      },
      updateBorderColor: (borderColor) => {
        const oldBorderColor = get().borderColor
        if (oldBorderColor !== borderColor) {
          set({
            borderColor
          })
        }
      },
      updateBorderWidth: (borderWidth) => {
        const oldBorderWidth = get().borderWidth
        if (oldBorderWidth !== borderWidth) {
          set({
            borderWidth
          })
        }
      },
      updateFillColor: (fillColor) => {
        const oldFillColor = get().fillColor
        if (oldFillColor !== fillColor) {
          set({
            fillColor
          })
        }
      },
      updateFillType(fillType) {
        const oldFillType = get().fillType
        if (oldFillType !== fillType) {
          set({
            fillType
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
      }
    }),
    {
      name: 'PAINT-BOARD-SHAPE-STORE'
    }
  )
)

export default useShapeStore
