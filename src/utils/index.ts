import { MousePosition } from '@/types'

/**
 * 计算两点之间的距离
 * @param start 起点
 * @param end 终点
 * @returns 距离
 */
export const getDistance = (start: MousePosition, end: MousePosition) => {
  return Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2))
}
