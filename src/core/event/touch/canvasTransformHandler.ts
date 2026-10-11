import { fabric } from 'fabric'
import debounce from 'lodash-es/debounce'
import { paintBoard } from '@/core/paintBoard'

import { MAX_ZOOM, MIN_ZOOM } from '../zoomEvent'
import useBoardStore from '@/store/board'
import useFileStore from '@/store/files'

/**
 * canvas transform handler
 * zoom and pan
 */
export class CanvasTransformHandler {
  isDragging = false
  startDistance = 1 // record the starting two-finger distance
  startX = 0 // start center X
  startY = 0 // start center Y
  startScale = 1
  lastPan?: fabric.Point

  reset() {
    this.isDragging = false
    this.startDistance = 1
    this.startX = 0
    this.startY = 0
    this.startScale = 1
    this.lastPan = undefined
  }

  transformStart(touches: TouchList) {
    const canvas = paintBoard.canvas
    if (!canvas || touches.length !== 2) {
      return
    }

    const touch1 = touches[0]
    const touch2 = touches[1]
    this.startDistance = Math.hypot(
      touch2.pageX - touch1.pageX,
      touch2.pageY - touch1.pageY
    )

    this.startX = (touch1.pageX + touch2.pageX) / 2
    this.startY = (touch1.pageY + touch2.pageY) / 2
    this.startScale = canvas.getZoom()
  }

  transformMove(touches: TouchList) {
    const canvas = paintBoard.canvas
    if (!canvas || touches.length !== 2) {
      return
    }

    const touch1 = touches[0]
    const touch2 = touches[1]

    const currentDistance = Math.hypot(
      touch2.pageX - touch1.pageX,
      touch2.pageY - touch1.pageY
    )

    const x = (touch1.pageX + touch2.pageX) / 2
    const y = (touch1.pageY + touch2.pageY) / 2

    // Calculate zoom
    let zoom = this.startScale * (currentDistance / this.startDistance)
    zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
    if (!useBoardStore.getState().isObjectCaching) {
      fabric.Object.prototype.set({
        objectCaching: true
      })
    }
    canvas.zoomToPoint(new fabric.Point(this.startX, this.startY), zoom)
    paintBoard.evnet?.zoomEvent.scheduleZoomWrite(zoom)

    // Calculate drag distance
    const currentPan = new fabric.Point(x - this.startX, y - this.startY)

    // move canvas
    if (!this.isDragging) {
      this.isDragging = true
      this.lastPan = currentPan
    } else if (this.lastPan) {
      if (!useBoardStore.getState().isObjectCaching) {
        fabric.Object.prototype.set({
          objectCaching: true
        })
      }
      canvas.relativePan(
        new fabric.Point(
          currentPan.x - this.lastPan.x,
          currentPan.y - this.lastPan.y
        )
      )
      this.lastPan = currentPan
      const fileId = paintBoard.canvasFileId
      const transform = canvas.viewportTransform
      if (fileId && transform) {
        this.saveTransform(fileId, [...transform])
      }
    }
  }

  transformEnd() {
    this.isDragging = false
  }

  cancelPending() {
    this.saveTransform.cancel()
  }

  private saveTransform = debounce((fileId: string, transform: number[]) => {
    if (paintBoard.canvasFileId !== fileId) {
      return
    }
    useFileStore.getState().updateTransform(transform, fileId)
    if (!useBoardStore.getState().isObjectCaching) {
      fabric.Object.prototype.set({
        objectCaching: false
      })
    }
    paintBoard.canvas?.requestRenderAll()
  }, 500)
}
