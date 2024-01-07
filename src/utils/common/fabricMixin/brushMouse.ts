import { fabric } from 'fabric'
import { isMobile } from '../index'

let isMouseDown = false
let isDisableDraw = isMobile()

class BrushMouseMixin {
  canvas: fabric.Canvas | null = null

  initCanvas(canvas: fabric.Canvas) {
    this.canvas = canvas
    this._initBrushMouse()
  }

  private _initBrushMouse() {
    fabric.util.object.extend(this.canvas, {
      _onMouseDownInDrawingMode: function () {
        if (isDisableDraw) {
          return
        }

        // fabric.Canvas.prototype._onMouseDownInDrawingMode.call(this, event)
      },
      _onMouseMoveInDrawingMode: function (event: Event) {
        if (isDisableDraw) {
          return
        }

        if (isMouseDown) {
          fabric.Canvas.prototype._onMouseMoveInDrawingMode.call(this, event)
        } else {
          isMouseDown = true
          fabric.Canvas.prototype._onMouseDownInDrawingMode.call(this, event)
        }
      },
      _onMouseUpInDrawingMode: function (event: Event) {
        if (isDisableDraw) {
          return
        }

        isMouseDown = false
        fabric.Canvas.prototype._onMouseUpInDrawingMode.call(this, event)
      }
    })
  }

  updateIsDisableDraw(v: boolean) {
    isDisableDraw = v
  }
}

export const brushMouseMixin = new BrushMouseMixin()
