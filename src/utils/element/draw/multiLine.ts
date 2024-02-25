import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import useDrawStore from '@/store/draw'
import { setObjectAttr } from '@/utils/common/draw'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'

export class MultiLineElement {
  lastTime = 0
  points: fabric.Point[] = []
  group: fabric.Group

  constructor() {
    const group = new fabric.Group([], {
      perPixelTargetFind: true
    })
    paintBoard.canvas?.add(group)
    this.group = group

    setObjectAttr(group, ELEMENT_CUSTOM_TYPE.MULTI_LINE)
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

    this.group.addWithUpdate(drawMultiLine(this.points))
    paintBoard.canvas?.renderAll()
  }

  destroy() {
    paintBoard.canvas?.remove(this.group)
  }
}

function drawMultiLine(points: fabric.Point[]) {
  const stroke = useDrawStore.getState().drawColors[0]
  const strokeWidth = Math.ceil(
    useDrawStore.getState().drawWidth / 3 / (paintBoard.canvas?.getZoom() ?? 1)
  )

  const lines: fabric.Line[] = []
  lines.push(
    new fabric.Line(
      [
        points[points.length - 1].x,
        points[points.length - 1].y,
        points[points.length - 2].x,
        points[points.length - 2].y
      ],
      {
        stroke,
        strokeWidth
      }
    )
  )

  if (points.length % 5 === 0) {
    for (
      let i = points.length - 5, count = 0;
      i >= 0 && count < 3;
      i = i - 5, count++
    ) {
      lines.push(
        new fabric.Line(
          [
            points[points.length - 1].x,
            points[points.length - 1].y,
            points[i].x,
            points[i].y
          ],
          {
            stroke,
            strokeWidth: strokeWidth / 3
          }
        )
      )
    }
  }

  return new fabric.Group(lines)
}
