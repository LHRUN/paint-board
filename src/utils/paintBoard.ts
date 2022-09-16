import { ELEMENT_INSTANCE, MousePosition } from '@/types'
import { CleanLine, cleanLineRender } from './cleanLine'
import { FreeLine, freeLineRender } from './freeLine'
import { CANVAS_ELE_TYPE, CommonWidth } from './constants'
import { History } from './history'
import { BOARD_STORAGE_KEY, storage } from './storage'

/**
 * PaintBoard
 */
export class PaintBoard {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  history: History<ELEMENT_INSTANCE>
  // 原点位置
  originPosition = {
    x: 0,
    y: 0
  }
  // 针对原点拖拽距离
  originTranslate = {
    x: 0,
    y: 0
  }
  // canvas几何属性
  canvasRect = {
    top: 0,
    left: 0
  }

  constructor(canvas: HTMLCanvasElement) {
    // 初始化配置
    this.canvas = canvas
    this.initCanvasSize(this.canvas)
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D
    this.history = new History(storage.get(BOARD_STORAGE_KEY) || [])
    const { top, left } = canvas.getBoundingClientRect()
    this.canvasRect = {
      top,
      left
    }

    // 监听窗口size
    window.addEventListener('resize', () => {
      this.initCanvasSize(this.canvas)
      this.render()
    })

    // 初始化渲染缓存数据
    this.render()
  }

  // 初始化窗口变化
  initCanvasSize(canvas: HTMLCanvasElement) {
    this.initOriginPosition()
    canvas.width = document.body.clientWidth
    canvas.height = document.body.clientHeight
  }

  // 初始化原点
  initOriginPosition() {
    this.originPosition = {
      x: 0,
      y: 0
    }
  }

  // 缩放比例
  scale = 1
  // 改变缩放比例
  changeScale(z: number) {
    this.initOriginPosition()
    const scale = z
    console.log(scale)
    // z > 1 ? this.scale + z : this.scale - z > 0 ? this.scale - z : 0
    this.context.scale(scale, scale)
    console.log(scale)
    this.scale = scale
    this.render()
  }

  // 当前元素
  currentEle: ELEMENT_INSTANCE = null

  /**
   * 记录当前元素，并加入history
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
      x: position.x - this.canvasRect.left - this.originTranslate.x,
      y: position.y - this.canvasRect.top - this.originTranslate.y
    })
    this.context.translate(0, 0)
    this.render()
  }

  /**
   * 拖拽画布
   */
  drag(position: MousePosition) {
    const mousePosition = {
      x: position.x - this.canvasRect.left,
      y: position.y - this.canvasRect.top
    }
    if (this.originPosition.x && this.originPosition.y) {
      const translteX = mousePosition.x - this.originPosition.x
      const translteY = mousePosition.y - this.originPosition.y
      this.context.translate(translteX, translteY)
      this.originTranslate = {
        x: translteX + this.originTranslate.x,
        y: translteY + this.originTranslate.y
      }
      this.render()
    }
    this.originPosition = mousePosition
  }

  /**
   * 遍历history渲染数据
   */
  render() {
    if (this.history.stack.length > 0) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.history.each((ele) => {
        switch (ele?.type) {
          case CANVAS_ELE_TYPE.FREE_LINE:
            freeLineRender(this.context, ele as FreeLine)
            break
          case CANVAS_ELE_TYPE.CLEAN_LINE:
            cleanLineRender(this.context, this.canvas, ele as CleanLine)
            break
          default:
            break
        }
      })
      storage.set(
        BOARD_STORAGE_KEY,
        this.history.stack.slice(0, this.history.step + 1)
      )
    }
  }

  // 当前绘线颜色
  currentLineColor = '#000000'
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
   * 清除画布
   */
  clean() {
    this.history.clean()
    this.render()
  }

  /**
   * 保存为图片
   */
  saveImage() {
    const imageData = this.context.getImageData(
      0,
      0,
      document.body.clientWidth,
      document.body.clientHeight
    )
    // 创建保存图片canvas
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = document.body.clientWidth
    canvas.height = document.body.clientHeight
    canvas.style.position = 'fixed'
    canvas.style.top = '10000px'
    canvas.style.left = '10000px'
    document.body.appendChild(canvas)
    context?.putImageData(imageData, 0, 0)

    // 创建下载link
    const imageUrl = canvas.toDataURL('image/png')
    const elink = document.createElement('a')
    elink.download = '图片'
    elink.style.display = 'none'
    elink.href = imageUrl
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href)
    document.body.removeChild(elink)
    document.body.removeChild(canvas)
  }
}
