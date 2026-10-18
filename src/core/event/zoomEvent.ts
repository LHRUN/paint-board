import useBoardStore from '@/store/board'
import { paintBoard } from '@/core/paintBoard'
import { fabric } from 'fabric'
import { ActionMode } from '@/constants'
import { DrawStyle } from '@/constants/draw'
import { getDrawWidth, getEraserWidth } from '@/core/utils/draw'
import useDrawStore from '@/store/draw'
import useFileStore from '@/store/files'
import debounce from 'lodash-es/debounce'
import { getStrokeDashArray } from '@/core/element/draw/utils'

let zoomHook: (zoom: number) => undefined
export const MIN_ZOOM = 0.3
export const MAX_ZOOM = 5
export const ZOOM_STEP = 0.1

export class CanvasZoomEvent {
  constructor() {
    this.initWheelEvent()
  }

  initWheelEvent() {
    const canvas = paintBoard?.canvas
    canvas?.on('mouse:wheel', (options) => {
      // Clear the current text input box
      paintBoard.textElement?.resetText()

      const delta = options.e.deltaY // Get the direction in which the wheel scrolls
      this.updateZoom(delta > 0 ? 'in' : 'out')
      options.e.preventDefault()
      options.e.stopPropagation()
    })
  }

  /**
   * Initialize zoom to 1
   */
  resetZoom() {
    const canvas = paintBoard.canvas
    if (canvas) {
      const canvasWidth = (canvas?.width || 1) / 2
      const canvasHeight = (canvas?.height || 1) / 2
      canvas.zoomToPoint(new fabric.Point(canvasWidth, canvasHeight), 1)
      this.scheduleZoomWrite(1)
    }
  }

  updateZoom(type: 'in' | 'out') {
    const canvas = paintBoard.canvas
    if (!canvas) {
      return
    }

    const currentZoom = canvas.getZoom()
    let zoom = currentZoom
    zoom = type === 'in' ? currentZoom + ZOOM_STEP : currentZoom - ZOOM_STEP

    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
    if (zoom < MIN_ZOOM || zoom > MAX_ZOOM) {
      return
    }

    if (!useBoardStore.getState().isObjectCaching) {
      fabric.Object.prototype.set({
        objectCaching: true
      })
    }

    const centerX = (canvas?.width || 1) / 2
    const centerY = (canvas?.height || 1) / 2
    canvas.zoomToPoint({ x: centerX, y: centerY }, zoom)

    this.scheduleZoomWrite(zoom)
  }

  cancelPendingZoomWrite() {
    this.updateZoomPercentage.cancel()
  }

  scheduleZoomWrite(zoom: number) {
    const fileId = paintBoard.canvasFileId
    if (!fileId) {
      return
    }
    this.updateZoomPercentage(true, zoom, fileId)
  }

  /**
   * Update current zoom percentage
   */
  updateZoomPercentage = debounce(
    (triggerCb = true, zoom: number, fileId: string) => {
      if (paintBoard.canvasFileId !== fileId) {
        return
      }
      const percentage = this.handleZoomPercentage(triggerCb)
      useFileStore.getState().updateZoom(zoom, fileId)
      if (!useBoardStore.getState().isObjectCaching) {
        fabric.Object.prototype.set({
          objectCaching: false
        })
      }
      paintBoard.canvas?.requestRenderAll()
      return percentage
    },
    500
  )

  handleZoomPercentage(triggerCb = true) {
    const canvas = paintBoard.canvas
    let percentage = 1
    if (canvas) {
      const curZoom = canvas.getZoom()
      percentage = Math.round(
        ((curZoom - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100
      )
      handleWidth()
    }
    if (triggerCb && zoomHook) {
      zoomHook?.(percentage)
    }
    return percentage
  }

  setZoomHook(hookFn: (zoom: number) => undefined) {
    zoomHook = hookFn
  }
}

/**
 * Change the drawing width after zooming
 */
const handleWidth = () => {
  const brush = paintBoard.canvas?.freeDrawingBrush
  if (!brush) {
    return
  }

  switch (useBoardStore.getState().mode) {
    case ActionMode.ERASE:
      brush.width = getEraserWidth()
      break
    case ActionMode.DRAW:
      if (
        [DrawStyle.Basic, DrawStyle.Material, DrawStyle.MultiColor].includes(
          useDrawStore.getState().drawStyle
        )
      ) {
        brush.width = getDrawWidth()
        brush.strokeDashArray = getStrokeDashArray()
      }
      break
    default:
      break
  }
}
