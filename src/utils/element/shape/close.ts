import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getFillStyle, getShapeBorder, getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class CloseShape {
  shapeInstance: fabric.Object | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }

    const strokeWidth = getShapeBorderWidth()

    const pathStr = `m678.76571,546.23086q0,22.82057 -16.01829,38.83886l-77.67771,77.67771q-16.01829,16.01829 -38.83886,16.01829t-38.83885,-16.01829l-168.00915,-168.00914l-168.00914,168.00914q-16.01829,16.01829 -38.83886,16.01829t-38.83885,-16.01829l-77.67772,-77.67771q-16.01828,-16.01829 -16.01828,-38.83886t16.01828,-38.83886l168.00915,-168.00914l-168.00915,-168.00914q-16.01828,-16.01829 -16.01828,-38.83886t16.01828,-38.83886l77.67772,-77.67771q16.01828,-16.01829 38.83885,-16.01829t38.83886,16.01829l168.00914,168.00914l168.00915,-168.00914q16.01828,-16.01829 38.83885,-16.01829t38.83886,16.01829l77.67771,77.67771q16.01829,16.01829 16.01829,38.83886t-16.01829,38.83886l-168.00914,168.00914l168.00914,168.00914q16.01829,16.01829 16.01829,38.83886z`

    const path = new fabric.Path(pathStr, {
      left: point.x,
      top: point.y,
      scaleX: 0,
      scaleY: 0,
      stroke: useShapeStore.getState().borderColor,
      strokeWidth,
      fill: getFillStyle(),
      strokeUniform: true,
      strokeLineCap: 'round',
      strokeDashArray: getShapeBorder(strokeWidth),
      perPixelTargetFind: true
    })
    paintBoard.canvas?.add(path)
    this.shapeInstance = path
    this.startX = point.x
    this.startY = point.y
    setObjectAttr(path, ELEMENT_CUSTOM_TYPE.SHAPE_CLOSE)
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point || !this.shapeInstance) {
      return
    }
    const { x: moveToX, y: moveToY } = new fabric.Point(point.x, point.y)
    const width = Math.abs(moveToX - this.startX)
    const height = Math.abs(moveToY - this.startY)
    const left = moveToX > this.startX ? this.startX : this.startX - width
    const top = moveToY > this.startY ? this.startY : this.startY - height

    this.shapeInstance.set({
      scaleX: width / 679,
      scaleY: height / 679,
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
