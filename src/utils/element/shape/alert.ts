import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getFillStyle, getShapeBorder, getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class AlertShape {
  shapeInstance: fabric.Object | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }

    const strokeWidth = getShapeBorderWidth()

    const pathStr = `M 300 0 C 204.92302 0 120 65.17035 120 155 A 40 40 0 0 0 120.72852 160.5332 A 40 40 0 0 0 119.83984 165 C 119.83984 285.43738 70.949871 389.48179 19.386719 420.81836 A 40 40 0 0 0 0.33984375 456.98438 A 40 40 0 0 0 0 460 A 40 40 0 0 0 40 500 L 164.75586 500 C 173.8133 535.3936 198.4031 565.81344 231.86914 583.36328 C 274.50045 605.71947 325.49955 605.71947 368.13086 583.36328 C 401.5969 565.81344 426.1867 535.3936 435.24414 500 L 560 500 A 40 40 0 0 0 600 460 A 40 40 0 0 0 599.49023 453.71094 A 40 40 0 0 0 580.45312 415.81836 C 528.88999 384.48179 480 280.43738 480 160 A 40 40 0 0 0 479.78125 156.66016 A 40 40 0 0 0 480 155 C 480 65.17035 395.07698 0 300 0 z`

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
    setObjectAttr(path, ELEMENT_CUSTOM_TYPE.SHAPE_ALERT)
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
      scaleX: width / 600,
      scaleY: height / 600,
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
