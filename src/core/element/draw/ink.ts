import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import { initCustomObjectAttr } from '@/core/utils/object'
import { paintBoard } from '@/core/paintBoard'
import useDrawStore from '@/store/draw'
import { fabric } from 'fabric'
import {
  INK_WIDTH,
  inkBristleCount,
  inkBristleOffset,
  inkShouldSplash,
  inkSplashCount,
  inkSplashOffset,
  inkStrokeWidth
} from './inkMath'

type Bristle = {
  x: number
  y: number
}

export class InkElement {
  private bristles: Bristle[] = []
  private width = 0
  private lastPoint: fabric.Point | null = null
  private group: fabric.Group

  constructor(point: fabric.Point) {
    const group = new fabric.Group([], {
      perPixelTargetFind: true,
      objectCaching: false
    })
    paintBoard.canvas?.add(group)
    this.group = group
    initCustomObjectAttr(group, ELEMENT_CUSTOM_TYPE.INK)
    this.resetTip(point)
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point || !this.lastPoint) {
      return
    }
    const zoom = paintBoard.canvas?.getZoom() || 1
    const stepX = point.x - this.lastPoint.x
    const stepY = point.y - this.lastPoint.y
    const screenDistance = Math.hypot(stepX, stepY) * zoom
    if (!(screenDistance > 0)) {
      return
    }

    const color = currentColor()
    const strokeWidth = inkStrokeWidth(this.width, screenDistance) / zoom
    const marks: fabric.Object[] = this.bristles.map((bristle) => {
      const nextX = bristle.x + stepX
      const nextY = bristle.y + stepY
      const line = new fabric.Line([bristle.x, bristle.y, nextX, nextY], {
        stroke: color,
        strokeWidth,
        strokeLineCap: 'round',
        strokeLineJoin: 'round',
        fill: ''
      })
      bristle.x = nextX
      bristle.y = nextY
      return line
    })

    if (inkShouldSplash(screenDistance)) {
      const count = inkSplashCount(Math.random)
      for (let i = 0; i < count; i += 1) {
        const splash = inkSplashOffset(Math.random)
        marks.push(
          new fabric.Circle({
            left: point.x + splash.x / zoom,
            top: point.y + splash.y / zoom,
            originX: 'center',
            originY: 'center',
            radius: splash.radius / zoom,
            fill: color,
            stroke: '',
            strokeWidth: 0
          })
        )
      }
    }

    this.group.addWithUpdate(new fabric.Group(marks))
    this.lastPoint = new fabric.Point(point.x, point.y)
    paintBoard.canvas?.requestRenderAll()
  }

  /**
   * A press that never draws a segment leaves nothing.
   */
  finish() {
    if (!this.group.getObjects().length) {
      this.destroy()
      return false
    }
    // Drawing forced this off. Remove it so the stroke follows the board cache switch.
    delete this.group.objectCaching
    this.group.dirty = true
    return true
  }

  destroy() {
    paintBoard.canvas?.remove(this.group)
  }

  private resetTip(point: fabric.Point) {
    const zoom = paintBoard.canvas?.getZoom() || 1
    this.width = INK_WIDTH
    const count = inkBristleCount(this.width)
    const range = count / 2
    this.bristles = []
    for (let i = 0; i < count; i += 1) {
      const offset = inkBristleOffset(range, Math.random)
      this.bristles.push({
        x: point.x + offset.x / zoom,
        y: point.y + offset.y / zoom
      })
    }
    this.lastPoint = new fabric.Point(point.x, point.y)
  }
}

const currentColor = () => {
  const { drawColors, currentDrawColor } = useDrawStore.getState()
  return drawColors[currentDrawColor] || '#000000'
}
