import { CanvasClickEvent } from './clickEvent'
import { ObjectEvent } from './objectEvent'
import { CanvasWheelEvent } from './wheelEvent'
import { WindowEvent } from './windowEvent'

export class CanvasEvent {
  clickEvent: CanvasClickEvent
  wheelEvent: CanvasWheelEvent
  objectEvent: ObjectEvent
  windowEvent: WindowEvent

  constructor() {
    const clickEvent = new CanvasClickEvent()
    this.clickEvent = clickEvent

    const wheelEvent = new CanvasWheelEvent()
    this.wheelEvent = wheelEvent

    const objectEvent = new ObjectEvent()
    this.objectEvent = objectEvent

    const windowEvent = new WindowEvent()
    this.windowEvent = windowEvent
  }
}
