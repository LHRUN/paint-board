import { CanvasElement } from './element'
import { ElementRect, MousePosition } from '../../types/index'
import { CANVAS_ELE_TYPE } from '../constants'
import { createDocument } from '../common'

export class TextElement extends CanvasElement {
  value: string
  rect: ElementRect

  constructor(layer: number, value: string, rect: ElementRect) {
    super(CANVAS_ELE_TYPE.TEXT, layer)
    this.value = value
    this.rect = rect
  }
}

/**
 * 渲染文本元素
 * @param context
 * @param instance
 */
export const textRender = (
  context: CanvasRenderingContext2D,
  instance: TextElement
) => {
  context.save()
  context.font = '25px serif'
  context.fillText(instance.value, instance.rect.x, instance.rect.y)
  context.restore()
}

/**
 * 显示文本输入框
 * @param position
 */
export const showTextInput = (position: MousePosition) => {
  const inputStyle = {
    position: 'fixed',
    top: `${position.y}px`,
    left: `${position.x}px`,
    height: '25px',
    minWidth: '100px',
    fontSize: '25px',
    outline: 0,
    border: 0,
    padding: 0,
    margin: 0,
    lineHeight: '25px',
    backgroundColor: 'rgba(0,0,0,0)',
    fontFamily: 'serif'
  }
  const input = createDocument('input', inputStyle)
  input.focus()
  return input
}
