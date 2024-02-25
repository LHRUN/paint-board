import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getFillStyle, getShapeBorder, getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class TooltipsShape {
  shapeInstance: fabric.Object | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }

    const strokeWidth = getShapeBorderWidth()

    const pathStr = `m1020.60467,131.15818c0,-72.31603 -58.84215,-131.15818 -131.18785,-131.15818l-758.24124,0c-72.32933,0 -131.17558,58.84215 -131.17558,131.15818l0,493.79948c0,72.31602 58.84625,131.05994 131.17558,131.05994l125.70907,0l0,193.82749c0,20.83861 12.4127,39.45562 31.62528,47.46299c19.29136,8.0043 41.26994,3.59897 56.02703,-11.15915l230.14873,-230.13236l314.72908,0c72.3457,0 131.18786,-58.74391 131.18786,-131.05994l-0.00001,-493.79845l0.00205,0z`

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
    setObjectAttr(path, ELEMENT_CUSTOM_TYPE.SHAPE_TOOLTIPS)
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
      scaleX: width / 1020,
      scaleY: height / 1002,
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
