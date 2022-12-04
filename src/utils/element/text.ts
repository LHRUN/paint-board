import { RECT_MIN_SIZE, RESIZE_TYPE } from './../constants'
import { CanvasElement } from './element'
import { ElementRect, MousePosition } from '../../types/index'
import { CANVAS_ELE_TYPE } from '../constants'
import { createDocument } from '../common'

/**
 * 文本元素
 */
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

/**
 * 文本编辑
 */
export class TextEdit {
  rect: ElementRect = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  } // 文本矩形属性
  inputEle: HTMLInputElement | null = null // input元素
  previewEle: HTMLDivElement | null = null // 预览元素，用于获取矩形属性
  value = '' // input[value]

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

  /**
   * 编辑后销毁
   */
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
 * @param ele
 */
export const textRender = (
  context: CanvasRenderingContext2D,
  ele: TextElement
) => {
  context.save()
  context.font = `${ele.fontSize}px serif`
  // 因为fillText的坐标是文字的左下角，而其他记录的都是左上角，所以需要加上字体大小
  context.fillText(ele.value, ele.rect.x, ele.rect.y + ele.fontSize * 0.84)
  context.restore()
}

/**
 * 修改文本元素大小
 * @param ele 文本元素
 * @param width 改变后的宽度
 * @param height 改变后的高度
 * @param resizeType 拖拽类型
 */
export const resizeTextElement = (
  ele: TextElement,
  width: number,
  height: number,
  resizeType: string
) => {
  const oldRatio = ele.rect.width / ele.rect.height
  const newRatio = width / height
  if (newRatio < oldRatio) {
    height = width / oldRatio
  } else if (newRatio > oldRatio) {
    width = oldRatio * height
  }

  if (height < RECT_MIN_SIZE || width < RECT_MIN_SIZE) {
    return
  }

  switch (resizeType) {
    case RESIZE_TYPE.BOTTOM_RIGHT:
      break
    case RESIZE_TYPE.BOTTOM_LEFT:
      ele.rect.x -= width - ele.rect.width
      break
    case RESIZE_TYPE.TOP_LEFT:
      ele.rect.x -= width - ele.rect.width
      ele.rect.y -= height - ele.rect.height
      break
    case RESIZE_TYPE.TOP_RIGHT:
      ele.rect.y -= height - ele.rect.height
      break
    default:
      break
  }
  ele.rect.height = height
  ele.rect.width = width
  ele.fontSize = ele.rect.height
}
