import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import { initCustomObjectAttr } from '@/core/utils/object'
import { paintBoard } from '@/core/paintBoard'
import useDrawStore from '@/store/draw'
import { fabric } from 'fabric'
import { currentPenPressure } from './freehandInput'
import {
  buildFreehandPath,
  isFarEnough,
  outlineStroke,
  screenPointGap,
  type FreehandSettings
} from './freehandPath'

type Sample = {
  x: number
  y: number
  pressure?: number
}

export class FreehandElement {
  private points: Sample[] = []
  private path: fabric.Path | null = null
  private frame = 0
  private moved = false
  private outlined: boolean

  constructor(point: fabric.Point, outlined = false) {
    this.outlined = outlined
    this.keep(point)
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point || !this.keep(point)) {
      return
    }
    this.moved = true
    this.schedule()
  }

  /**
   * Commit the completed outline. A press that never moves leaves nothing.
   */
  finish(point?: fabric.Point) {
    this.cancelFrame()
    if (point && this.keep(point)) {
      this.moved = true
    }
    if (!this.moved) {
      this.destroy()
      return false
    }
    this.render(true)
    if (!this.path) {
      this.destroy()
      return false
    }
    initCustomObjectAttr(
      this.path,
      this.outlined
        ? ELEMENT_CUSTOM_TYPE.FREEHAND_STROKE
        : ELEMENT_CUSTOM_TYPE.FREEHAND
    )
    return true
  }

  destroy() {
    this.cancelFrame()
    if (this.path) {
      paintBoard.canvas?.remove(this.path)
      this.path = null
    }
  }

  private keep(point: fabric.Point) {
    const zoom = paintBoard.canvas?.getZoom() ?? 1
    const previous = this.points[this.points.length - 1]
    if (!isFarEnough(previous, point, screenPointGap(zoom))) {
      return false
    }
    const pressure = currentPenPressure()
    this.points.push(
      pressure == null
        ? { x: point.x, y: point.y }
        : { x: point.x, y: point.y, pressure }
    )
    return true
  }

  private schedule() {
    if (this.frame) {
      return
    }
    this.frame = requestAnimationFrame(() => {
      this.frame = 0
      this.render(false)
    })
  }

  private cancelFrame() {
    if (!this.frame) {
      return
    }
    cancelAnimationFrame(this.frame)
    this.frame = 0
  }

  private render(complete: boolean) {
    const canvas = paintBoard.canvas
    if (!canvas || !this.moved) {
      return
    }

    const state = useDrawStore.getState()
    const simulatePressure = !this.points.some(
      (point) => point.pressure != null
    )
    const input = this.points.map((point) => {
      if (simulatePressure || point.pressure == null) {
        return [point.x, point.y]
      }
      return [point.x, point.y, point.pressure]
    })
    const svg = buildFreehandPath(
      input,
      freehandSettings(state),
      canvas.getZoom() || 1,
      complete,
      simulatePressure
    )
    if (!svg) {
      if (complete && this.path) {
        canvas.remove(this.path)
        this.path = null
      }
      return
    }

    const fill = state.drawColors[state.currentDrawColor] || '#000000'
    const border = outlineStroke(
      this.outlined,
      state.freehandStrokeWidth,
      state.freehandStrokeColor,
      canvas.getZoom() || 1
    )
    const appearance = {
      fill,
      stroke: border.stroke ?? '',
      strokeWidth: border.strokeWidth,
      strokeLineCap: 'round' as const,
      strokeLineJoin: 'round' as const,
      fillRule: 'nonzero' as const,
      // Stroke first, then fill. The fill covers outline edges that pass
      // through a self-intersection, so the border only remains on the outside.
      paintFirst: border.strokeWidth > 0 ? 'stroke' : 'fill'
    }
    if (!this.path) {
      this.path = new fabric.Path(svg, {
        ...appearance,
        perPixelTargetFind: true,
        objectCaching: false
      })
      canvas.add(this.path)
    } else {
      this.path._setPath(svg)
      this.path.set({
        ...appearance,
        objectCaching: false,
        dirty: true
      })
      this.path.setCoords()
    }

    if (complete) {
      // Drawing forced this off. Remove it so the stroke follows the board cache switch.
      delete this.path.objectCaching
      this.path.dirty = true
    }
    canvas.requestRenderAll()
  }
}

const freehandSettings = (
  state: ReturnType<typeof useDrawStore.getState>
): FreehandSettings => ({
  size: state.drawWidth,
  thinning: state.freehandThinning,
  smoothing: state.freehandSmoothing,
  streamline: state.freehandStreamline,
  startTaper: state.freehandStartTaper,
  endTaper: state.freehandEndTaper
})
