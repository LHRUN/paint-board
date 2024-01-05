import { fabric } from 'fabric'
import { paintBoard } from '../paintBoard'
import useDrawStore from '@/store/draw'
import { setObjectAttr } from '../common/draw'
import useBoardStore from '@/store/board'
import { ActionMode } from '@/constants'

export class TextElement {
  text: fabric.IText | null = null
  isTextEditing = false

  loadText() {
    const canvas = paintBoard?.canvas
    if (canvas) {
      // Creating editable text input
      const viewportCenter = canvas.getVpCenter()
      const text = new fabric.IText('Type here...', {
        originX: 'center',
        originY: 'center',
        left: viewportCenter.x,
        top: viewportCenter.y,
        fill: useDrawStore.getState().drawColors[0],
        fontSize: 25 / (canvas?.getZoom() ?? 1),
        fontFamily: useDrawStore.getState().textFontFamily
      })
      this.text = text
      canvas.add(text)
      canvas.setActiveObject(text)

      text.enterEditing() // Enters editing state
      text.selectAll() // Selects entire text
    }
  }

  resetText() {
    if (this?.text) {
      this.text.exitEditing()
      this.text = null
    }
  }
}
