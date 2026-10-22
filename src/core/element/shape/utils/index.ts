import { FillStyleType, StrokeStyleType } from '@/constants/shape'
import { paintBoard } from '@/core/paintBoard'
import useShapeStore from '@/store/shape'
import { PathInfo } from 'roughjs/bin/core'
import { buildRoughShapeOptions } from './roughFrame'

export const getShapeStrokeWidth = () => {
  const zoom = paintBoard.canvas?.getZoom() ?? 1
  const strokeWidth = useShapeStore.getState().strokeWidth
  return strokeWidth / zoom
}

export const getShapeStrokeDashArray = (base = 5) => {
  const strokeStyle = useShapeStore.getState().strokeStyle
  const value = Math.round(base)

  switch (strokeStyle) {
    case StrokeStyleType.Dashed:
      return [value * 3, value * 2]
    case StrokeStyleType.Dotted:
      return [value, value * 3]
    default:
      return undefined
  }
}

export const getShapeFillStyle = () => {
  const { fillStyle } = useShapeStore.getState()

  switch (fillStyle) {
    case FillStyleType.Transparent:
      return undefined
    case FillStyleType.Solid:
      return 'solid'
    case FillStyleType.Hachure:
      return 'hachure'
    case FillStyleType.CrossHatch:
      return 'cross-hatch'
    case FillStyleType.Dots:
      return 'dots'
    case FillStyleType.ZigZag:
      return 'zigzag'
    default:
      return undefined
  }
}

export const getShapeFillColor = () => {
  const { fillStyle, fillColorList, currentFillColor } =
    useShapeStore.getState()
  switch (fillStyle) {
    case FillStyleType.Transparent:
      return 'transparent'
    default:
      return fillColorList[currentFillColor]
  }
}

export const getRoughShapeOptions = () => {
  const { strokeColorList, currentStrokeColor, strokeStyle } =
    useShapeStore.getState()

  return buildRoughShapeOptions({
    stroke: strokeColorList[currentStrokeColor],
    strokeStyle,
    fill: getShapeFillColor(),
    fillStyle: getShapeFillStyle()
  })
}

export const getFabricShapeOptions = (path: PathInfo) => {
  const { strokeWidth } = useShapeStore.getState()

  return {
    scaleX: 1,
    scaleY: 1,
    stroke: path?.stroke === 'none' ? 'transparent' : path?.stroke,
    strokeWidth: strokeWidth,
    strokeUniform: true,
    strokeLineCap: 'round',
    strokeDashArray:
      path.strokeWidth === 1 ? getShapeStrokeDashArray(strokeWidth) : undefined,
    fill: path?.fill === 'none' ? 'transparent' : path?.fill
  }
}
