import useBoardStore from '@/store/board'
import { paintBoard } from '../paintBoard'
import { fabric } from 'fabric'
import { ActionMode, DrawStyle } from '@/constants'
import { getDrawWidth, getEraserWidth, getShadowWidth } from '../common/draw'
import useDrawStore from '@/store/draw'
import useFileStore from '@/store/files'

let zoomHook: (zoom: number) => undefined
export const MIN_ZOOM = 0.3
export const MAX_ZOOM = 5

export class CanvasZoomEvent {
  constructor() {
    this.initWheelEvent()
  }

  initWheelEvent() {
    const canvas = paintBoard?.canvas
    canvas?.on('mouse:wheel', (options) => {
      paintBoard.textElement?.resetText()

      const delta = options.e.deltaY // 获取滚轮滚动的方向

      // 根据滚轮方向调整缩放比例
      let zoom = canvas.getZoom()
      zoom = delta > 0 ? zoom * 1.05 : zoom / 1.05

      if (zoom < MIN_ZOOM || zoom > MAX_ZOOM) {
        return
      }

      const pointer = paintBoard.canvas?.getPointer(options.e)

      const canvasWidth = (canvas?.width || 1) / 2
      const canvasHeight = (canvas?.height || 1) / 2
      zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
      canvas.zoomToPoint(
        { x: pointer?.x ?? canvasWidth, y: pointer?.y ?? canvasHeight },
        zoom
      )
      useFileStore.getState().updateZoom(zoom)
      options.e.preventDefault()
      options.e.stopPropagation()
      this.getZoomPercentage()
    })
  }

  initZoom() {
    const canvas = paintBoard.canvas
    if (canvas) {
      const canvasWidth = (canvas?.width || 1) / 2
      const canvasHeight = (canvas?.height || 1) / 2
      canvas.zoomToPoint(new fabric.Point(canvasWidth, canvasHeight), 1)
      useFileStore.getState().updateZoom(1)
      this.getZoomPercentage()
    }
  }

  getZoomPercentage(triggerCb = true) {
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
        [DrawStyle.Basic, DrawStyle.Material].includes(
          useDrawStore.getState().drawStyle
        )
      ) {
        brush.width = getDrawWidth()
        if (useDrawStore.getState().drawStyle === DrawStyle.Basic) {
          ;(brush.shadow as fabric.Shadow).blur = getShadowWidth()
        }
      }
      break
    default:
      break
  }
}
