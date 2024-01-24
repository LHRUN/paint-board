import { fabric } from 'fabric'
import 'fabric/src/mixins/eraser_brush.mixin.js'
import './common/fabricMixin/object'
import { brushMouseMixin } from './common/fabricMixin/brushMouse'

import { History } from './history'
import { ActionMode } from '@/constants'
import { DrawStyle, DrawType } from '@/constants/draw'

import { v4 as uuidv4 } from 'uuid'
import { isMobile } from './common'
import { CanvasEvent } from './event'
import { TextElement } from './element/text'
import { material } from './element/draw/material'
import { renderMultiColor } from './element/draw/multiColor'
import { renderPencilBrush } from './element/draw/basic'
import { getEraserWidth } from './common/draw'

import useFileStore from '@/store/files'
import useDrawStore from '@/store/draw'
import useBoardStore from '@/store/board'
import { debounce } from 'lodash'

/**
 * PaintBoard
 */
export class PaintBoard {
  canvas: fabric.Canvas | null = null
  evnet: CanvasEvent | null = null
  history: History | null = null
  textElement: TextElement
  hookFn: Array<() => void> = []

  constructor() {
    this.textElement = new TextElement()
  }

  initCanvas(canvasEl: HTMLCanvasElement) {
    return new Promise<boolean>((resolve) => {
      this.canvas = new fabric.Canvas(canvasEl, {
        selectionColor: 'rgba(101, 204, 138, 0.3)',
        preserveObjectStacking: true,
        enableRetinaScaling: true
      })
      fabric.Object.prototype.set({
        borderColor: '#65CC8A',
        cornerColor: '#65CC8A',
        cornerStyle: 'rect',
        borderDashArray: [3, 3],
        transparentCorners: false
      })
      fabric.Line.prototype.strokeLineJoin = 'round'
      fabric.Line.prototype.strokeLineCap = 'round'

      if (isMobile()) {
        brushMouseMixin.initCanvas(this.canvas)
      }

      this.initCanvasStorage()
      this.handleMode()

      this.evnet = new CanvasEvent()
      resolve(true)
    })
  }

  removeCanvas() {
    if (this.canvas) {
      this?.canvas?.dispose()
      this.evnet?.removeEvent()
    }
  }

  /**
   * Initialize the canvas cache
   */
  initCanvasStorage() {
    setTimeout(() => {
      const { files, currentId } = useFileStore.getState()
      const file = files?.find((item) => item?.id === currentId)
      if (file && this.canvas) {
        this.canvas.loadFromJSON(file.boardData, () => {
          if (this.canvas) {
            if (file.viewportTransform) {
              this.canvas.setViewportTransform(file.viewportTransform)
            }
            if (file?.zoom && this.canvas.width && this.canvas.height) {
              this.canvas.zoomToPoint(
                new fabric.Point(this.canvas.width / 2, this.canvas.height / 2),
                file.zoom
              )
            }

            this.canvas.setWidth(window.innerWidth * (file?.canvasWidth || 1))
            useBoardStore.getState().updateCanvasWidth(file?.canvasWidth || 1)
            this.canvas.setHeight(
              window.innerHeight * (file?.canvasHeight || 1)
            )
            useBoardStore.getState().updateCanvasHeight(file?.canvasHeight || 1)

            fabric.Object.prototype.set({
              objectCaching: useBoardStore.getState().isObjectCaching
            })
            this.canvas.renderAll()
            this.triggerHook()
            this.history = new History()
          }
        })
      }
    }, 300)
  }

  /**
   * handle mode of operation
   * @param mode current mode
   */
  handleMode(mode: string = useBoardStore.getState().mode) {
    if (!this.canvas) {
      return
    }
    let isDrawingMode = false
    let selection = false
    const objectSet: Partial<fabric.IObjectOptions> = {
      selectable: false,
      hoverCursor: 'default'
    }

    switch (mode) {
      case ActionMode.DRAW:
        if (
          useBoardStore.getState().drawType === DrawType.FreeStyle &&
          [DrawStyle.Basic, DrawStyle.Material, DrawStyle.MultiColor].includes(
            useDrawStore.getState().drawStyle
          )
        ) {
          isDrawingMode = true
          this.handleDrawStyle()
        }
        this.canvas.discardActiveObject()
        break
      case ActionMode.ERASE:
        isDrawingMode = true
        this.canvas.freeDrawingBrush = new (fabric as any).EraserBrush(
          this.canvas
        )
        this.canvas.freeDrawingBrush.width = getEraserWidth()
        this.canvas.freeDrawingBrush.color = '#FFF'
        this.canvas.discardActiveObject()
        break
      case ActionMode.Board:
      case ActionMode.SELECT:
        objectSet.selectable = true
        objectSet.hoverCursor = undefined
        selection = true
        break
      default:
        break
    }
    this.canvas.isDrawingMode = isDrawingMode
    this.canvas.selection = selection
    fabric.Object.prototype.set(objectSet)

    this.canvas.forEachObject((obj) => {
      if (obj._customType === 'itext') {
        obj.selectable = objectSet.selectable
        obj.hoverCursor = objectSet.hoverCursor
      }
    })

    this.canvas.requestRenderAll()
  }

  /**
   * handle draw style
   */
  handleDrawStyle() {
    if (!this.canvas) {
      return
    }
    const drawStyle = useDrawStore.getState().drawStyle
    switch (drawStyle) {
      case DrawStyle.Basic:
        renderPencilBrush()
        break
      case DrawStyle.Material:
        this.canvas.isDrawingMode = true
        material.render({})
        break
      case DrawStyle.MultiColor:
        renderMultiColor({})
        break
      default:
        this.canvas.isDrawingMode = false
        break
    }
  }

  /**
   * delete active objects
   */
  deleteObject() {
    // Disable deletion in text input state
    if (this.textElement.isTextEditing) {
      return
    }
    if (this.canvas) {
      const activeObjects = this.canvas.getActiveObjects()
      if (activeObjects?.length) {
        this.canvas.discardActiveObject()
        activeObjects?.forEach((obj) => {
          this.canvas?.remove(obj)
        })
        this.render()
      }
    }
  }

  /**
   * render and save history state
   */
  render() {
    if (this.canvas) {
      this.canvas?.requestRenderAll()
      this.history?.saveState()
    }
  }

  /**
   * save as Image
   */
  saveImage() {
    if (this.canvas) {
      const link = document.createElement('a')
      link.href = this.canvas.toDataURL()
      link.download = 'paint-board.png'
      link.click()
    }
  }

  /**
   * copy active objects
   */
  copyObject() {
    const canvas = this.canvas
    if (!canvas) {
      return
    }
    const targets = canvas.getActiveObjects()
    if (targets.length <= 0) {
      return
    }
    canvas.discardActiveObject()
    const copys = targets.map((target) => {
      return new Promise<fabric.Object>((resolve) => {
        target?.clone((cloned: fabric.Object) => {
          const id = uuidv4()
          cloned.set({
            left: (cloned?.left || 0) + 10,
            top: (cloned?.top || 0) + 10,
            evented: true,
            id,
            perPixelTargetFind: true
          })
          resolve(cloned)
          canvas.add(cloned)
        })
      })
    })
    Promise.all(copys).then((objs) => {
      const activeSelection = new fabric.ActiveSelection(objs, {
        canvas: canvas
      })
      canvas.setActiveObject(activeSelection)
      this.render()
    })
  }

  /**
   * Moving active objects via fabric's bringForward method
   */
  bringForWard() {
    const canvas = this.canvas
    if (canvas) {
      const object = canvas.getActiveObject()
      if (object) {
        canvas.bringForward(object, true)
        this.render()
      }
    }
  }

  /**
   * Moving active objects via fabric's sendBackwards method
   */
  seendBackWard() {
    const canvas = this.canvas
    if (canvas) {
      const object = canvas.getActiveObject()
      if (object) {
        canvas.sendBackwards(object, true)
        this.render()
      }
    }
  }

  /**
   * Moving active objects via fabric's bringToFront method
   */
  bringToFront() {
    const canvas = this.canvas
    if (canvas) {
      const object = canvas.getActiveObject()
      if (object) {
        canvas.bringToFront(object)
        this.render()
      }
    }
  }

  /**
   * Moving active objects via fabric's sendToBack method
   */
  sendToBack() {
    const canvas = this.canvas
    if (canvas) {
      const object = canvas.getActiveObject()
      if (object) {
        canvas.sendToBack(object)
        this.render()
      }
    }
  }

  /**
   * Add hook fn to trigger on update
   * @param fn hook fn
   */
  addHookFn(fn: () => void) {
    this.hookFn.push(fn)
  }

  /**
   * remove trigger hook fn
   * @param fn hook fn
   */
  removeHookFn(fn: () => void) {
    const hookIndex = this.hookFn.findIndex((v) => v === fn)
    if (hookIndex > -1) {
      this.hookFn.splice(hookIndex, 1)
    }
  }

  /**
   * trigger hook fn
   */
  triggerHook() {
    this.hookFn.map((fn) => {
      fn?.()
    })
  }

  updateCanvasWidth = debounce((width) => {
    if (this.canvas) {
      this.canvas.setWidth(window.innerWidth * width)
      useFileStore.getState().updateCanvasWidth(width)
    }
  }, 500)

  updateCanvasHeight = debounce((height) => {
    if (this.canvas) {
      this.canvas.setHeight(window.innerHeight * height)
      useFileStore.getState().updateCanvasHeight(height)
    }
  }, 500)
}

export const paintBoard = new PaintBoard()
