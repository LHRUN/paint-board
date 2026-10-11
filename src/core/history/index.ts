import useFileStore, { IBoardData } from '@/store/files'
import { paintBoard } from '../paintBoard'
import { diff, unpatch, patch, Delta } from 'jsondiffpatch'
import cloneDeep from 'lodash-es/cloneDeep'
import { getCanvasJSON, handleCanvasJSONLoaded } from '../utils/loadCanvas'
import { canWriteFile } from '../session/canvasWrite'
import { appendHistoryStep } from './historyStep'

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
      const canvasJson = getCanvasJSON()
      this.canvasData = cloneDeep(canvasJson ?? {})
    }
  }

  saveState() {
    const canvas = paintBoard?.canvas
    const fileId = paintBoard.canvasFileId
    if (!canvas || !canWriteFile(paintBoard.canvasFileId, fileId)) {
      return
    }
    const canvasJson = getCanvasJSON()
    const delta = diff(canvasJson, this.canvasData)
    const next = appendHistoryStep(this.diffs, this.index, delta)
    if (!next.changed) {
      return
    }
    this.diffs = next.diffs
    this.index = next.index
    this.canvasData = cloneDeep(canvasJson ?? {})
    if (!canWriteFile(paintBoard.canvasFileId, fileId)) {
      return
    }
    useFileStore.getState().updateBoardData(canvasJson, fileId)
  }

  replaceCurrentSnapshot(canvasJson: Partial<IBoardData>) {
    this.canvasData = cloneDeep(canvasJson ?? {})
  }

  undo() {
    const canvas = paintBoard?.canvas
    const fileId = paintBoard.canvasFileId
    const generation = paintBoard.getLoadGeneration()
    if (
      canvas &&
      this.index > 0 &&
      canWriteFile(paintBoard.canvasFileId, fileId)
    ) {
      const delta = this.diffs[this.index - 1]
      this.index--
      const canvasJson = patch(cloneDeep(this.canvasData), delta) as IBoardData
      paintBoard.applyCanvasJson(canvasJson, (committed) => {
        if (
          !committed ||
          !paintBoard.canvas ||
          paintBoard.getLoadGeneration() !== generation ||
          !canWriteFile(paintBoard.canvasFileId, fileId)
        ) {
          return
        }
        handleCanvasJSONLoaded(paintBoard.canvas)
        paintBoard.canvas.requestRenderAll()
        useFileStore.getState().updateBoardData(canvasJson, fileId)
        this.canvasData = cloneDeep(canvasJson ?? {})
        paintBoard.triggerHook()
      })
    }
  }

  redo() {
    const canvas = paintBoard?.canvas
    const fileId = paintBoard.canvasFileId
    const generation = paintBoard.getLoadGeneration()
    if (
      this.index < this.diffs.length &&
      canvas &&
      canWriteFile(paintBoard.canvasFileId, fileId)
    ) {
      const delta = this.diffs[this.index]
      this.index++
      const canvasJson = unpatch(
        cloneDeep(this.canvasData),
        delta
      ) as IBoardData
      paintBoard.applyCanvasJson(canvasJson, (committed) => {
        if (
          !committed ||
          !paintBoard.canvas ||
          paintBoard.getLoadGeneration() !== generation ||
          !canWriteFile(paintBoard.canvasFileId, fileId)
        ) {
          return
        }
        handleCanvasJSONLoaded(paintBoard.canvas)
        paintBoard.canvas.requestRenderAll()
        useFileStore.getState().updateBoardData(canvasJson, fileId)
        this.canvasData = cloneDeep(canvasJson ?? {})
        paintBoard.triggerHook()
      })
    }
  }

  clean() {
    const fileId = paintBoard.canvasFileId
    paintBoard?.canvas?.clear()
    this.index = 0
    this.diffs = []
    this.canvasData = {}
    if (canWriteFile(paintBoard.canvasFileId, fileId)) {
      useFileStore.getState().updateBoardData({}, fileId)
    }
  }

  initHistory() {
    const canvas = paintBoard.canvas
    if (canvas) {
      const canvasJson = getCanvasJSON()
      this.canvasData = canvasJson
      this.index = 0
      this.diffs = []
    }
  }
}
