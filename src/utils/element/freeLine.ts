import { getDistance } from '../common'
import { CANVAS_ELE_TYPE } from '../constants'
import { MousePosition } from '@/types'
import { CanvasElement } from './element'

/**
 * 自由画笔
 */
export class FreeLine extends CanvasElement {
  // 鼠标移动位置记录
  positions: MousePosition[]
  // 当前绘线颜色
  color = '#000000'
  // 最大线宽
  maxWidth: number
  // 最小线宽
  minWidth: number
  // 线宽记录
  lineWidths: number[]
  // 最大速度
  maxSpeed = 10
  // 最小速度
  minSpeed = 0.5
  // 最后mouse移动时间
  lastMoveTime = 0
  // 最后绘线宽度
  lastLineWidth: number

  constructor(color: string, width: number, layer: number) {
    super(CANVAS_ELE_TYPE.FREE_LINE, layer)
    this.positions = []
    this.lineWidths = [0]
    this.color = color
    this.maxWidth = width
    this.minWidth = width / 2
    this.lastLineWidth = width
  }

  /**
   * 添加位置记录
   * @param position
   */
  addPosition(position: MousePosition) {
    this.positions.push(position)
    // 处理当前线宽
    if (this.positions.length > 1) {
      const mouseSpeed = this._computedSpeed(
        this.positions[this.positions.length - 2],
        this.positions[this.positions.length - 1]
      )
      const lineWidth = this._computedLineWidth(mouseSpeed)
      this.lineWidths.push(lineWidth)
    }
  }

  /**
   * 计算移动速度
   * @param start 起点
   * @param end 终点
   * @returns 鼠标速度
   */
  private _computedSpeed(start: MousePosition, end: MousePosition) {
    // 获取距离
    const moveDistance = getDistance(start, end)

    const curTime = Date.now()
    // 获取移动间隔时间   lastMoveTime：最后鼠标移动时间
    const moveTime = curTime - this.lastMoveTime
    // 计算速度
    const mouseSpeed = moveDistance / moveTime
    // 更新最后移动时间
    this.lastMoveTime = curTime
    return Number(mouseSpeed.toFixed(5))
  }

  /**
   * 计算画笔宽度
   * @param speed 鼠标移动速度
   */
  private _computedLineWidth(speed: number) {
    let lineWidth = 0
    const minWidth = this.minWidth
    const maxWidth = this.maxWidth
    if (speed >= this.maxSpeed) {
      lineWidth = minWidth
    } else if (speed <= this.minSpeed) {
      lineWidth = maxWidth
    } else {
      lineWidth = maxWidth - (speed / this.maxSpeed) * maxWidth
    }

    lineWidth = lineWidth * (1 / 3) + this.lastLineWidth * (2 / 3)
    this.lastLineWidth = lineWidth
    return lineWidth
  }
}

/**
 * 自由画笔渲染
 * @param context canvas二维渲染上下文
 * @param instance FreeLine
 */
export const freeLineRender = (
  context: CanvasRenderingContext2D,
  instance: FreeLine
) => {
  context.save()
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = instance.color
  for (let i = 1; i < instance.positions.length; i++) {
    _drawLine(instance, i, context)
  }
  context.restore()
}

/**
 * 画线
 * @param instance FreeLine 实例
 * @param i 下标
 * @param context canvas二维渲染上下文
 */
const _drawLine = (
  instance: FreeLine,
  i: number,
  context: CanvasRenderingContext2D
) => {
  const { positions, lineWidths } = instance
  const { x: centerX, y: centerY } = positions[i - 1]
  const { x: endX, y: endY } = positions[i]
  context.beginPath()
  if (i == 1) {
    context.moveTo(centerX, centerY)
    context.lineTo(endX, endY)
  } else {
    const { x: startX, y: startY } = positions[i - 2]
    const lastX = (startX + centerX) / 2
    const lastY = (startY + centerY) / 2
    const x = (centerX + endX) / 2
    const y = (centerY + endY) / 2
    context.moveTo(lastX, lastY)
    context.quadraticCurveTo(centerX, centerY, x, y)
  }

  context.lineWidth = lineWidths[i]
  context.stroke()
}
