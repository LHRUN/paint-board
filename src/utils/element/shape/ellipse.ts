import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getFillStyle, getShapeBorder, getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class EllipseShape {
  shapeInstance: fabric.Ellipse | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }

    const strokeWidth = getShapeBorderWidth()
    const shape = new fabric.Ellipse({
      left: point.x,
      top: point.y,
      rx: 0,
      ry: 0,
      stroke: useShapeStore.getState().borderColor,
      strokeWidth,
      fill: getFillStyle(),
      strokeUniform: true,
      strokeLineCap: 'round',
      strokeDashArray: getShapeBorder(strokeWidth),
      perPixelTargetFind: true
    })

    paintBoard.canvas?.add(shape)
    this.shapeInstance = shape
    this.startX = point.x
    this.startY = point.y
    setObjectAttr(shape, ELEMENT_CUSTOM_TYPE.SHAPE_ELLIPSE)
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point || !this.shapeInstance) {
      return
    }
    const { x: moveToX, y: moveToY } = new fabric.Point(point.x, point.y)
    const width = Math.abs(moveToX - this.startX) / 2
    const height = Math.abs(moveToY - this.startY) / 2
    const left = moveToX > this.startX ? this.startX : this.startX - width * 2
    const top = moveToY > this.startY ? this.startY : this.startY - height * 2

    this.shapeInstance.set({
      rx: width,
      ry: height,
      left,
      top
    })

    this.shapeInstance.setCoords()
    paintBoard.canvas?.requestRenderAll()
  }

  destroy() {
    if (this.shapeInstance) {
      paintBoard.canvas?.remove(this.shapeInstance)
    }
  }
}
