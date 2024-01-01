import useDrawStore from '@/store/draw'
import { getDrawWidth, getShadowWidth } from '@/utils/common/draw'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'

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
  canvas.freeDrawingBrush.shadow = new fabric.Shadow({
    blur: getShadowWidth(),
    offsetX: 0,
    offsetY: 0,
    color: useDrawStore.getState().shadowColor
  })
}
