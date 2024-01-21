import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getShapeBorder, getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'

export class LineShape {
  shapeInstance: fabric.Line | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }
    this.startX = point.x
    this.startY = point.y

    const strokeWidth = getShapeBorderWidth()
    const shape = new fabric.Line(
      [this.startX, this.startY, this.startX, this.startY],
      {
        stroke: useShapeStore.getState().borderColor,
        strokeWidth,
        originX: 'center',
        originY: 'center',
        strokeDashArray: getShapeBorder(strokeWidth + 5)
      }
    )
    paintBoard.canvas?.add(shape)
    this.shapeInstance = shape

    setObjectAttr(shape, 'shapeLine')
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point || !this.shapeInstance) {
      return
    }

    this.shapeInstance.set({
      x2: point.x,
      y2: point.y
    })
    paintBoard.canvas?.requestRenderAll()
  }

  destroy() {
    if (this.shapeInstance) {
      paintBoard.canvas?.remove(this.shapeInstance)
    }
  }
}
