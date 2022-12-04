import { Eraser } from '@/utils/element/eraser'
import { FreeDraw } from '@/utils/element/freeDraw'
import { TextElement } from '@/utils/element/text'

// 鼠标位置
export interface MousePosition {
  x: number
  y: number
}

// 元素实例类型
export type ELEMENT_INSTANCE = FreeDraw | Eraser | TextElement

/**
 * 元素矩形
 */
export interface ElementRect {
  x: number
  y: number
  width: number
  height: number
}
