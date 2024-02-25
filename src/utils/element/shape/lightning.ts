import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getFillStyle, getShapeBorder, getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class LightningShape {
  shapeInstance: fabric.Object | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }

    const strokeWidth = getShapeBorderWidth()

    const pathStr = `m-329.49334,256l271.25334,66.66667a5.33333,5.33333 0 0 1 4,5.97333l-51.04,335.68a5.33333,5.33333 0 0 0 9.22666,4.32l434.77334,-490.34667a5.33333,5.33333 0 0 0 -2.72,-8.69333l-271.25334,-66.66667a5.33333,5.33333 0 0 1 -4,-5.97333l51.04,-335.62667a5.33333,5.33333 0 0 0 -9.22666,-4.37333l-434.77334,490.34667a5.33333,5.33333 0 0 0 2.72,8.69333z`

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
    setObjectAttr(path, ELEMENT_CUSTOM_TYPE.SHAPE_LIGHTNING)
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
      scaleX: width / 674,
      scaleY: height / 915,
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
