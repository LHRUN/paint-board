import useDrawStore from '@/store/draw'
import { getDrawWidth, getShadowWidth } from '@/core/utils/draw'
import { paintBoard } from '@/core/paintBoard'
import { fabric } from 'fabric'
import { getStrokeDashArray } from './utils'

export const renderPencilBrush = () => {
  const canvas = paintBoard.canvas
  if (!canvas) {
    return
  }

  const pencilBrush = new fabric.PencilBrush(canvas)
  canvas.isDrawingMode = true
  canvas.freeDrawingBrush = pencilBrush
  canvas.freeDrawingBrush.width = getDrawWidth()
  canvas.freeDrawingBrush.color = useDrawStore.getState().drawColors[0]

  const strokeDashArray = getStrokeDashArray()
  canvas.freeDrawingBrush.strokeDashArray = strokeDashArray

  canvas.freeDrawingBrush.shadow = new fabric.Shadow({
    blur: getShadowWidth(),
    offsetX: 0,
    offsetY: 0,
    color: useDrawStore.getState().shadowColor
  })
}
