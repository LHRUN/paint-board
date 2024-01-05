import useFileStore, { IBoardData } from '@/store/files'
import { paintBoard } from './paintBoard'
import { fabric } from 'fabric'
import { diff, unpatch, patch, Delta } from 'jsondiffpatch'
import { cloneDeep } from 'lodash'

const initState = {}

/**
 * Operation History
 */
export class History {
  diffs: Array<Delta> = []
  canvasData: Partial<IBoardData> = {}
  index = 0

  constructor() {
    const canvas = paintBoard.canvas
    if (canvas) {
      const canvasJson = canvas.toDatalessJSON()
      this.canvasData = canvasJson
    }
    fabric.Object.prototype.toObject = (function (toObject) {
      return function (propertiesToInclude) {
        propertiesToInclude = (propertiesToInclude || []).concat([
          'id',
          '_customType',
          'perPixelTargetFind'
        ])
        return toObject?.apply(this, [propertiesToInclude])
      }
    })(fabric.Object.prototype?.toObject)
  }

  saveState() {
    const canvas = paintBoard?.canvas
    if (canvas) {
      this.diffs = this.diffs.slice(0, this.index + 1)
      const canvasJson = canvas.toDatalessJSON()
      const delta = diff(canvasJson, this.canvasData)
      this.diffs.push(delta)
      if (this.diffs.length > 50) {
        this.diffs.shift()
      } else {
        this.index++
      }
      this.canvasData = {
        version: canvasJson?.version ?? '',
        objects: cloneDeep(canvasJson?.objects ?? [])
      }
      useFileStore.getState().updateBoardData(canvasJson)
    }
  }

  undo() {
    const canvas = paintBoard?.canvas
    if (canvas && this.index > 0) {
      const delta = this.diffs[this.index - 1]
      this.index--
      const canvasJson = patch(this.canvasData, delta) as IBoardData
      canvas.loadFromJSON(canvasJson, () => {
        canvas.requestRenderAll()
        useFileStore.getState().updateBoardData(canvasJson)
        this.canvasData = {
          version: canvasJson?.version ?? '',
          objects: cloneDeep(canvasJson?.objects ?? [])
        }
        paintBoard.triggerHook()
      })
    }
  }

  redo() {
    const canvas = paintBoard?.canvas
    if (this.index < this.diffs.length && canvas) {
      const delta = this.diffs[this.index]
      this.index++
      const canvasJson = unpatch(this.canvasData, delta) as IBoardData
      canvas.loadFromJSON(canvasJson, () => {
        canvas.requestRenderAll()
        useFileStore.getState().updateBoardData(canvasJson)
        this.canvasData = {
          version: canvasJson?.version ?? '',
          objects: cloneDeep(canvasJson?.objects ?? [])
        }
        paintBoard.triggerHook()
      })
    }
  }

  clean() {
    paintBoard?.canvas?.clear()
    this.index = 0
    this.diffs = []
    this.canvasData = {}
    useFileStore.getState().updateBoardData(initState)
  }

  initHistory() {
    const canvas = paintBoard.canvas
    if (canvas) {
      const canvasJson = canvas.toDatalessJSON()
      this.canvasData = canvasJson
      this.index = 0
      this.diffs = []
    }
  }
}
