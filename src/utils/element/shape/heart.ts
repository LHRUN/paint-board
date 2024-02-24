import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getFillStyle, getShapeBorder, getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class HeartShape {
  shapeInstance: fabric.Object | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }

    const strokeWidth = getShapeBorderWidth()

    const pathStr = `m760.384,0.00803c47.808,0 91.968,11.968 132.352,35.84a264.32,264.32 0 0 1 95.872,97.152a263.68,263.68 0 0 1 35.392,133.888c0,34.752 -6.592,68.544 -19.712,101.312a262.4,262.4 0 0 1 -57.536,87.424l-434.752,440.384l-434.752,-440.32a268.8,268.8 0 0 1 -77.248,-188.8c0,-48.384 11.776,-93.056 35.392,-133.952a264.32,264.32 0 0 1 95.808,-97.088a255.296,255.296 0 0 1 132.48,-35.84a260.736,260.736 0 0 1 186.24,78.208l62.08,62.912l62.144,-62.912a258.944,258.944 0 0 1 86.336,-58.24a259.584,259.584 0 0 1 100.032,-19.968l-0.128,0z`

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
    setObjectAttr(path, ELEMENT_CUSTOM_TYPE.SHAPE_HEART)
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
      scaleX: width / 1024,
      scaleY: height / 896,
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
