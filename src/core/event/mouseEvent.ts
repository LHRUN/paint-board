import { fabric } from 'fabric'
import { paintBoard } from '@/core/paintBoard'
import { isCanvasTextObject } from '@/core/element/text/placeholder'
import { EraserCursor } from '@/core/element/eraser/cursor'
import { DrawingHandler } from './draw/drawingHandler'

export class CanvasMouseEvent {
  drawingHandler: DrawingHandler
  isMouseDown = false
  isSpaceKeyDown = false
  private eraserCursor: EraserCursor

  constructor(eraserCursor: EraserCursor) {
    this.eraserCursor = eraserCursor
    this.drawingHandler = new DrawingHandler()
    this.initMouseEvents()
  }

  initMouseEvents() {
    const canvas = paintBoard.canvas

    canvas?.on('mouse:down', (e) => {
      this.isMouseDown = true
      if (this.isSpaceKeyDown) {
        return
      }

      if (e.absolutePointer) {
        this.drawingHandler.drawingStart(e.absolutePointer)
      }
    })

    // Drawing mode returns before `mouse:move`, but `mouse:move:before`
    // still carries the pointer. The eraser ring follows that event.
    canvas?.on('mouse:move:before', (e) => {
      this.eraserCursor.move(e.e)
    })

    canvas?.on('mouse:out', (e) => {
      if (e.e.type === 'mouseout') {
        this.eraserCursor.leave()
      }
    })

    canvas?.on('mouse:move', (e) => {
      if (this.isMouseDown) {
        // Press space, drag the canvas, stop drawing.
        if (this.isSpaceKeyDown) {
          canvas.relativePan(new fabric.Point(e.e.movementX, e.e.movementY))
          return
        }

        // two touch disabled drawing on mobile
        const touches = paintBoard.evnet?.touchEvent?.touches
        if (touches && touches >= 2) {
          return
        }

        if (e.absolutePointer) {
          this.drawingHandler.handDrawing(e.absolutePointer)
        }
      }
    })

    canvas?.on('mouse:up', (e) => {
      this.isMouseDown = false

      if (e.absolutePointer) {
        this.drawingHandler.drawingEnd(e.absolutePointer)
      }
    })

    canvas?.on('mouse:dblclick', (e) => {
      if (!isCanvasTextObject(e.target)) {
        return
      }
      paintBoard.textElement?.editText(e.target as fabric.IText)
    })
  }

  setSpaceKeyDownState(isSpaceKeyDown: boolean) {
    this.isSpaceKeyDown = isSpaceKeyDown
  }
}
