import { fabric } from 'fabric'
import { isMobile } from '@/utils/index'
import {
  advanceBrushPress,
  beginBrushPress,
  createBrushPressState,
  pointerClientPoint,
  type BrushPressState
} from './brushDrag'

let isDisableDraw = isMobile()
let pressed = false
let press: BrushPressState = createBrushPressState()

const resetPress = () => {
  pressed = false
  press = createBrushPressState()
}

type DrawingCanvas = fabric.Canvas & {
  _absolutePointer?: { x: number; y: number } | null
  _pointer?: { x: number; y: number } | null
  _isCurrentlyDrawing: boolean
}

const copyPoint = (point?: { x: number; y: number } | null) =>
  point ? { x: point.x, y: point.y } : null

const isMouseHover = (event: Event) =>
  event.type === 'mousemove' &&
  'buttons' in event &&
  (event as MouseEvent).buttons === 0

/**
 * Fabric's pencil brush paints a dot on mouse down, before any movement.
 * Hold the stroke until the pointer leaves the press point, then start it there.
 */
const startStrokeAtPress = (canvas: DrawingCanvas, event: Event) => {
  const currentAbsolute = copyPoint(canvas._absolutePointer)
  const currentPointer = copyPoint(canvas._pointer)
  if (press.origin) {
    canvas._absolutePointer = { x: press.origin.x, y: press.origin.y }
  }
  fabric.Canvas.prototype._onMouseDownInDrawingMode.call(canvas, event)
  canvas._absolutePointer = currentAbsolute
  canvas._pointer = currentPointer
  if (canvas._isCurrentlyDrawing) {
    fabric.Canvas.prototype._onMouseMoveInDrawingMode.call(canvas, event)
  }
}

class BrushMouseMixin {
  canvas: fabric.Canvas | null = null

  initCanvas(canvas: fabric.Canvas) {
    this.canvas = canvas
    this._initBrushMouse()
    canvas.on('mouse:up', resetPress)
  }

  private _initBrushMouse() {
    fabric.util.object.extend(this.canvas, {
      _onMouseDownInDrawingMode: function (this: DrawingCanvas, event: Event) {
        if (isDisableDraw) {
          return
        }

        // Keep the gesture inside Fabric's drawing mouseup path so a click
        // does not fall through into selection.
        this._isCurrentlyDrawing = true
        pressed = true
        const origin = this._absolutePointer
        press = beginBrushPress(
          pointerClientPoint(event),
          origin ? { x: origin.x, y: origin.y } : null
        )
      },
      _onMouseMoveInDrawingMode: function (this: DrawingCanvas, event: Event) {
        if (isDisableDraw) {
          return
        }

        this.setCursor(this.freeDrawingCursor ?? 'crosshair')
        if (press.drawing) {
          fabric.Canvas.prototype._onMouseMoveInDrawingMode.call(this, event)
          return
        }
        if (isMouseHover(event)) {
          return
        }

        if (!pressed) {
          this._isCurrentlyDrawing = true
          pressed = true
          const origin = this._absolutePointer
          press = beginBrushPress(
            pointerClientPoint(event),
            origin ? { x: origin.x, y: origin.y } : null
          )
          return
        }

        const client = pointerClientPoint(event)
        if (!client) {
          return
        }
        const step = advanceBrushPress(press, client)
        press = step.state
        if (!step.start) {
          return
        }
        startStrokeAtPress(this, event)
      },
      _onMouseUpInDrawingMode: function (this: DrawingCanvas, event: Event) {
        if (isDisableDraw) {
          return
        }

        if (press.drawing) {
          fabric.Canvas.prototype._onMouseUpInDrawingMode.call(this, event)
        } else {
          this._isCurrentlyDrawing = false
        }
        resetPress()
      }
    })
  }

  updateIsDisableDraw(v: boolean) {
    isDisableDraw = v
  }
}

export const brushMouseMixin = new BrushMouseMixin()
