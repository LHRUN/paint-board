import { paintBoard } from '../paintBoard'
import { v4 as uuidv4 } from 'uuid'
import useBoardStore from '@/store/board'
import { ActionMode, ELEMENT_CUSTOM_TYPE } from '@/constants'
import { setObjectAttr } from '../common/draw'
import useDrawStore from '@/store/draw'
import { DrawStyle, DrawType } from '@/constants/draw'
import { autoDrawData } from '../autodraw'

export class ObjectEvent {
  constructor() {
    this.initObjectEvent()
    this.initTextEvent()
  }

  initObjectEvent() {
    const canvas = paintBoard?.canvas
    canvas?.on('selection:created', () => {
      paintBoard.triggerHook()
    })

    canvas?.on('selection:updated', () => {
      paintBoard.triggerHook()
    })

    canvas?.on('selection:cleared', () => {
      paintBoard.triggerHook()
    })

    canvas?.on('path:created', (options) => {
      const { mode, drawType } = useBoardStore.getState()
      if ([ActionMode.DRAW, ActionMode.ERASE].includes(mode)) {
        /**
         * record fabric brush object
         */
        if (mode === ActionMode.DRAW) {
          const id = uuidv4()
          ;(options as any).path.set({
            id,
            perPixelTargetFind: true
          })
          const { openAutoDraw, drawStyle } = useDrawStore.getState()
          if (
            openAutoDraw &&
            drawType === DrawType.FreeStyle &&
            drawStyle === DrawStyle.Basic
          ) {
            autoDrawData.addPath((options as any).path)
          }
        }

        // Save fabric brush and fabric eraser operation state
        paintBoard.history?.saveState()
      }
    })
    canvas?.on('object:modified', (e) => {
      // Prohibit recording if the change is due to IText input content
      if (e.target?.type === 'i-text') {
        const obj = e.target as fabric.IText
        if (obj._textBeforeEdit === obj.text) {
          return
        }
      }
      // Usually operations that change the object such as dragging and zooming, record the operation
      if (e.action && e.target) {
        paintBoard.history?.saveState()
      }
    })
  }

  initTextEvent() {
    const canvas = paintBoard?.canvas
    canvas?.on('text:editing:entered', () => {
      paintBoard.textElement.isTextEditing = true
    })

    canvas?.on('text:editing:exited', (e) => {
      const obj = e?.target as fabric.IText
      if (obj) {
        paintBoard.textElement.isTextEditing = false

        // If there is no _customType, it means it is a new object.
        if (!obj?._customType) {
          setObjectAttr(obj, ELEMENT_CUSTOM_TYPE.I_TEXT)
        }

        // If the text changes, update the record
        if (obj?._textBeforeEdit !== obj?.text) {
          canvas.discardActiveObject()
          paintBoard.render()
        }
      }
    })
  }
}
