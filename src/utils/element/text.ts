import { CanvasElement } from './element'
import { ElementRect, MousePosition } from '../../types/index'
import { CANVAS_ELE_TYPE } from '../constants'
import { createDocument } from '../common'

export class TextElement extends CanvasElement {
  value: string
  rect: ElementRect
  fontSize: number

  constructor(layer: number, value: string, rect: ElementRect) {
    super(CANVAS_ELE_TYPE.TEXT, layer)
    this.value = value
    this.rect = rect
    this.fontSize = 25
  }
}

export class TextEdit {
  rect: ElementRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }
  inputEle: HTMLInputElement | null = null
  previewEle: HTMLDivElement | null = null
  value = ''

  /**
   * 显示文本输入框
   * @param position
   */
  showTextInput(position: MousePosition) {
    const commonStyle = {
      position: 'fixed',
      fontSize: '25px',
      outline: 0,
      border: 0,
      padding: 0,
      margin: 0,
      lineHeight: '25px',
      fontFamily: 'serif'
    }

    const inputStyle = {
      ...commonStyle,
      width: '25px',
      top: `${position.y}px`,
      left: `${position.x}px`,
      backgroundColor: 'rgba(0,0,0,0)'
    }
    const previewStyle = {
      ...commonStyle,
      height: '25px',
      top: '-10000px',
      left: '-10000px',
      visibility: 'hidden',
      whiteSpace: 'nowrap'
    }
    this.rect.x = position.x
    this.rect.y = position.y
    const inputEle = createDocument('input', inputStyle)
    const previewEle = createDocument('div', previewStyle)
    inputEle.addEventListener('input', () => {
      if (this.previewEle && this.inputEle) {
        const value = this.inputEle.value
        this.previewEle.textContent = value
        const { width, height } = this.previewEle.getBoundingClientRect()
        console.log(width, height, value)
        this.inputEle.style.width = `${width}px`
        this.rect.width = width
        this.rect.height = height
        this.value = value
      }
    })
    inputEle.focus()
    this.inputEle = inputEle
    this.previewEle = previewEle
    return inputEle
  }

  destroy() {
    if (this.inputEle) {
      document.body.removeChild(this.inputEle)
      this.inputEle = null
    }
    if (this.previewEle) {
      document.body.removeChild(this.previewEle)
      this.previewEle = null
    }
    this.value = ''
    this.rect = {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
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
  context.font = `${instance.fontSize}px serif`
  // 因为fillText的y轴坐标是文字的左下角，而其他记录的都是右上角，所以需要+21
  context.fillText(instance.value, instance.rect.x, instance.rect.y + 21)
  context.restore()
}

export const scaleTextElement = (
  instance: TextElement,
  distanceX: number,
  distanceY: number,
  rect: ElementRect
) => {
  // instance.rect.width += distanceX
  // instance.rect.height += distanceY
  let newWidth = rect.width + distanceX
  let newHeight = rect.height + distanceY
  const originRatio = rect.width / rect.height // 原始矩形的宽高比
  const newRatio = newWidth / newHeight // 新矩形的宽高比
  // let x1, y1
  if (newRatio < originRatio) {
    // 新矩形的比例小于原始矩形的比例，宽度不变，调整新矩形的高度
    // x1 = newRect.x + newRect.width;
    // y1 = newRect.y + newRect.width / originRatio;
    newHeight = newWidth / originRatio
  } else if (newRatio > originRatio) {
    // 新矩形的比例大于原始矩形的比例，高度不变，调整新矩形的宽度
    // x1 = newRect.x + originRatio * newRect.height;
    // y1 = newRect.y + newRect.height;
    newWidth = originRatio * newHeight
  }
  instance.rect.height = newHeight
  instance.rect.width = newWidth
  instance.fontSize = instance.rect.height
}
