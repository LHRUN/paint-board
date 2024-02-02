import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import useDrawStore from '@/store/draw'
import { setObjectAttr } from '@/utils/common/draw'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'

export class ReticulateElement {
  lastTime = 0
  points: fabric.Point[] = []
  group: fabric.Group

  constructor() {
    const group = new fabric.Group([], {
      perPixelTargetFind: true
    })
    paintBoard.canvas?.add(group)
    this.group = group

    setObjectAttr(group, ELEMENT_CUSTOM_TYPE.RETICULATE)
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

    this.group.addWithUpdate(drawReticulate(this.points))
    paintBoard.canvas?.requestRenderAll()
  }

  destroy() {
    paintBoard.canvas?.remove(this.group)
  }
}

function drawReticulate(points: fabric.Point[]) {
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

  const limitDistance = 1000 / (paintBoard.canvas?.getZoom() ?? 1)

  for (let i = 0; i < points.length; i = i + 1) {
    const dx = points[i].x - points[points.length - 1].x
    const dy = points[i].y - points[points.length - 1].y
    const d = dx * dx + dy * dy

    if (d < limitDistance) {
      lines.push(
        new fabric.Line(
          [
            points[points.length - 1].x + dx * 0.1,
            points[points.length - 1].y + dy * 0.1,
            points[i].x - dx * 0.1,
            points[i].y - dy * 0.1
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
