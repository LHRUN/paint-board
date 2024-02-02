import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import useDrawStore from '@/store/draw'
import { setObjectAttr } from '@/utils/common/draw'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'

let colorDeg = 0

export class RainbowElement {
  points: fabric.Point[] = []
  group: fabric.Group

  constructor() {
    const group = new fabric.Group([], {
      perPixelTargetFind: true
    })
    paintBoard.canvas?.add(group)
    this.group = group

    setObjectAttr(group, ELEMENT_CUSTOM_TYPE.RAINBOW)
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point) {
      return
    }

    const newPoint = new fabric.Point(point.x, point.y)
    this.points.push(newPoint)
    if (this.points.length < 2) {
      return
    }

    this.group.addWithUpdate(drawRainbow(this.points))
    paintBoard.canvas?.requestRenderAll()
  }

  destroy() {
    paintBoard.canvas?.remove(this.group)
  }
}

function drawRainbow(points: fabric.Point[]) {
  const strokeWidth = Math.ceil(
    useDrawStore.getState().drawWidth / (paintBoard.canvas?.getZoom() ?? 1)
  )
  colorDeg = colorDeg < 360 ? colorDeg + 1 : 0

  const curX = points[points.length - 1].x
  const curY = points[points.length - 1].y
  const lastX = points[points.length - 2].x
  const lastY = points[points.length - 2].y

  const line = new fabric.Line([lastX, lastY, curX, curY], {
    stroke: `hsl(${colorDeg}, 90%, 50%)`,
    strokeWidth: strokeWidth,
    originX: 'center',
    originY: 'center'
  })

  return line
}
