import { paintBoard } from '../paintBoard'
import { fabric } from 'fabric'
import { MAX_ZOOM, MIN_ZOOM } from './zoomEvent'

export class CanvasTouchEvent {
  isTwoTouch = false
  isDragging = false
  startPinchZoom = 1
  startDistance = 1
  startX = 0
  startY = 0
  zoomPoint?: fabric.Point
  startScale = 1
  lastPan?: fabric.Point

  constructor() {
    this.initTouchEvent()
  }

  initTouchEvent() {
    const canvas = (paintBoard?.canvas as any)?.upperCanvasEl
    if (canvas) {
      canvas.addEventListener('touchstart', this.touchStartFn, {
        passive: false
      })
      canvas.addEventListener('touchmove', this.touchMoveFn, { passive: false })
      canvas.addEventListener('touchend', this.touchEndFn, { passive: false })
    }
  }

  removeTouchEvent() {
    const canvas = (paintBoard?.canvas as any)?.upperCanvasEl
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
    if (touches.length === 2) {
      this.isTwoTouch = true
      paintBoard.multipleTouchDisableAction(true)
      const touch1 = touches[0]
      const touch2 = touches[1]
      this.startDistance = Math.hypot(
        touch2.pageX - touch1.pageX,
        touch2.pageY - touch1.pageY
      )

      this.startX = (touch1.pageX + touch2.pageX) / 2
      this.startY = (touch1.pageY + touch2.pageY) / 2

      const point = new fabric.Point(this.startX, this.startY)
      this.zoomPoint = point
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

      // 计算缩放比例
      let zoom = this.startScale * (currentDistance / this.startDistance)
      zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom))
      if (this.zoomPoint) {
        canvas.zoomToPoint(
          new fabric.Point(this.zoomPoint.x, this.zoomPoint.y),
          zoom
        )
        paintBoard.evnet?.zoomEvent.getZoomPercentage()
      }

      // 计算拖拽距离
      const currentPan = new fabric.Point(x - this.startX, y - this.startY)

      // 平移画布
      if (!this.isDragging) {
        this.isDragging = true
        this.lastPan = currentPan
      } else if (this.lastPan) {
        canvas.relativePan(
          new fabric.Point(
            currentPan.x - this.lastPan.x,
            currentPan.y - this.lastPan.y
          )
        )
        this.lastPan = currentPan
      }
    }
  }
  touchEndFn = (e: TouchEvent) => {
    this.isDragging = false
    if (this.isTwoTouch && e.touches.length === 0) {
      this.isTwoTouch = false
      paintBoard.multipleTouchDisableAction(false)
    }
  }
}
