import { CleanLine } from '@/utils/element/cleanLine'
import { FreeLine } from '@/utils/element/freeLine'
// 鼠标位置
export interface MousePosition {
  x: number
  y: number
}

// 元素实例类型
export type ELEMENT_INSTANCE = FreeLine | CleanLine
