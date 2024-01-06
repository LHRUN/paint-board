import { ReticulateElement } from './../element/draw/reticulate'
import { fabric } from 'fabric'
import { DrawStyle, ActionMode } from '@/constants'
import { paintBoard } from '../paintBoard'
import { ShapeElement } from '../element/draw/shape'
import { PixelsElement } from '../element/draw/pixels'
import { DrawTextElement } from '../element/draw/text'
import { MultiLineElement } from '../element/draw/multiLine'
import { RainbowElement } from '../element/draw/rainbow'
import { ThornElement } from '../element/draw/thorn'
import { MultiPointElement } from '../element/draw/multiPoint'
import { WiggleElement } from '../element/draw/wiggle'

import useDrawStore from '@/store/draw'
import useBoardStore from '@/store/board'

export class CanvasClickEvent {
  isMouseDown = false
  isSpaceKeyDown = false
  currentElement:
    | ShapeElement
    | PixelsElement
    | DrawTextElement
    | MultiLineElement
    | ReticulateElement
    | RainbowElement
    | ThornElement
    | MultiPointElement
    | WiggleElement
    | null = null // The current mouse move draws the element

  constructor() {
    this.initClickEvent()
  }

  initClickEvent() {
    const canvas = paintBoard.canvas

    canvas?.on('mouse:down', () => {
      this.isMouseDown = true
      if (this.isSpaceKeyDown) {
        return
      }
      let currentElement = null
      if (useBoardStore.getState().mode === ActionMode.DRAW) {
        switch (useDrawStore.getState().drawStyle) {
          case DrawStyle.Shape:
            currentElement = new ShapeElement()
            break
          case DrawStyle.Pixels:
            currentElement = new PixelsElement()
            break
          case DrawStyle.Text:
            currentElement = new DrawTextElement()
            break
          case DrawStyle.MultiLine:
            currentElement = new MultiLineElement()
            break
          case DrawStyle.Reticulate:
            currentElement = new ReticulateElement()
            break
          case DrawStyle.Rainbow:
            currentElement = new RainbowElement()
            break
          case DrawStyle.Thorn:
            currentElement = new ThornElement()
            break
          case DrawStyle.MultiPoint:
            currentElement = new MultiPointElement()
            break
          case DrawStyle.Wiggle:
            currentElement = new WiggleElement()
            break
          default:
            break
        }
      }
      this.currentElement = currentElement
    })
    canvas?.on('mouse:move', (e) => {
      if (this.isMouseDown) {
        // Press space, drag the canvas, stop drawing.
        if (this.isSpaceKeyDown) {
          canvas.relativePan(new fabric.Point(e.e.movementX, e.e.movementY))
          return
        }

        // two touch disabled drawing on mobile
        if (paintBoard.evnet?.touchEvent.isTwoTouch) {
          return
        }

        if (
          useBoardStore.getState().mode === ActionMode.DRAW &&
          this.currentElement
        ) {
          switch (useDrawStore.getState().drawStyle) {
            case DrawStyle.Shape:
              this.currentElement?.addPosition(e.absolutePointer)
              break
            case DrawStyle.Basic:
              this.currentElement?.addPosition(e.absolutePointer)
              break
            case DrawStyle.Pixels:
              this.currentElement?.addPosition(e.absolutePointer)
              break
            case DrawStyle.Text:
              this.currentElement?.addPosition(e.absolutePointer)
              break
            case DrawStyle.MultiLine:
              this.currentElement?.addPosition(e.absolutePointer)
              break
            case DrawStyle.Reticulate:
              this.currentElement?.addPosition(e.absolutePointer)
              break
            case DrawStyle.Rainbow:
              this.currentElement?.addPosition(e.absolutePointer)
              break
            case DrawStyle.Thorn:
              this.currentElement?.addPosition(e.absolutePointer)
              break
            case DrawStyle.MultiPoint:
              this.currentElement?.addPosition(e.absolutePointer)
              break
            case DrawStyle.Wiggle:
              this.currentElement?.addPosition(e.absolutePointer)
              break
            default:
              break
          }
        }
      }
    })
    canvas?.on('mouse:up', () => {
      this.isMouseDown = false
      if (this.currentElement) {
        this.currentElement = null
        paintBoard.history?.saveState()
      }
    })
  }

  setSpaceKeyDownState(isSpaceKeyDown: boolean) {
    this.isSpaceKeyDown = isSpaceKeyDown
  }
}
