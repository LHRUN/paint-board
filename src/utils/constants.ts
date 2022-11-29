// canvas 元素类型
export enum CANVAS_ELE_TYPE {
  FREE_LINE = 'freeLine',
  CLEAN_LINE = 'cleanLine',
  SELECT = 'select',
  TEXT = 'text'
}

// 通用绘画宽度
export const CommonWidth = {
  W4: 4,
  W8: 8,
  W12: 12,
  W14: 14
}

// 按键
export enum KeyCode {
  SPACE = 'Space', // 空格键
  BACKSPACE = 'Backspace' // 删除键
}

// 拖拽类型
export enum RESIZE_TYPE {
  NULL = 'null',
  BODY = 'body',
  BOTTOM_LEFT = 'bottom_left',
  BOTTOM_RIGHT = 'bottom_right',
  TOP_LEFT = 'top_left',
  TOP_RIGHT = 'top_right'
}
