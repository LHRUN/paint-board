import { setObjectAttr } from '@/utils/common/draw'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'
import { getDistance } from '@/utils/common'
import useDrawStore from '@/store/draw'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class WiggleElement {
  lastTime = 0
  flip = 1
  lastPoint: fabric.Point | null = null
  group: fabric.Group

  constructor() {
    const group = new fabric.Group([], {
      perPixelTargetFind: true
    })
    paintBoard.canvas?.add(group)
    this.group = group

    setObjectAttr(group, ELEMENT_CUSTOM_TYPE.WIGGLE)
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

    this.group.addWithUpdate(drawWiggle(this, curPoint))
    paintBoard.canvas?.renderAll()
  }

  destroy() {
    paintBoard.canvas?.remove(this.group)
  }
}

function drawWiggle(el: WiggleElement, curPoint: fabric.Point) {
  const lastPoint = el.lastPoint as fabric.Point

  const distance = getDistance(lastPoint, curPoint)
  const midX = (lastPoint.x + curPoint.x) / 2
  const midY = (lastPoint.y + curPoint.y) / 2

  const angle = fabric.util.radiansToDegrees(
    Math.atan2(curPoint.y - lastPoint.y, curPoint.x - lastPoint.x)
  )
  const flip = fabric.util.radiansToDegrees((el.flip % 2) * Math.PI)

  const strokeWidth = 3 / (paintBoard.canvas?.getZoom() ?? 1)

  const circle = new fabric.Circle({
    top: midY,
    left: midX,
    originX: 'center',
    originY: 'center',
    radius: distance / 2,
    startAngle: angle + flip,
    endAngle: angle + flip + fabric.util.radiansToDegrees(Math.PI),
    stroke: useDrawStore.getState().drawColors[0],
    strokeWidth,
    fill: '',
    strokeLineJoin: 'round',
    strokeLineCap: 'round'
  })

  el.lastPoint = curPoint
  el.flip++

  return circle
}
