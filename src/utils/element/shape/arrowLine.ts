import { fabric } from 'fabric'
import { paintBoard } from '@/utils/paintBoard'
import { setObjectAttr } from '@/utils/common/draw'
import { getShapeBorder, getShapeBorderWidth } from './utils'
import useShapeStore from '@/store/shape'
import {
  actionHandler,
  anchorWrapper,
  pathPositionHandler,
  calculateArrowSlidePath
} from './utils/arrowLine'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class ArrowLineShape {
  shapeLine: fabric.Path | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }
    this.startX = point.x
    this.startY = point.y
    const strokeWidth = getShapeBorderWidth()

    let pathStr = `M ${this.startX} ${this.startY}`
    for (let i = 0; i < useShapeStore.getState().shapeLinePointCount - 1; i++) {
      pathStr += ` L ${this.startX} ${this.startY}`
    }

    pathStr += ` M ${this.startX} ${this.startY}`
    pathStr += ` L ${this.startX - 5} ${this.startY + 5}`
    pathStr += ` M ${this.startX} ${this.startY}`
    pathStr += ` L ${this.startX + 5} ${this.startY + 5}`

    const line = new fabric.Path(pathStr, {
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
    setObjectAttr(line, ELEMENT_CUSTOM_TYPE.SHAPE_ARROW_LINE)

    this.shapeLine = line
    paintBoard.canvas?.add(this.shapeLine)
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point || !this.shapeLine) {
      return
    }

    let paths = this.shapeLine.path
    const len = paths.length - 4
    const averageX = (point.x - this.startX) / (len - 1)
    const averageY = (point.y - this.startY) / (len - 1)
    for (let index = 1; index < len; index++) {
      paths[index][1] = Math.round(this.startX + averageX * index)
      paths[index][2] = Math.round(this.startY + averageY * index)
    }

    paths = calculateArrowSlidePath(
      paths,
      this.startX,
      this.startY,
      point.x,
      point.y
    )

    this.shapeLine._setPath(paths)
    paintBoard.canvas?.requestRenderAll()
  }

  mouseUp() {
    if (!this.shapeLine) {
      return
    }

    const paths = this.shapeLine.path
    this.shapeLine.controls = paths
      .slice(0, paths.length - 4)
      .reduce(function (acc, point, index) {
        acc['p' + index] = new fabric.Control({
          positionHandler: pathPositionHandler,
          actionHandler: anchorWrapper(
            index > 0 ? index - 1 : paths.length - 5,
            actionHandler
          ),
          actionName: 'pathEndPoint',
          pointIndex: index
        })
        return acc
      }, {} as Record<string, fabric.Control>)

    this.shapeLine.setCoords()
  }

  destroy() {
    if (this.shapeLine) {
      paintBoard.canvas?.remove(this.shapeLine)
    }
  }
}
