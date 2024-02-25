import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getFillStyle, getShapeBorder, getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class BackspaceShape {
  shapeInstance: fabric.Object | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }

    const strokeWidth = getShapeBorderWidth()

    const pathStr = `m714.52777,0a138.66667,138.66667 0 0 1 138.45333,130.816l0.21334,7.85066l0,405.33334a138.66667,138.66667 0 0 1 -130.816,138.45333l-7.85067,0.21333l-362.70933,0a138.66667,138.66667 0 0 1 -88.96,-32.256l-6.61334,-5.93066l-213.16266,-202.66667a138.66667,138.66667 0 0 1 -4.90667,-196.01067l4.90667,-4.94933l213.16266,-202.66667a138.66667,138.66667 0 0 1 86.69867,-37.888l8.87467,-0.29866l362.66666,0l0.04267,0zm0,64l-362.70933,0a74.66667,74.66667 0 0 0 -46.08,15.872l-5.376,4.69333l-213.16267,202.66667l-2.64533,2.64533a74.66667,74.66667 0 0 0 -2.34667,100.352l4.992,5.20533l213.16267,202.66667c12.11733,11.52 27.73333,18.64533 44.288,20.224l7.168,0.34133l362.66666,0a74.66667,74.66667 0 0 0 74.45334,-68.56533l0.256,-6.10133l0,-405.33334a74.66667,74.66667 0 0 0 -68.56534,-74.41066l-6.10133,-0.256zm-311.63733,123.60533l3.584,3.11467l105.38666,105.344l105.38667,-105.38667a32,32 0 0 1 48.34133,41.68533l-3.11466,3.584l-105.38667,105.38667l105.38667,105.38667a32,32 0 0 1 -41.64267,48.34133l-3.584,-3.11467l-105.38667,-105.344l-105.38666,105.38667a32,32 0 0 1 -48.34134,-41.68533l3.072,-3.584l105.42934,-105.38667l-105.38667,-105.38667a32,32 0 0 1 41.68533,-48.34133l-0.04266,0z`

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
    setObjectAttr(path, ELEMENT_CUSTOM_TYPE.SHAPE_BACKSPACE)
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
      scaleX: width / 853,
      scaleY: height / 682,
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
