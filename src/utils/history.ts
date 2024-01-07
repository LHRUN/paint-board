import useFileStore, { IBoardData } from '@/store/files'
import { paintBoard } from './paintBoard'
import { diff, unpatch, patch, Delta } from 'jsondiffpatch'
import { cloneDeep, omit } from 'lodash'

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
      this.canvasData = {
        ...omit(canvasJson, 'objects'),
        objects: cloneDeep(canvasJson?.objects ?? [])
      }
    }
  }

  saveState() {
    const canvas = paintBoard?.canvas
    if (canvas) {
      this.diffs = this.diffs.slice(0, this.index)
      const canvasJson = canvas.toDatalessJSON()
      const delta = diff(canvasJson, this.canvasData)
      this.diffs.push(delta)

      // More than 50 operations, remove initial state
      if (this.diffs.length > 50) {
        this.diffs.shift()
      } else {
        this.index++
      }
      this.canvasData = {
        ...omit(canvasJson, 'objects'),
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
          ...omit(canvasJson, 'objects'),
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
          ...omit(canvasJson, 'objects'),
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
