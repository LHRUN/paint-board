import { fabric } from 'fabric'
import { EraserCursor } from '@/core/element/eraser/cursor'
import { CanvasMouseEvent } from './mouseEvent'
import { ObjectEvent } from './objectEvent'
import { CanvasTouchEvent } from './touchEvent'
import { CanvasZoomEvent } from './zoomEvent'
import { WindowEvent } from './windowEvent'

export class EventModule {
  eraserCursor: EraserCursor
  mouseEvent: CanvasMouseEvent
  zoomEvent: CanvasZoomEvent
  objectEvent: ObjectEvent
  windowEvent: WindowEvent
  touchEvent: CanvasTouchEvent

  constructor(canvas: fabric.Canvas | null) {
    this.eraserCursor = new EraserCursor()
    if (canvas) {
      this.eraserCursor.attach(canvas)
    }
    const mouseEvent = new CanvasMouseEvent(this.eraserCursor)
    this.mouseEvent = mouseEvent

    const zoomEvent = new CanvasZoomEvent()
    this.zoomEvent = zoomEvent

    const objectEvent = new ObjectEvent()
    this.objectEvent = objectEvent

    const windowEvent = new WindowEvent()
    this.windowEvent = windowEvent

    const touchEvent = new CanvasTouchEvent()
    this.touchEvent = touchEvent
  }

  removeEvent() {
    this.eraserCursor.detach()
    this.windowEvent.removeWindowEvents()
    this.touchEvent.removeTouchEvents()
  }
}
