import { RESIZE_TYPE } from './constants'

export enum CURSOR_TYPE {
  AUTO = 'auto',
  POINTER = 'pointer',
  MOVE = 'move',
  NE_RESIZE = 'ne-resize', // 右上方朝向箭头
  NW_RESIZE = 'nw-resize', // 左上方朝向箭头
  SE_RESIZE = 'se-resize', // 右下方朝向箭头
  SW_RESIZE = 'sw-resize' // 左下方朝向箭头
}

export class Cursor {
  element: HTMLElement
  type = CURSOR_TYPE.AUTO

  constructor(element: HTMLElement) {
    this.element = element
    this.reset()
  }

  change(type: string) {
    this.element.style.cursor = type
  }

  reset() {
    this.element.style.cursor = CURSOR_TYPE.AUTO
  }
}

export const getResizeCursorType = (
  resizeType: string,
  defaultCursorType: CURSOR_TYPE
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
