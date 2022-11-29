import { CanvasElement } from './element'
import { MousePosition } from '../../types/index'
import { CANVAS_ELE_TYPE } from '../constants'
import { createDocument } from '../common'

export interface TextRect {
  x: number
  y: number
  width: number
  height: number
}

export class TextElement extends CanvasElement {
  value: string
  rect: TextRect

  constructor(layer: number, value: string, rect: TextRect) {
    super(CANVAS_ELE_TYPE.TEXT, layer)
    this.value = value
    this.rect = rect
  }
}

export const textRender = (
  context: CanvasRenderingContext2D,
  instance: TextElement
) => {
  context.save()
  context.font = '25px serif'
  context.fillText(instance.value, instance.rect.x, instance.rect.y)
  context.restore()
}

export const showTextInput = (position: MousePosition) => {
  const inputStyle = {
    position: 'fixed',
    top: `${position.y - 25}px`,
    left: `${position.x}px`,
    height: '50px',
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
