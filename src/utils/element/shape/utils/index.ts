import { ShapeBorderType, ShapeFillType } from '@/constants/shape'
import useShapeStore from '@/store/shape'
import { paintBoard } from '@/utils/paintBoard'

export const getShapeBorderWidth = () => {
  let borderWidth = useShapeStore.getState().borderWidth
  const zoom = paintBoard.canvas?.getZoom()
  if (zoom) {
    borderWidth = borderWidth / zoom
  }
  return borderWidth
}

export const getShapeBorder = (base = 5) => {
  const borderType = useShapeStore.getState().borderType

  switch (borderType) {
    case ShapeBorderType.Dashed:
      return [base * 3, base * 2]
    case ShapeBorderType.Dotted:
      return [base, base * 3]
    default:
      return undefined
  }
}

export const getFillStyle = () => {
  const { fillType, fillColor } = useShapeStore.getState()

  switch (fillType) {
    case ShapeFillType.Transparent:
      return 'transparent'
    case ShapeFillType.Full:
      return fillColor
    default:
      return undefined
  }
}
