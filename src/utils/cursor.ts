import { RESIZE_TYPE } from './constants'

export enum CURSOR_TYPE {
  AUTO = 'auto', // 默认样式
  POINTER = 'pointer', // 悬浮样式
  MOVE = 'move', // 移动样式
  NE_RESIZE = 'ne-resize', // 右上方朝向箭头
  NW_RESIZE = 'nw-resize', // 左上方朝向箭头
  SE_RESIZE = 'se-resize', // 右下方朝向箭头
  SW_RESIZE = 'sw-resize' // 左下方朝向箭头
}

/**
 * 鼠标光标
 */
export class Cursor {
  element: HTMLElement
  type = CURSOR_TYPE.AUTO

  constructor(element: HTMLElement) {
    this.element = element
    this.reset()
  }

  /**
   * 改变光标
   * @param type
   */
  change(type: string) {
    this.element.style.cursor = type
  }

  /**
   * 重置光标
   */
  reset() {
    this.element.style.cursor = CURSOR_TYPE.AUTO
  }
}

/**
 * 根据当前手柄类型获取鼠标光标
 * @param resizeType // 手柄类型
 * @param defaultCursorType // 默认光标样式
 */
export const getResizeCursorType = (
  resizeType: string,
  defaultCursorType: CURSOR_TYPE = CURSOR_TYPE.AUTO
): CURSOR_TYPE => {
  let cursorType = defaultCursorType
  switch (resizeType) {
    case RESIZE_TYPE.BODY:
      cursorType = CURSOR_TYPE.MOVE
      break
    case RESIZE_TYPE.BOTTOM_RIGHT:
      cursorType = CURSOR_TYPE.SE_RESIZE
      break
    case RESIZE_TYPE.BOTTOM_LEFT:
      cursorType = CURSOR_TYPE.SW_RESIZE
      break
    case RESIZE_TYPE.TOP_LEFT:
      cursorType = CURSOR_TYPE.NW_RESIZE
      break
    case RESIZE_TYPE.TOP_RIGHT:
      cursorType = CURSOR_TYPE.NE_RESIZE
      break
    default:
      break
  }
  return cursorType
}
