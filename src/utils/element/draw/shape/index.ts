import { DrawShape } from '@/constants/draw'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'
import { drawBubble } from './bubble'
import { drawStar } from './star'
import { drawLove } from './love'
import { drawButterfly } from './butterfly'
import { drawSnow } from './snow'
import { drawMusic } from './music'
import { drawSun } from './sun'
import { drawMoon } from './moon'
import { drawLeaf } from './leaf'
import { drawFlower } from './flower'
import useDrawStore from '@/store/draw'
import { setObjectAttr } from '@/utils/common/draw'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

export class ShapeElement {
  lastTime = 0
  group: fabric.Group

  constructor() {
    const group = new fabric.Group([], {
      perPixelTargetFind: true
    })
    paintBoard.canvas?.add(group)
    this.group = group

    setObjectAttr(group, ELEMENT_CUSTOM_TYPE.SHAPE)
  }

  addPosition(point: fabric.Point | undefined) {
    const now = Date.now()
    if (now - this.lastTime < 30 || !point) {
      return
    }
    this.lastTime = now
    const newPoint = new fabric.Point(point.x, point.y)
    const size =
      useDrawStore.getState().drawWidth / (paintBoard?.canvas?.getZoom() ?? 1)

    let currentDrawEle = null

    switch (useDrawStore.getState().drawShape) {
      case DrawShape.Bubble:
        currentDrawEle = drawBubble(newPoint, size)
        break
      case DrawShape.Star:
        currentDrawEle = drawStar(newPoint, size)
        break
      case DrawShape.Love:
        currentDrawEle = drawLove(newPoint, size)
        break
      case DrawShape.Butterfly:
        currentDrawEle = drawButterfly(newPoint, size)
        break
      case DrawShape.Snow:
        currentDrawEle = drawSnow(newPoint, size)
        break
      case DrawShape.Music:
        currentDrawEle = drawMusic(newPoint, size)
        break
      case DrawShape.Sun:
        currentDrawEle = drawSun(newPoint, size)
        break
      case DrawShape.Moon:
        currentDrawEle = drawMoon(newPoint, size)
        break
      case DrawShape.Leaf:
        currentDrawEle = drawLeaf(newPoint, size)
        break
      case DrawShape.Flower:
        currentDrawEle = drawFlower(newPoint, size)
        break
      default:
        break
    }
    if (currentDrawEle) {
      this.group.addWithUpdate(currentDrawEle)
      paintBoard.canvas?.requestRenderAll()
    }
  }

  destroy() {
    paintBoard.canvas?.remove(this.group)
  }
}
