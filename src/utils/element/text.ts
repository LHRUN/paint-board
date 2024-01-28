import { fabric } from 'fabric'
import { paintBoard } from '../paintBoard'
import useDrawStore from '@/store/draw'
import { FontStyle } from '@/constants/font'

export class TextElement {
  text: fabric.IText | null = null
  isTextEditing = false

  loadText() {
    const canvas = paintBoard?.canvas
    if (canvas) {
      // Creating editable text input
      const viewportCenter = canvas.getVpCenter()
      const { fontStyles, drawColors, textFontFamily } = useDrawStore.getState()

      const text = new fabric.IText('Type here...', {
        originX: 'center',
        originY: 'center',
        left: viewportCenter.x,
        top: viewportCenter.y,
        fill: drawColors[0],
        fontSize: 25 / (canvas?.getZoom() ?? 1),
        fontFamily: textFontFamily,
        fontWeight: fontStyles.includes(FontStyle.BOLD) ? 'bold' : 'normal',
        fontStyle: fontStyles.includes(FontStyle.ITALIC) ? 'italic' : 'normal',
        underline: fontStyles.includes(FontStyle.UNDER_LINE),
        linethrough: fontStyles.includes(FontStyle.LINE_THROUGH)
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
