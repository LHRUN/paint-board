import { fabric } from 'fabric'
import 'fabric/src/mixins/eraser_brush.mixin.js'
import { brushMouseMixin } from './fabricMixin/brushMouse'
import { alignGuideLine } from './fabricMixin/alignGuideLine'
import './fabricMixin/extendPrototype'

import { History } from './history'
import { ActionMode, ELEMENT_CUSTOM_TYPE } from '@/constants'
import { DrawStyle, DrawType } from '@/constants/draw'

import debounce from 'lodash-es/debounce'
import { isMobile } from '@/utils'
import { EventModule } from './event'
import { TextElement } from './element/text/index'
import { material } from './element/draw/material'
import { renderMultiColor } from './element/draw/multiColor'
import { renderPencilBrush } from './element/draw/basic'
import { getEraserWidth } from './utils/draw'
import {
  getCanvasJSON,
  handleFileListData,
  handleCanvasJSONLoaded
} from './utils/loadCanvas'
import { cloneObjects } from './utils/object'
import { followupAfterBoardLoad } from './session/boardLoad'
import { isCurrentCanvasLoad } from './session/canvasWrite'

import useFileStore, { waitForFilesHydration } from '@/store/files'
import useDrawStore from '@/store/draw'
import useBoardStore from '@/store/board'

interface BoardLoadJob {
  serial: number
  boardData: object
  done: (committed: boolean) => void
  running: boolean
  settled: boolean
  staleNotified: boolean
}

/**
 * PaintBoard
 */
export class PaintBoard {
  canvas: fabric.Canvas | null = null
  evnet: EventModule | null = null
  history: History | null = null
  /**
   * File id represented by the current canvas pixels.
   * Null while a file is loading, so saves cannot land on another file.
   */
  canvasFileId: string | null = null
  textElement: TextElement
  hookFn: Array<() => void> = []
  private loadGeneration = 0
  private loadSerial = 0
  private latestBoardLoad: BoardLoadJob | null = null

  constructor() {
    this.textElement = new TextElement()
  }

  async initCanvas(canvasEl: HTMLCanvasElement) {
    this.canvas = new fabric.Canvas(canvasEl, {
      selectionColor: 'rgba(101, 204, 138, 0.3)',
      preserveObjectStacking: true,
      enableRetinaScaling: true,
      backgroundVpt: false
    })
    fabric.Object.prototype.set({
      borderColor: '#65CC8A',
      cornerColor: '#65CC8A',
      cornerStyle: 'circle',
      borderDashArray: [3, 3],
      transparentCorners: false
    })
    fabric.Line.prototype.strokeLineJoin = 'round'
    fabric.Line.prototype.strokeLineCap = 'round'

    if (isMobile()) {
      brushMouseMixin.initCanvas(this.canvas)
    }
    alignGuideLine.init(this.canvas, useBoardStore.getState().openGuideLine)

    this.evnet = new EventModule()
    this.handleMode()

    const canvas = this.canvas
    await waitForFilesHydration()
    // A newer initCanvas may have replaced this canvas while hydration was in flight.
    if (this.canvas !== canvas) {
      return false
    }
    handleFileListData()
    await this.loadFile(useFileStore.getState().currentId)

    return !!this.canvas
  }

  removeCanvas() {
    this.flushCurrentFile()
    this.loadGeneration += 1
    this.canvasFileId = null
    this.cancelPendingFileWrites()
    if (this.canvas) {
      this.canvas.dispose()
      this.evnet?.removeEvent()
      this.canvas = null
    }
  }

  getLoadGeneration() {
    return this.loadGeneration
  }

  /**
   * Write the visible canvas back to the file it belongs to.
   */
  flushCurrentFile() {
    const fileId = this.canvasFileId
    const canvas = this.canvas
    if (!fileId || !canvas) {
      return
    }
    const canvasJson = getCanvasJSON()
    useFileStore.getState().updateBoardData(canvasJson, fileId)
    this.history?.replaceCurrentSnapshot(canvasJson)
    if (canvas.viewportTransform) {
      useFileStore
        .getState()
        .updateTransform([...canvas.viewportTransform], fileId)
    }
    useFileStore.getState().updateZoom(canvas.getZoom(), fileId)
  }

  /**
   * Save the current file, then load another one.
   */
  switchFile(nextId: string) {
    if (!nextId || nextId === useFileStore.getState().currentId) {
      return Promise.resolve(false)
    }
    this.flushCurrentFile()
    this.invalidatePendingLoad()
    useFileStore.getState().updateCurrentFile(nextId)
    return this.loadFile(nextId)
  }

  /**
   * Drop the visible canvas without writing it, then load a file.
   * Used when the current file has just been deleted.
   */
  discardAndLoad(nextId: string) {
    this.invalidatePendingLoad()
    return this.loadFile(nextId)
  }

  /**
   * Save the current file and detach the canvas before the current id changes.
   */
  prepareForFileReplacement() {
    this.flushCurrentFile()
    this.invalidatePendingLoad()
  }

  loadFile(fileId: string) {
    const generation = ++this.loadGeneration
    this.canvasFileId = null
    this.setCanvasInteractive(false)

    return new Promise<boolean>((resolve) => {
      const canvas = this.canvas
      const finish = (loaded: boolean) => {
        if (generation === this.loadGeneration) {
          this.setCanvasInteractive(true)
        }
        resolve(loaded)
      }

      if (
        !canvas ||
        !isCurrentCanvasLoad(
          generation,
          this.loadGeneration,
          fileId,
          useFileStore.getState().currentId
        )
      ) {
        finish(false)
        return
      }

      const file = useFileStore
        .getState()
        .files.find((item) => item.id === fileId)
      if (!file) {
        finish(false)
        return
      }

      canvas.clear()
      this.applyCanvasJson(file.boardData || {}, (committed) => {
        if (
          !committed ||
          !this.canvas ||
          !isCurrentCanvasLoad(
            generation,
            this.loadGeneration,
            fileId,
            useFileStore.getState().currentId
          )
        ) {
          finish(false)
          return
        }

        const latest = useFileStore
          .getState()
          .files.find((item) => item.id === fileId)
        if (!latest) {
          finish(false)
          return
        }

        if (latest.viewportTransform) {
          this.canvas.setViewportTransform(latest.viewportTransform)
        }
        this.canvas.setWidth(window.innerWidth * (latest.canvasWidth || 1))
        this.canvas.setHeight(window.innerHeight * (latest.canvasHeight || 1))
        if (latest.zoom && this.canvas.width && this.canvas.height) {
          this.canvas.zoomToPoint(
            new fabric.Point(this.canvas.width / 2, this.canvas.height / 2),
            latest.zoom
          )
          this.evnet?.zoomEvent.handleZoomPercentage()
        }

        handleCanvasJSONLoaded(this.canvas)
        fabric.Object.prototype.set({
          objectCaching: useBoardStore.getState().isObjectCaching
        })
        this.canvas.renderAll()
        this.canvasFileId = fileId
        this.history = new History()
        this.triggerHook()
        finish(true)
      })
    })
  }

  /**
   * Apply Fabric JSON. An older load that finishes late must not start a second
   * loadFromJSON while the newest one is still applying. If it replaces the canvas
   * after the newest load has committed, replay that load once so its controls rebuild.
   */
  applyCanvasJson(boardData: object, done: (committed: boolean) => void) {
    const serial = ++this.loadSerial
    const job: BoardLoadJob = {
      serial,
      boardData,
      done,
      running: false,
      settled: false,
      staleNotified: false
    }
    this.latestBoardLoad = job
    this.runBoardLoad(job)
  }

  private runBoardLoad(job: BoardLoadJob) {
    const canvas = this.canvas
    if (!canvas) {
      this.failBoardLoad(job)
      return
    }
    if (job.running) {
      return
    }
    job.running = true
    canvas.loadFromJSON(job.boardData, () => {
      job.running = false
      const latest = this.latestBoardLoad
      const action = followupAfterBoardLoad({
        callbackIsLatest: job.serial === this.loadSerial,
        callbackCanvasMatches: this.canvas === canvas,
        latestAvailable: !!latest && latest.serial === this.loadSerial,
        latestRunning: !!latest?.running,
        latestSettled: !!latest?.settled
      })

      if (action === 'commit') {
        job.settled = true
        job.done(true)
        return
      }
      if (action === 'ignore') {
        return
      }
      this.failBoardLoad(job)
      if (
        action !== 'replay' ||
        !latest ||
        latest.serial !== this.loadSerial ||
        latest.running
      ) {
        return
      }
      // The stale load already replaced the objects. Allow the success callback
      // to run again so endpoint controls are rebuilt on the restored objects.
      latest.settled = false
      this.runBoardLoad(latest)
    })
  }

  private failBoardLoad(job: BoardLoadJob) {
    if (job.staleNotified || job.settled) {
      return
    }
    job.staleNotified = true
    job.done(false)
  }

  private invalidatePendingLoad() {
    this.loadGeneration += 1
    this.canvasFileId = null
    this.cancelPendingFileWrites()
  }

  private cancelPendingFileWrites() {
    this.updateCanvasWidth.cancel()
    this.updateCanvasHeight.cancel()
    this.evnet?.zoomEvent.cancelPendingZoomWrite()
    this.evnet?.touchEvent.canvasTransformHandler.cancelPending()
  }

  setCanvasInteractive(interactive: boolean) {
    const upperCanvas = this.canvas?.upperCanvasEl
    if (!upperCanvas) {
      return
    }
    upperCanvas.style.pointerEvents = interactive ? '' : 'none'
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
      if (obj._customType === ELEMENT_CUSTOM_TYPE.I_TEXT) {
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
   * copy active objects
   */
  copyObject() {
    const canvas = this.canvas
    if (!canvas) {
      return
    }
    const objects = canvas.getActiveObjects()
    if (objects.length <= 0) {
      return
    }

    cloneObjects(objects)
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

  updateCanvasWidth = debounce((width: number, fileId: string) => {
    if (this.canvas && this.canvasFileId === fileId) {
      this.canvas.setWidth(window.innerWidth * width)
    }
  }, 500)

  updateCanvasHeight = debounce((height: number, fileId: string) => {
    if (this.canvas && this.canvasFileId === fileId) {
      this.canvas.setHeight(window.innerHeight * height)
    }
  }, 500)
}

export const paintBoard = new PaintBoard()
