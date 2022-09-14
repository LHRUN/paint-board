import { ELEMENT_INSTANCE, MousePosition } from '@/types'
import { CleanLine } from './cleanLine'
import { CANVAS_ELE_TYPE, CommonWidth } from './constants'
import { FreeLine } from './freeLine'
import { History } from './history'
// import { BOARD_STORAGE_KEY, storage } from './storage'

export class PaintBoard {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  history: History
  originPosition = {
    x: 0,
    y: 0
  }
  originTranslate = {
    x: 0,
    y: 0
  }
  position = {
    top: 0,
    left: 0
  }

  constructor(canvas: HTMLCanvasElement, history?: ELEMENT_INSTANCE[]) {
    this.canvas = canvas
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D
    this.history = new History(history || [])
    const { top, left } = canvas.getBoundingClientRect()
    this.position = {
      top,
      left
    }
    // this.render()
  }

  // 当前元素
  currentEle: ELEMENT_INSTANCE = null

  /**
   * 记录当前绘画
   */
  recordCurrent(type: string) {
    let ele: ELEMENT_INSTANCE = null
    switch (type) {
      case CANVAS_ELE_TYPE.FREE_LINE:
        ele = new FreeLine(this.currentLineColor, this.currentLineWidth)
        break
      case CANVAS_ELE_TYPE.CLEAN_LINE:
        ele = new CleanLine(this.cleanWidth)
        break
      default:
        break
    }
    this.history.add(ele)
    this.currentEle = ele
  }

  /**
   * 为当前元素添加坐标数据
   */
  currentAddPosition(position: MousePosition) {
    this.currentEle?.addPosition({
      x: position.x - this.position.left - this.originTranslate.x,
      y: position.y - this.position.top - this.originTranslate.y
    })
    this.context.translate(0, 0)
    this.render()
  }

  translate(position: MousePosition) {
    if (this.originPosition.x && this.originPosition.y) {
      const translteX = position.x - this.originPosition.x
      const translteY = position.y - this.originPosition.y
      this.context.translate(translteX, translteY)
      this.originTranslate = {
        x: translteX + this.originTranslate.x,
        y: translteY + this.originTranslate.y
      }
      this.render()
    }
    this.originPosition = position
  }

  /**
   * 渲染数据
   */
  render() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.history.each((ele) => {
      ele?.render(this.context, this.canvas)
    })
    // storage.set(BOARD_STORAGE_KEY, this.history.stack)
  }

  // 当前绘线颜色
  currentLineColor = 'black'
  // 当前绘线宽
  currentLineWidth = CommonWidth.W5

  /**
   * 修改绘线宽
   * @param width 绘线宽
   */
  setLineWidth(width: number) {
    if (width) {
      this.currentLineWidth = width
    }
  }

  /**
   * 修改绘线颜色
   * @param color 绘线颜色
   */
  setLineColor(color: string) {
    if (color) {
      this.currentLineColor = color
    }
  }

  // 当前橡皮擦宽度
  cleanWidth = CommonWidth.W5

  /**
   * 修改橡皮擦宽度
   * @param width 橡皮擦宽度
   */
  setCleanWidth(width: number) {
    this.cleanWidth = width
  }

  /**
   * 后退
   */
  undo() {
    this.history.undo()
    this.render()
  }

  /**
   * 前进
   */
  redo() {
    this.history.redo()
    this.render()
  }

  /**
   * 保存为图片
   */
  saveImage() {
    const imageData = this.canvas.toDataURL('image/png') //返回base64的URL
    const elink = document.createElement('a')
    elink.download = '图片'
    elink.style.display = 'none'
    elink.href = imageData
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href) //释放URL对象
    document.body.removeChild(elink)
  }
}
