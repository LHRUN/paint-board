import { cloneDeep } from 'lodash'
import { PaintBoard } from './paintBoard'
import { ElementRect, ELEMENT_INSTANCE, MousePosition } from '@/types'
import { CANVAS_ELE_TYPE, RESIZE_TYPE } from './constants'
import { CURSOR_TYPE, getResizeCursorType } from './cursor'
import {
  drawRect,
  getDistance,
  getPositionToLineDistance,
  isInsideRect
} from './common'
import {
  FreeDraw,
  FreeDrawRect,
  moveFreeDraw,
  resizeFreeDraw
} from './element/freeDraw'
import { resizeTextElement, TextElement } from './element/text'
import { EACH_ORDER_TYPE } from './history'

export class SelectElement {
  board: PaintBoard // 画板
  mouseHoverElementIndex = -1 // 鼠标悬停元素下标
  selectElementIndex = -1 // 当前选择元素下标
  startMousePos = {
    x: 0,
    y: 0
  } // 选择元素鼠标初始位置
  resizeType = RESIZE_TYPE.NULL // 调整大小类型
  tempCache: ELEMENT_INSTANCE[] | null = null // 临时缓存
  isCurrentChange = false // 当前选择元素是否有变化

  constructor(board: PaintBoard) {
    this.board = board
  }

  /**
   * 移动鼠标
   * @param position
   */
  moveSelectElement(position: MousePosition) {
    const movePos = this.board.transformPosition(position)
    let cursorType = CURSOR_TYPE.AUTO

    /**
     * 遍历符合条件的所有元素，判断鼠标是否悬浮到元素上方
     */
    if (this.board.history.getCurrentStack()?.length ?? 0 > 0) {
      const showLayerIds = new Set(
        this.board.layer.stack.reduce<number[]>((acc, cur) => {
          return cur.show ? [...acc, cur.id] : acc
        }, [])
      )
      let done = false // 判断是否找到元素
      this.board.history.each((ele, eleIndex) => {
        if (ele?.layer && showLayerIds.has(ele.layer)) {
          if (done) {
            return
          }
          let positions = []
          switch (ele.type) {
            case CANVAS_ELE_TYPE.FREE_DRAW:
              positions = (ele as FreeDraw).positions
              for (let i = 1; i < positions.length; i++) {
                const distance1 = getDistance(movePos, positions[i - 1])
                const distance2 = getDistance(movePos, positions[i])
                const distance = getPositionToLineDistance(
                  movePos,
                  positions[i - 1],
                  positions[i]
                )
                if ((distance1 < 10 || distance2 < 10) && distance < 10) {
                  this.mouseHoverElementIndex = eleIndex
                  cursorType = CURSOR_TYPE.POINTER
                  done = true
                }
              }
              break
            case CANVAS_ELE_TYPE.TEXT:
              if (isInsideRect(movePos, (ele as TextElement).rect)) {
                this.mouseHoverElementIndex = eleIndex
                cursorType = CURSOR_TYPE.POINTER
                done = true
              }
              break
            default:
              break
          }
        }
      }, EACH_ORDER_TYPE.LAST)
      if (!done) {
        this.mouseHoverElementIndex = -1
      }
    }
    if (this.selectElementIndex !== -1) {
      if (this.resizeType !== RESIZE_TYPE.NULL) {
        // 在有选择元素并且有状态处理的情况
        this.isCurrentChange = true
        const { x, y } = movePos
        const resizeElement = this.getCurSelectElement()
        const disntanceX = x - this.startMousePos.x
        const disntanceY = y - this.startMousePos.y
        cursorType = getResizeCursorType(this.resizeType, cursorType)

        // 画笔
        if (resizeElement.type === CANVAS_ELE_TYPE.FREE_DRAW) {
          const rect = { ...resizeElement.rect } as FreeDrawRect
          switch (this.resizeType) {
            case RESIZE_TYPE.BODY:
              moveFreeDraw(resizeElement as FreeDraw, disntanceX, disntanceY)
              break
            case RESIZE_TYPE.BOTTOM_RIGHT:
              resizeFreeDraw(
                resizeElement as FreeDraw,
                (rect.width + disntanceX) / rect.width,
                (rect.height + disntanceY) / rect.height,
                rect,
                RESIZE_TYPE.BOTTOM_RIGHT
              )
              break
            case RESIZE_TYPE.BOTTOM_LEFT:
              resizeFreeDraw(
                resizeElement as FreeDraw,
                (rect.width - disntanceX) / rect.width,
                (rect.height + disntanceY) / rect.height,
                rect,
                RESIZE_TYPE.BOTTOM_LEFT
              )
              break
            case RESIZE_TYPE.TOP_LEFT:
              resizeFreeDraw(
                resizeElement as FreeDraw,
                (rect.width - disntanceX) / rect.width,
                (rect.height - disntanceY) / rect.height,
                rect,
                RESIZE_TYPE.TOP_LEFT
              )
              break
            case RESIZE_TYPE.TOP_RIGHT:
              resizeFreeDraw(
                resizeElement as FreeDraw,
                (rect.width + disntanceX) / rect.width,
                (rect.height - disntanceY) / rect.height,
                rect,
                RESIZE_TYPE.TOP_RIGHT
              )
              break
            default:
              break
          }

          // 文本元素
        } else if (resizeElement.type === CANVAS_ELE_TYPE.TEXT) {
          switch (this.resizeType) {
            case RESIZE_TYPE.BODY:
              resizeElement.rect.x += disntanceX
              resizeElement.rect.y += disntanceY
              break
            case RESIZE_TYPE.BOTTOM_RIGHT:
              resizeTextElement(
                resizeElement as TextElement,
                resizeElement.rect.width + disntanceX,
                resizeElement.rect.height + disntanceY,
                RESIZE_TYPE.BOTTOM_RIGHT
              )
              break
            case RESIZE_TYPE.BOTTOM_LEFT:
              resizeTextElement(
                resizeElement as TextElement,
                resizeElement.rect.width - disntanceX,
                resizeElement.rect.height + disntanceY,
                RESIZE_TYPE.BOTTOM_LEFT
              )
              break
            case RESIZE_TYPE.TOP_LEFT:
              resizeTextElement(
                resizeElement as TextElement,
                resizeElement.rect.width - disntanceX,
                resizeElement.rect.height - disntanceY,
                RESIZE_TYPE.TOP_LEFT
              )
              break
            case RESIZE_TYPE.TOP_RIGHT:
              resizeTextElement(
                resizeElement as TextElement,
                resizeElement.rect.width + disntanceX,
                resizeElement.rect.height - disntanceY,
                RESIZE_TYPE.TOP_RIGHT
              )
              break
            default:
              break
          }
        }

        this.startMousePos = movePos
        this.board.render()
      } else {
        const resizeType = getResizeType(
          movePos,
          this.getCurSelectElement().rect
        )
        cursorType = getResizeCursorType(resizeType, cursorType)
      }
    }
    this.board.cursor.change(cursorType)
  }

  /**
   * 鼠标点击获取选择元素
   * @param position
   */
  clickSelectElement(position: MousePosition) {
    const resizeMousePos = this.board.transformPosition(position)
    // 在有选择元素，判断当前的点击位置
    if (this.selectElementIndex !== -1) {
      const resizeType = getResizeType(
        resizeMousePos,
        this.getCurSelectElement().rect
      )
      this.resizeType = resizeType
    }
    if (this.resizeType === RESIZE_TYPE.NULL) {
      if (this.mouseHoverElementIndex !== -1) {
        // 点击其他元素
        this.board.cursor.change(CURSOR_TYPE.MOVE)
        this.selectElementIndex = this.mouseHoverElementIndex
      } else {
        // 点击空白处
        this.cancelSelectElement()
      }
    }

    // 缓存当前数据
    if (this.selectElementIndex !== -1) {
      this.tempCache = cloneDeep(this.board.history.getCurrentStack())
      this.startMousePos = resizeMousePos
    }

    this.board.render()
  }

  /**
   * 获取当前选择元素
   * @param index 坐标
   */
  getCurSelectElement() {
    const last = this.board.history.getCurrentStack() as ELEMENT_INSTANCE[]
    return last[this.selectElementIndex] as FreeDraw | TextElement
  }

  /**
   * 取消选择元素
   */
  cancelSelectElement() {
    this.selectElementIndex = -1
  }

  /**
   * 删除当前选择元素
   */
  deleteSelectElement() {
    if (this.selectElementIndex !== -1) {
      this.board.history.deleteByIndex(this.selectElementIndex)
      this.cancelSelectElement()
      this.mouseHoverElementIndex = -1
      this.resizeType = RESIZE_TYPE.NULL
      this.board.render()
    }
  }
}

/**
 * 绘制拖拽矩形
 */
export const drawResizeRect = (
  context: CanvasRenderingContext2D,
  rect: ElementRect
) => {
  const { x, y, width, height } = rect
  context.save()
  context.strokeStyle = '#65CC8A'
  context.setLineDash([5])
  context.lineWidth = 2
  context.lineCap = 'round'
  context.lineJoin = 'round'
  // 绘制虚线框
  drawRect(context, x, y, width, height)

  // 绘制四角手柄
  context.fillStyle = '#65CC8A'
  drawRect(context, x - 10, y - 10, 10, 10, true)
  drawRect(context, x + width, y - 10, 10, 10, true)
  drawRect(context, x - 10, y + height, 10, 10, true)
  drawRect(context, x + width, y + height, 10, 10, true)
  context.restore()
}

/**
 * 获取调整大小类型
 * @param position
 * @param rect
 */
export const getResizeType = (position: MousePosition, rect: ElementRect) => {
  let resizeType = RESIZE_TYPE.NULL
  const { x, y } = position
  if (isInsideRect(position, rect)) {
    resizeType = RESIZE_TYPE.BODY
  } else if (rect.x > x && x > rect.x - 10) {
    if (rect.y > y && y > rect.y - 10) {
      resizeType = RESIZE_TYPE.TOP_LEFT
    } else if (rect.y + rect.height + 10 > y && y > rect.y + rect.height) {
      resizeType = RESIZE_TYPE.BOTTOM_LEFT
    }
  } else if (rect.x + rect.width + 10 > x && x > rect.x + rect.width) {
    if (rect.y > y && y > rect.y - 10) {
      resizeType = RESIZE_TYPE.TOP_RIGHT
    } else if (rect.y + rect.height + 10 > y && y > rect.y + rect.height) {
      resizeType = RESIZE_TYPE.BOTTOM_RIGHT
    }
  }
  return resizeType
}
