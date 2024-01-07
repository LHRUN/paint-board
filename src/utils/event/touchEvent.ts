import { paintBoard } from '../paintBoard'
import { fabric } from 'fabric'
import { MAX_ZOOM, MIN_ZOOM } from './zoomEvent'
import { debounce } from 'lodash'
import { brushMouseMixin } from '../common/fabricMixin/brushMouse'
import useFileStore from '@/store/files'
import useBoardStore from '@/store/board'

export class CanvasTouchEvent {
  isTwoTouch = false
  isDragging = false
  startDistance = 1 // record the starting two-finger distance
  startX = 0 // start center X
  startY = 0 // start center Y
  startScale = 1
  lastPan?: fabric.Point

  constructor() {
    this.initTouchEvent()
  }

  initTouchEvent() {
    const canvas = paintBoard?.canvas?.upperCanvasEl
    if (canvas) {
      canvas.addEventListener('touchstart', this.touchStartFn, {
        passive: false
      })
      canvas.addEventListener('touchmove', this.touchMoveFn, { passive: false })
      canvas.addEventListener('touchend', this.touchEndFn, { passive: false })
    }
  }

  removeTouchEvent() {
    const canvas = paintBoard?.canvas?.upperCanvasEl
    if (canvas) {
      canvas.removeEventListener('touchstart', this.touchStartFn)
      canvas.removeEventListener('touchmove', this.touchMoveFn)
      canvas.removeEventListener('touchend', this.touchEndFn)
    }
  }

  touchStartFn = (e: TouchEvent) => {
    e.preventDefault()
    const canvas = paintBoard.canvas
    if (!canvas) {
      return
    }
    const touches = e.touches

    brushMouseMixin.updateIsDisableDraw(touches.length >= 2)

    if (touches.length === 2) {
      this.isTwoTouch = true
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
  }
  touchMoveFn = (e: TouchEvent) => {
    e.preventDefault()

    const canvas = paintBoard.canvas
    if (!canvas) {
      return
    }
    const touches = e.touches

    if (touches.length === 2) {
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
      paintBoard.evnet?.zoomEvent.updateZoomPercentage(true, zoom)

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
        this.saveTransform()
      }
    }
  }
  touchEndFn = (e: TouchEvent) => {
    this.isDragging = false
    if (this.isTwoTouch && e.touches.length === 0) {
      this.isTwoTouch = false
    }
  }

  saveTransform = debounce(() => {
    const transform = paintBoard.canvas?.viewportTransform
    if (transform) {
      useFileStore.getState().updateTransform(transform)
      if (!useBoardStore.getState().isObjectCaching) {
        fabric.Object.prototype.set({
          objectCaching: false
        })
      }
      paintBoard.canvas?.requestRenderAll()
    }
  }, 500)
}
