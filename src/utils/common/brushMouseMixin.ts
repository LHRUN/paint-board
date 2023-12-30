import { fabric } from 'fabric'
import { isMobile } from './index'

let isMouseDown = false
let isOnePointDown = !isMobile()

class BrushMouseMixin {
  canvas: fabric.Canvas | null = null

  initCanvas(canvas: fabric.Canvas) {
    this.canvas = canvas
    this._initBrushMouse()
  }

  private _initBrushMouse() {
    fabric.util.object.extend(this.canvas, {
      _onMouseDownInDrawingMode: function () {
        if (!isOnePointDown) {
          return
        }

        // fabric.Canvas.prototype._onMouseDownInDrawingMode.call(this, event)
      }
    })
    fabric.util.object.extend(this.canvas, {
      _onMouseMoveInDrawingMode: function (event: Event) {
        if (!isOnePointDown) {
          return
        }

        if (isMouseDown) {
          fabric.Canvas.prototype._onMouseMoveInDrawingMode.call(this, event)
        } else {
          isMouseDown = true
          fabric.Canvas.prototype._onMouseDownInDrawingMode.call(this, event)
        }
      }
    })
    fabric.util.object.extend(this.canvas, {
      _onMouseUpInDrawingMode: function (event: Event) {
        if (!isOnePointDown) {
          return
        }

        isMouseDown = false
        fabric.Canvas.prototype._onMouseUpInDrawingMode.call(this, event)
      }
    })
  }

  updateIsOnePointDown(v: boolean) {
    isOnePointDown = v
  }
}

export const brushMouseMixin = new BrushMouseMixin()
