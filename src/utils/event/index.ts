import { CanvasClickEvent } from './clickEvent'
import { ObjectEvent } from './objectEvent'
import { CanvasTouchEvent } from './touchEvent'
import { CanvasWheelEvent } from './wheelEvent'
import { WindowEvent } from './windowEvent'

export class CanvasEvent {
  clickEvent: CanvasClickEvent
  wheelEvent: CanvasWheelEvent
  objectEvent: ObjectEvent
  windowEvent: WindowEvent
  touchEvent: CanvasTouchEvent

  constructor() {
    const clickEvent = new CanvasClickEvent()
    this.clickEvent = clickEvent

    const wheelEvent = new CanvasWheelEvent()
    this.wheelEvent = wheelEvent

    const objectEvent = new ObjectEvent()
    this.objectEvent = objectEvent

    const windowEvent = new WindowEvent()
    this.windowEvent = windowEvent

    const touchEvent = new CanvasTouchEvent()
    this.touchEvent = touchEvent
  }

  removeEvent() {
    this.windowEvent.removeWindowEvent()
    this.touchEvent.removeTouchEvent()
  }
}
