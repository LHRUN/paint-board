import { ELEMENT_INSTANCE, MousePosition } from '@/types'
import { CleanLine, cleanLineRender } from './element/cleanLine'
import { FreeLine, freeLineRender } from './element/freeLine'
import { CANVAS_ELE_TYPE, CommonWidth } from './constants'
import { History } from './history'
import { BOARD_STORAGE_KEY, storage } from './storage'
import { Layer } from './layer'

/**
 * PaintBoard
 */
export class PaintBoard {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  // 历史操作记录
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
  // 图层
  layer: Layer

  constructor(canvas: HTMLCanvasElement) {
    // 初始化配置
    this.canvas = canvas
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D
    this.initCanvasSize()
    this.initOriginPosition()
    const { top, left } = canvas.getBoundingClientRect()
    this.canvasRect = {
      top,
      left
    }

    // 获取缓存
    const { history = [], state = {} } = storage.get(BOARD_STORAGE_KEY) || {}
    Object.assign(this, { ...state })

    // 初始化缓存数据
    this.layer = new Layer(this.render.bind(this), state?.layer)
    this.history = new History(history)
    this.context.translate(this.originTranslate.x, this.originTranslate.y)
    this.render()
  }

  /**
   * 初始化canvas宽高
   */
  initCanvasSize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  /**
   * 初始化原点
   */
  initOriginPosition() {
    this.context.translate(0, 0)
    this.originPosition = {
      x: 0,
      y: 0
    }
  }

  // 当前元素
  currentEle: ELEMENT_INSTANCE | null = null

  /**
   * 记录当前元素，并加入history
   */
  recordCurrent(type: string) {
    let ele: ELEMENT_INSTANCE | null = null
    switch (type) {
      case CANVAS_ELE_TYPE.FREE_LINE:
        ele = new FreeLine(
          this.currentLineColor,
          this.currentLineWidth,
          this.layer.current
        )
        break
      case CANVAS_ELE_TYPE.CLEAN_LINE:
        ele = new CleanLine(this.cleanWidth, this.layer.current)
        break
      default:
        break
    }
    if (ele) {
      this.history.add(ele)
      this.currentEle = ele
      this.sortOnLayer()
    }
  }

  /**
   * 对history进行排序
   */
  sortOnLayer() {
    this.history.sort((a, b) => {
      return (
        this.layer.stack.findIndex(({ id }) => id === b?.layer) -
        this.layer.stack.findIndex(({ id }) => id === a?.layer)
      )
    })
  }

  /**
   * 为当前元素添加坐标数据
   */
  currentAddPosition(position: MousePosition) {
    this.currentEle?.addPosition({
      x: position.x - this.canvasRect.left - this.originTranslate.x,
      y: position.y - this.canvasRect.top - this.originTranslate.y
    })
    this.initOriginPosition()
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
    this.cleanCanvas()
    if (this.history.cacheQueue.length > 0) {
      const showLayerIds = new Set(
        this.layer.stack.reduce<number[]>((acc, cur) => {
          return cur.show ? [...acc, cur.id] : acc
        }, [])
      )
      this.history.each((ele) => {
        if (ele?.layer && showLayerIds.has(ele.layer)) {
          this.context.save()
          switch (ele?.type) {
            case CANVAS_ELE_TYPE.FREE_LINE:
              freeLineRender(this.context, ele as FreeLine)
              break
            case CANVAS_ELE_TYPE.CLEAN_LINE:
              cleanLineRender(
                this.context,
                this.cleanCanvas.bind(this),
                ele as CleanLine
              )
              break
            default:
              break
          }
          this.context.restore()
        }
      })
    }
    this.cache()
  }

  /**
   * localStorage 缓存
   */
  cache() {
    const history = this.history.cacheQueue.slice(0, this.history.step + 1)
    const {
      currentLineColor,
      currentLineWidth,
      cleanWidth,
      originTranslate,
      layer
    } = this
    const state = {
      currentLineColor,
      currentLineWidth,
      cleanWidth,
      originTranslate,
      layer
    }
    storage.set(BOARD_STORAGE_KEY, { history, state })
  }

  /**
   * 清除画布
   */
  cleanCanvas(w = Number.MAX_SAFE_INTEGER) {
    this.context.clearRect(-(w / 2), -(w / 2), w, w)
  }

  // 当前绘线颜色
  currentLineColor = '#000000'
  // 当前绘线宽
  currentLineWidth = CommonWidth.W4

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
  cleanWidth = CommonWidth.W4

  /**
   * 修改橡皮擦宽度
   * @param width 橡皮擦宽度
   */
  setCleanWidth(width: number) {
    if (width) {
      this.cleanWidth = width
    }
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
    const imageUrl = this.canvas.toDataURL('image/png')
    const elink = document.createElement('a')
    elink.download = 'image'
    elink.style.display = 'none'
    elink.href = imageUrl
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href)
    document.body.removeChild(elink)
    this.context.translate(this.originTranslate.x, this.originTranslate.y)
  }
}
