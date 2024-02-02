import { setObjectAttr } from '@/utils/common/draw'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'
import { getDistance } from '@/utils/common'
import useDrawStore from '@/store/draw'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class ThornElement {
  lastTime = 0
  lastPoint: fabric.Point | null = null
  group: fabric.Group

  constructor() {
    const group = new fabric.Group([], {
      perPixelTargetFind: true
    })
    paintBoard.canvas?.add(group)
    this.group = group

    setObjectAttr(group, ELEMENT_CUSTOM_TYPE.THORN)
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

    const curPoint = new fabric.Point(point.x, point.y)
    if (!this.lastPoint) {
      this.lastPoint = curPoint
      return
    }

    this.group.addWithUpdate(drawThorn(this, curPoint))
    paintBoard.canvas?.renderAll()
  }

  destroy() {
    paintBoard.canvas?.remove(this.group)
  }
}

function drawThorn(el: ThornElement, curPoint: fabric.Point) {
  const lastPoint = el.lastPoint as fabric.Point

  const distance = getDistance(lastPoint, curPoint)

  const angle = fabric.util.radiansToDegrees(
    Math.atan2(curPoint.y - lastPoint.y, curPoint.x - lastPoint.x)
  )

  const minSize = 3 / (paintBoard.canvas?.getZoom() ?? 1)

  const ellipes = new fabric.Ellipse({
    left: curPoint.x,
    top: curPoint.y,
    originX: 'center',
    originY: 'center',
    fill: useDrawStore.getState().drawColors[0],
    opacity: Math.random(),
    rx: distance * 5 + minSize,
    ry: minSize
  })
  ellipes.rotate(angle)

  el.lastPoint = curPoint

  return ellipes
}
