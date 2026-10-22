import { fabric } from 'fabric'
import { EraserCursor } from '@/core/element/eraser/cursor'
import { CanvasMouseEvent } from './mouseEvent'
import { ImageDrop } from './imageDrop'
import { ObjectEvent } from './objectEvent'
import { CanvasTouchEvent } from './touchEvent'
import { CanvasZoomEvent } from './zoomEvent'
import { WindowEvent } from './windowEvent'

export class EventModule {
  eraserCursor: EraserCursor
  imageDrop: ImageDrop
  mouseEvent: CanvasMouseEvent
  zoomEvent: CanvasZoomEvent
  objectEvent: ObjectEvent
  windowEvent: WindowEvent
  touchEvent: CanvasTouchEvent

  constructor(canvas: fabric.Canvas | null) {
    this.eraserCursor = new EraserCursor()
    this.imageDrop = new ImageDrop()
    if (canvas) {
      this.eraserCursor.attach(canvas)
      this.imageDrop.attach(canvas)
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
    this.imageDrop.detach()
    this.windowEvent.removeWindowEvents()
    this.touchEvent.removeTouchEvents()
  }
}
