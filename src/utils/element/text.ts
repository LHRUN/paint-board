import { fabric } from 'fabric'
import { paintBoard } from '../paintBoard'
import useDrawStore from '@/store/draw'
import { setObjectAttr } from '../common/draw'
import useBoardStore from '@/store/board'
import { ActionMode } from '@/constants'

export class TextElement {
  text: fabric.IText | null = null

  loadText() {
    const canvas = paintBoard?.canvas
    if (canvas) {
      // 创建可编辑文本框
      const text = new fabric.IText('Type here...', {
        left: canvas.getWidth() / 2,
        top: canvas.getHeight() / 2,
        fill: useDrawStore.getState().drawColors[0],
        fontSize: 25 / (canvas?.getZoom() ?? 1),
        fontFamily: useDrawStore.getState().textFontFamily
      })
      this.text = text
      canvas.add(text)
      canvas.setActiveObject(text)

      text.enterEditing() // 进入编辑状态
      text.selectAll() // 选择所有文字

      // 监听编辑完成事件，离开编辑状态时绘制文本
      text.on('editing:exited', () => {
        setObjectAttr(text, 'itext')
        if (
          [ActionMode.DRAW, ActionMode.ERASE].includes(
            useBoardStore.getState().mode
          )
        ) {
          canvas.discardActiveObject()
        }
        paintBoard.render()
      })
    }
  }

  resetText() {
    if (this?.text) {
      this.text.exitEditing()
      this.text = null
    }
  }
}
