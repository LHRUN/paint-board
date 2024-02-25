import useDrawStore from '@/store/draw'
import { setObjectAttr } from '@/utils/common/draw'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'
import { generateRandomCoordinates } from './shape/util'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class MultiPointElement {
  lastTime = 0
  lastCoordinates: { x: number; y: number }[] = []
  points: fabric.Point[] = []
  group: fabric.Group
  shadow: fabric.Shadow

  constructor() {
    const group = new fabric.Group([], {
      perPixelTargetFind: true
    })
    paintBoard.canvas?.add(group)
    this.group = group
    this.shadow = new fabric.Shadow({
      blur: 3,
      offsetX: 0,
      offsetY: 0,
      color: useDrawStore.getState().drawColors[0]
    })

    setObjectAttr(group, ELEMENT_CUSTOM_TYPE.MULTI_POINT)
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point) {
      return
    }
    const now = Date.now()
    if (now - this.lastTime < 30) {
      return
    }
    this.lastTime = now

    const newPoint = new fabric.Point(point.x, point.y)
    this.points.push(newPoint)
    if (this.points.length < 2) {
      return
    }

    this.group.addWithUpdate(drawMultiPoint(this))
    paintBoard.canvas?.renderAll()
  }

  destroy() {
    paintBoard.canvas?.remove(this.group)
  }
}

function drawMultiPoint(el: MultiPointElement) {
  const { points, lastCoordinates } = el
  const boardZoom = paintBoard.canvas?.getZoom() ?? 1
  const rectSize = Math.ceil(
    (useDrawStore.getState().drawWidth * 3) / boardZoom
  )
  const radius = 6 / boardZoom
  const strokeWidth = 2 / boardZoom

  const curX = points[points.length - 1].x
  const curY = points[points.length - 1].y

  const objects = []
  const coordinates = generateRandomCoordinates(
    curX,
    curY,
    rectSize,
    useDrawStore.getState().drawShapeCount
  )
  const circle = coordinates.map((item) => {
    return new fabric.Circle({
      left: item.x,
      top: item.y,
      radius,
      // shadow: el.shadow,
      fill: useDrawStore.getState().drawColors[0]
    })
  })
  objects.push(...circle)
  if (lastCoordinates?.length) {
    const lines = lastCoordinates.map((item, index) => {
      return new fabric.Line(
        [
          item.x + radius,
          item.y + radius,
          coordinates[index].x + radius,
          coordinates[index].y + radius
        ],
        {
          stroke: useDrawStore.getState().drawColors[0],
          strokeWidth
        }
      )
    })
    objects.push(...lines)
  }
  el.lastCoordinates = coordinates

  return new fabric.Group(objects)
}
