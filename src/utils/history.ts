import useFileStore, { IBoardData } from '@/store/files'
import { paintBoard } from './paintBoard'
import { fabric } from 'fabric'

const initState = {}

/**
 * Operation History
 */
export class History {
  states: Array<Partial<IBoardData>> = []
  index = 0

  constructor(state = initState) {
    this.states.push(state)
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
      this.states = this.states.slice(0, this.index + 1)
      const state = canvas.toDatalessJSON()
      this.states.push(state)
      if (this.states.length > 20) {
        this.states.shift()
      }
      this.index++
      useFileStore.getState().updateBoardData(state)
    }
  }

  undo() {
    const canvas = paintBoard?.canvas
    if (canvas && this.index > 0) {
      this.index--
      const state = this.states[this.index]
      canvas.loadFromJSON(state, () => {
        canvas.requestRenderAll()
        useFileStore.getState().updateBoardData(state)
        paintBoard.triggerHook()
      })
    }
  }

  redo() {
    const canvas = paintBoard?.canvas
    if (this.index < this.states.length - 1 && canvas) {
      this.index++
      const state = this.states[this.index]
      canvas.loadFromJSON(state, () => {
        canvas.requestRenderAll()
        useFileStore.getState().updateBoardData(state)
        paintBoard.triggerHook()
      })
    }
  }

  clean() {
    paintBoard?.canvas?.clear()
    this.index = 0
    this.states = [initState]
    useFileStore.getState().updateBoardData(initState)
  }
}
