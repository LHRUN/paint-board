import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import useDrawStore from '@/store/draw'
import { getDistance } from '@/utils/common'
import { setObjectAttr } from '@/utils/common/draw'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'

const minFontSize = 3

export class DrawTextElement {
  lastTime = 0
  points: fabric.Point[] = []
  group: fabric.Group
  counter = 0
  position = { x: 0, y: window.innerHeight / 2 }

  constructor() {
    const group = new fabric.Group([], {
      perPixelTargetFind: true
    })
    paintBoard.canvas?.add(group)
    this.group = group

    setObjectAttr(group, ELEMENT_CUSTOM_TYPE.DRAW_TEXT)
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point) {
      return
    }
    const newPoint = new fabric.Point(point.x, point.y)
    this.points.push(newPoint)
    if (this.points.length < 2) {
      this.position = { x: newPoint.x, y: newPoint.y }
      return
    }

    const now = Date.now()
    if (now - this.lastTime < 30) {
      return
    }
    this.lastTime = now

    this.group.addWithUpdate(drawText(this))
    paintBoard.canvas?.requestRenderAll()
  }

  destroy() {
    paintBoard.canvas?.remove(this.group)
  }
}

function drawText(el: DrawTextElement) {
  const points = el.points
  const mouse = points[points.length - 1]
  const d = getDistance(el.position as fabric.Point, mouse)
  const fontSize = minFontSize + d / 2
  const letter =
    useDrawStore.getState().drawTextValue[
      el.counter % useDrawStore.getState().drawTextValue.length
    ]
  const stepSize = textWidth(letter, fontSize)

  if (stepSize && d > stepSize) {
    const angle = Math.atan2(mouse.y - el.position.y, mouse.x - el.position.x)
    const text = new fabric.Text(letter, {
      fontSize,
      top: el.position.y,
      left: el.position.x,
      fontFamily: useDrawStore.getState().textFontFamily,
      originX: 'left',
      originY: 'bottom',
      angle: fabric.util.radiansToDegrees(angle),
      fill: useDrawStore.getState().drawColors[0]
    })

    el.position = {
      x: el.position.x + Math.cos(angle) * stepSize,
      y: el.position.y + Math.sin(angle) * stepSize
    }

    el.counter++
    if (el.counter > useDrawStore.getState().drawTextValue.length - 1) {
      el.counter = 0
    }
    return text
  }
}

function textWidth(string: string, size: number) {
  const text = new fabric.Text(string, {
    fontSize: size,
    fontFamily: useDrawStore.getState().textFontFamily
  })
  return text.width
}
