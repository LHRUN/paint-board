import useFileStore, { IBoardData } from '@/store/files'
import { paintBoard } from '../paintBoard'
import { diff, Delta } from 'jsondiffpatch'
import cloneDeep from 'lodash-es/cloneDeep'
import { getCanvasJSON, handleCanvasJSONLoaded } from '../utils/loadCanvas'
import { canWriteFile } from '../session/canvasWrite'
import { appendHistoryStep } from './historyStep'
import { nextHistorySnapshot, shouldRecordHistorySave } from './historyMove'

/**
 * Operation History
 */
export class History {
  diffs: Array<Delta> = []
  canvasData: Partial<IBoardData> = {}
  index = 0
  private applyToken = 0
  private applyInFlight = false

  constructor() {
    const canvas = paintBoard.canvas
    if (canvas) {
      const canvasJson = getCanvasJSON()
      this.canvasData = cloneDeep(canvasJson ?? {})
    }
  }

  isApplying() {
    return this.applyInFlight
  }

  saveState() {
    if (!shouldRecordHistorySave(this.applyInFlight)) {
      return
    }
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
    this.moveHistory('undo')
  }

  redo() {
    this.moveHistory('redo')
  }

  private moveHistory(direction: 'undo' | 'redo') {
    const canvas = paintBoard?.canvas
    const fileId = paintBoard.canvasFileId
    const generation = paintBoard.getLoadGeneration()
    if (!canvas || !canWriteFile(paintBoard.canvasFileId, fileId)) {
      return
    }
    const next = nextHistorySnapshot({
      diffs: this.diffs,
      index: this.index,
      canvasData: this.canvasData,
      direction
    })
    if (!next) {
      return
    }
    const token = ++this.applyToken
    this.applyInFlight = true
    this.index = next.index
    this.canvasData = next.canvasData
    paintBoard.setCanvasInteractive(false)
    paintBoard.applyCanvasJson(next.canvasData, (committed) => {
      if (token !== this.applyToken) {
        return
      }
      this.applyInFlight = false
      if (paintBoard.getLoadGeneration() !== generation) {
        return
      }
      paintBoard.setCanvasInteractive(true)
      if (
        !committed ||
        !paintBoard.canvas ||
        !canWriteFile(paintBoard.canvasFileId, fileId)
      ) {
        return
      }
      handleCanvasJSONLoaded(paintBoard.canvas)
      paintBoard.canvas.requestRenderAll()
      useFileStore.getState().updateBoardData(next.canvasData, fileId)
      paintBoard.triggerHook()
    })
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
