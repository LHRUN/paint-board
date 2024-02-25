import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import useDrawStore from '@/store/draw'
import { setObjectAttr } from '@/utils/common/draw'
import { getRandomInt } from '@/utils/common/index'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'

export class PixelsElement {
  lastTime = 0
  group: fabric.Group

  constructor() {
    const group = new fabric.Group([], {
      perPixelTargetFind: true
    })
    paintBoard.canvas?.add(group)
    this.group = group

    setObjectAttr(group, ELEMENT_CUSTOM_TYPE.PIXELS)
  }

  addPosition(point: fabric.Point | undefined) {
    const now = Date.now()
    if (now - this.lastTime < 30 || !point) {
      return
    }
    this.lastTime = now
    const newPoint = new fabric.Point(point.x, point.y)

    this.group.addWithUpdate(drawPixels(newPoint.x, newPoint.y))
    paintBoard.canvas?.requestRenderAll()
  }

  destroy() {
    paintBoard.canvas?.remove(this.group)
  }
}

function drawPixels(x: number, y: number) {
  const rects = []
  const size = Number(
    (
      useDrawStore.getState().drawWidth / (paintBoard?.canvas?.getZoom() ?? 1)
    ).toFixed(2)
  )
  const step = Number(
    (
      useDrawStore.getState().drawWidth /
      3 /
      (paintBoard?.canvas?.getZoom() ?? 1)
    ).toFixed(2)
  )

  for (let i = -size; i < size; i += step) {
    for (let j = -size; j < size; j += step) {
      if (Math.random() > 0.5) {
        const color =
          useDrawStore.getState().drawColors?.[
            getRandomInt(0, useDrawStore.getState().drawColors.length - 1)
          ] ?? useDrawStore.getState().drawColors[0]

        const rect = new fabric.Rect({
          left: x + i,
          top: y + j,
          width: step,
          height: step,
          fill: color
        })
        rects.push(rect)
      }
    }
  }
  return new fabric.Group(rects)
}
