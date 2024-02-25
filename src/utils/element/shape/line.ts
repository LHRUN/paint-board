import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getShapeBorder, getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'
import {
  actionHandler,
  anchorWrapper,
  polygonPositionHandler
} from './utils/line'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class LineShape {
  shapeInstance: fabric.Polyline | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }
    this.startX = point.x
    this.startY = point.y

    const strokeWidth = getShapeBorderWidth()

    const points = []
    for (let i = 0; i < useShapeStore.getState().shapeLinePointCount; i++) {
      points.push({
        x: this.startX,
        y: this.startY
      })
    }

    const line = new fabric.Polyline(points, {
      stroke: useShapeStore.getState().borderColor,
      strokeWidth,
      originX: 'center',
      originY: 'center',
      strokeDashArray: getShapeBorder(strokeWidth + 5),
      strokeLineCap: 'round',
      fill: 'transparent',
      objectCaching: false,
      perPixelTargetFind: true
    })

    paintBoard.canvas?.add(line)
    this.shapeInstance = line

    setObjectAttr(line, ELEMENT_CUSTOM_TYPE.SHAPE_LINE)
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point || !this.shapeInstance) {
      return
    }

    const points = this.shapeInstance.points as fabric.Point[]
    const len = points.length
    const averageX = (point.x - this.startX) / (len - 1)
    const averageY = (point.y - this.startY) / (len - 1)
    for (let index = 1; index < len; index++) {
      points[index] = {
        x: Math.round(this.startX + averageX * index),
        y: Math.round(this.startY + averageY * index)
      } as fabric.Point
    }

    this.shapeInstance.set({
      points
    })

    this.shapeInstance.setCoords()
    paintBoard.canvas?.requestRenderAll()
  }

  mouseUp() {
    if (!this.shapeInstance) {
      return
    }

    const points = this.shapeInstance.points as fabric.Point[]
    const lastControl = points.length - 1
    this.shapeInstance.controls = points.reduce(function (acc, point, index) {
      acc['p' + index] = new fabric.Control({
        positionHandler: polygonPositionHandler,
        actionHandler: anchorWrapper(
          index > 0 ? index - 1 : lastControl,
          actionHandler
        ),
        actionName: 'polylineEndPoint',
        pointIndex: index
      })
      return acc
    }, {} as Record<string, fabric.Control>)

    this.shapeInstance._setPositionDimensions({})
    this.shapeInstance.setCoords()
  }

  destroy() {
    if (this.shapeInstance) {
      paintBoard.canvas?.remove(this.shapeInstance)
    }
  }
}
