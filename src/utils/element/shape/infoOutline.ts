import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getFillStyle, getShapeBorder, getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class InfoOutlineShape {
  shapeInstance: fabric.Object | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }

    const strokeWidth = getShapeBorderWidth()

    const pathStr = `m89.68,0c16.93,12.78 35.09,21 56.38,20.55c2.3,0 4.59,-0.06 6.88,0.07a64.3,64.3 0 0 0 35.55,-7.85c4.37,-2.42 8.6,-2.67 13.2,-1.85a8.08,8.08 0 0 1 5.09,2.86c12,14.42 27.73,20.48 46.19,20.6c8.12,0 16,-0.64 23.46,-4.15a13.82,13.82 0 0 1 5.81,-1c2.25,0 4.13,2.72 3.63,4.92a26.24,26.24 0 0 1 -1.32,3.12c-4.65,12.17 -1.88,23.2 5.92,33c2.17,2.71 6.09,4.07 9.32,5.86c2.49,1.38 5.26,2.26 7.68,3.74a3.54,3.54 0 0 1 0.19,5.87a20.31,20.31 0 0 1 -2.87,1.84c-14.12,7.91 -20.69,21 -23.88,36c-1.13,5.36 0.93,10.75 2.65,15.94a57.2,57.2 0 0 1 2.28,7.35c0.63,3.33 -1.25,5.55 -4.74,5.64a33.64,33.64 0 0 1 -6.76,-0.74c-19,-3.33 -36.39,0.36 -51.73,12.4c-2.24,1.76 -4.26,3.83 -6.44,5.67c-2.93,2.47 -5.43,2.7 -8.59,0.86a15.43,15.43 0 0 1 -2.1,-1.5c-6.69,-5.62 -14.73,-7.23 -23.14,-8c-13.19,-1.23 -25.78,1.36 -37.68,6.62c-6.7,3 -11.49,0.84 -16.33,-3.12c-2.65,-2.18 -5.15,-4.55 -7.64,-6.91a24.73,24.73 0 0 0 -12.93,-6.4c-15.06,-2.69 -30.13,-3.61 -45.11,0.76c-4.93,1.44 -10,2.46 -14.87,4.11s-8.33,-0.65 -11.48,-3.67c-0.87,-0.83 -1,-2.56 -1.19,-3.92c-0.87,-5.65 -1.52,-11.33 -2.46,-17a24.82,24.82 0 0 0 -12.9,-18.3c-4.95,-2.78 -9.12,-7.08 -15.62,-7.77l-4.13,-7.6c3.06,-2.94 5.88,-5.71 8.77,-8.4c10.63,-9.91 14.4,-22.38 13.5,-36.5a10.73,10.73 0 0 0 -2.27,-5.31c-2.75,-3.66 -2.57,-7.3 -0.65,-11.71c6.28,0.84 12.44,1.81 18.63,2.47c10.02,1.06 19.28,-1.55 28.27,-5.63a36.86,36.86 0 0 0 14.36,-11.82c1.8,-2.39 3.17,-5 3.15,-7.8c0,-4.54 2.41,-8.06 4,-11.93c0.24,-0.44 0.94,-0.67 1.92,-1.37z`

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
    setObjectAttr(path, ELEMENT_CUSTOM_TYPE.SHAPE_INFO_OUTLINE)
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
      scaleX: width / 309,
      scaleY: height / 172,
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
