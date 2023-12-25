import { paintBoard } from '../paintBoard'

export class CanvasTouchEvent {
  constructor() {
    this.initTouchEvent()
  }

  initTouchEvent() {
    const canvas = paintBoard?.canvas?.upperCanvasEl
    console.log('initTouchEvent', canvas)
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
    console.log('removeTouchEvent', canvas)
    if (canvas) {
      canvas.removeEventListener('touchend', this.touchStartFn)
      canvas.removeEventListener('touchmove', this.touchMoveFn)
      canvas.removeEventListener('touchend', this.touchEndFn)
    }
  }

  touchStartFn(e: TouchEvent) {
    console.log('touchStartFn', e)
  }
  touchMoveFn(e: TouchEvent) {
    console.log('touchMoveFn', e)
    e.preventDefault()
  }
  touchEndFn(e: TouchEvent) {
    console.log('touchEndFn', e)
  }
}
