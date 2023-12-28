import { paintBoard } from '../paintBoard'
import { v4 as uuidv4 } from 'uuid'
import useBoardStore from '@/store/board'
import { ActionMode } from '@/constants'

export class ObjectEvent {
  constructor() {
    this.initObjectEvent()
  }

  initObjectEvent() {
    const canvas = paintBoard?.canvas
    canvas?.on('selection:created', () => {
      console.log('selection:created')
      paintBoard.triggerHook()
    })

    canvas?.on('selection:updated', () => {
      console.log('selection:updated')
      paintBoard.triggerHook()
    })

    canvas?.on('selection:cleared', () => {
      console.log('selection:cleared')
      paintBoard.triggerHook()
    })

    canvas?.on('path:created', (options) => {
      if (
        [ActionMode.DRAW, ActionMode.ERASE].includes(
          useBoardStore.getState().mode
        )
      ) {
        if (useBoardStore.getState().mode === ActionMode.DRAW) {
          const id = uuidv4()
          ;(options as any).path.set({
            id,
            perPixelTargetFind: true
          })
        }
        paintBoard.history?.saveState()
      }
    })
    canvas?.on('object:modified', (e) => {
      if (e.action && e.target) {
        paintBoard.history?.saveState()
      }
    })
  }
}
