import { fabric } from 'fabric'
import isUndefined from 'lodash-es/isUndefined'
import { paintBoard } from '../../paintBoard'

import { FontStyle } from '@/constants/font'
import { ActionMode } from '@/constants'

import useDrawStore from '@/store/draw'
import useBoardStore from '@/store/board'
import { DEFAULT_TEXT_PLACEHOLDER } from './placeholder'
import { textFillColor } from './textColor'

export class TextElement {
  text: fabric.IText | null = null
  isTextEditing = false

  loadText({ x, y, text }: { x?: number; y?: number; text?: string }) {
    const canvas = paintBoard?.canvas
    if (canvas) {
      // Creating editable text input
      const viewportCenter = canvas.getVpCenter()
      const { fontStyles, textColors, currentTextColor, textFontFamily } =
        useDrawStore.getState()

      const boardCenter = isUndefined(x) && isUndefined(y)

      const textObj = new fabric.IText(text || DEFAULT_TEXT_PLACEHOLDER, {
        originX: boardCenter ? 'center' : 'left',
        originY: boardCenter ? 'center' : 'top',
        left: boardCenter ? viewportCenter.x : x,
        top: boardCenter ? viewportCenter.y : y,
        fill: textFillColor(textColors, currentTextColor),
        fontSize: 25 / (canvas?.getZoom() ?? 1),
        fontFamily: textFontFamily,
        fontWeight: fontStyles.includes(FontStyle.BOLD) ? 'bold' : 'normal',
        fontStyle: fontStyles.includes(FontStyle.ITALIC) ? 'italic' : 'normal',
        underline: fontStyles.includes(FontStyle.UNDER_LINE),
        linethrough: fontStyles.includes(FontStyle.LINE_THROUGH)
      })
      this.text = textObj
      canvas.add(textObj)
      useBoardStore.getState().updateMode(ActionMode.SELECT)
      canvas.setActiveObject(textObj)

      textObj.enterEditing() // Enters editing state
      textObj.selectAll() // Selects entire text
      canvas.requestRenderAll()
    }
  }

  editText(textObj: fabric.IText) {
    const canvas = paintBoard.canvas
    if (!canvas || textObj.editable === false || textObj.isEditing) {
      return
    }
    useBoardStore.getState().updateMode(ActionMode.SELECT)
    canvas.setActiveObject(textObj)
    textObj.enterEditing()
    canvas.requestRenderAll()
  }

  resetText() {
    if (this?.text) {
      this.text.exitEditing()
      this.text = null
    }
  }
}
