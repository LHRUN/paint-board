import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getFillStyle, getShapeBorder, getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class ArrowOutlineShape {
  shapeInstance: fabric.Path | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }

    const strokeWidth = getShapeBorderWidth()
    const pathStr =
      'm446.24196,887.47009l-175.7696,0c-27.01653,-0.68266 -50.176,-10.68373 -69.23946,-29.7472c-16.91307,-16.896 -26.88,-36.62506 -29.61067,-58.58986a99.1744,99.1744 0 0 1 -1.00693,-14.06294c0,-4.3008 0.29013,-8.89173 0.85333,-13.80693l0,-395.79307l-154.45333,0a17.1008,17.1008 0 0 1 -12.06614,-29.1328l341.33334,-341.33333a17.0496,17.0496 0 0 1 24.13226,0l340.3264,340.3264a17.06667,17.06667 0 0 1 -9.8816,30.99307l-153.94133,0l0,410.45333c-0.64853,27.46027 -10.5984,51.11467 -29.52533,70.74133c-19.98507,19.3536 -43.63947,29.2864 -70.74134,29.96907l-0.4096,-0.01707z'

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
    setObjectAttr(path, ELEMENT_CUSTOM_TYPE.SHAPE_ARROW_OUTLINE)
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
      scaleX: width / 718,
      scaleY: height / 887,
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
