// export class Command {
//   objId: string
//   action: string
//   curState: Record<string, any>

import { PaintBoard } from './paintBoard'

//   constructor(objId: string, action: string, curState: Record<string, any>) {
//     this.objId = objId
//     this.action = action
//     this.curState = curState
//   }
// }

interface IHistoryState {
  obj: fabric.Object
  objId: string
  curState: Record<string, any>
}

export class History {
  board: PaintBoard
  states: Array<{
    action: string
    objs: IHistoryState[]
  }> = []
  index = 0

  constructor(board: PaintBoard) {
    this.board = board
  }

  saveState(obj: fabric.Object, action: string) {
    const canvas = this?.board?.canvas
    if (!canvas) {
      return
    }
    let objs: IHistoryState[] = []
    if (!obj._customType && (obj as fabric.Group)?._objects?.length > 1) {
      objs = (obj as fabric.Group)._objects.map((obj) => {
        const objId = obj?.id || ''
        obj.saveState()
        const curState = obj._stateProperties
        return {
          obj,
          objId,
          curState
        }
      })
    } else {
      const objId = obj?.id || ''
      obj.saveState()
      const curState = obj._stateProperties
      objs.push({
        obj,
        objId,
        curState
      })
    }
    if (objs.length) {
      this.states = this.states.slice(0, this.index + 1)
      this.index++
      this.states.push({
        action,
        objs
      })
    }
  }

  undo() {
    const canvas = this?.board?.canvas
    if (canvas && this.index > 0) {
      this.index--
      const state = this.states[this.index]
      state.objs.forEach(({ obj, curState }) => {
        obj.set(curState)
      })
      canvas.requestRenderAll()
    }
  }

  redo() {
    const canvas = this?.board?.canvas
    if (this.index < this.states.length - 1 && canvas) {
      this.index++
      const state = this.states[this.index]
      state.objs.forEach(({ obj, curState }) => {
        obj.set(curState)
      })
      canvas.requestRenderAll()
    }
  }

  clean() {
    this?.board?.canvas?.clear()
    this.index = 0
    this.states = []
  }
}
