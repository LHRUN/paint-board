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

    const line = new fabric.Polyline(
      [
        { x: this.startX, y: this.startY },
        { x: this.startX, y: this.startY },
        { x: this.startX, y: this.startY }
      ],
      {
        stroke: useShapeStore.getState().borderColor,
        strokeWidth,
        originX: 'center',
        originY: 'center',
        strokeDashArray: getShapeBorder(strokeWidth + 5),
        strokeLineCap: 'round',
        fill: 'transparent'
      }
    )

    paintBoard.canvas?.add(line)
    this.shapeInstance = line

    setObjectAttr(line, 'shapeLine')
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point || !this.shapeInstance) {
      return
    }
    const points = this.shapeInstance.points as fabric.Point[]
    points[1] = {
      ...point,
      x: (point.x + this.startX) / 2,
      y: (point.y + this.startY) / 2
    } as fabric.Point
    points[2] = point
    this.shapeInstance.set({
      points
    })

    paintBoard.canvas?.requestRenderAll()
  }

  mouseUp() {
    if (!this.shapeInstance) {
      return
    }
    this.shapeInstance._setPositionDimensions({})

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
  }

  destroy() {
    if (this.shapeInstance) {
      paintBoard.canvas?.remove(this.shapeInstance)
    }
  }
}
