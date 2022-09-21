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
  color = 'black'
  // 最大线宽
  maxWidth: number
  // 最小线宽
  minWidth: number
  // 鼠标移动速度记录
  mouseSpeeds: number[]
  // 最大速度
  maxSpeed = 10
  // 最小速度
  minSpeed = 1
  // 最后mouse移动时间
  lastMoveTime = 0
  // 最后绘线宽度
  lastLineWidth: number

  constructor(color: string, width: number, layer: number) {
    super(CANVAS_ELE_TYPE.FREE_LINE, layer)
    this.positions = []
    this.mouseSpeeds = [0]
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
    // 记录当前鼠标移动速度，用于线宽计算
    if (this.positions.length > 1) {
      this.mouseSpeeds.push(
        this.computedSpeed(
          this.positions[this.positions.length - 2],
          this.positions[this.positions.length - 1]
        )
      )
    }
  }

  /**
   * 计算移动速度
   * @param start 起点
   * @param end 终点
   * @returns 鼠标速度
   */
  private computedSpeed(start: MousePosition, end: MousePosition) {
    // 计算距离
    const moveDistance = getDistance(start, end)
    // 计算时间
    const curTime = Date.now()
    const moveTime = curTime - this.lastMoveTime
    // 计算速度
    const moveSpeed = moveDistance / moveTime
    // 更新时间
    this.lastMoveTime = curTime
    return Number(moveSpeed.toFixed(5))
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
  const { positions, mouseSpeeds } = instance
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

  const lineWidth = _computedLineWidth(mouseSpeeds[i], instance)
  if (lineWidth > 0) {
    context.lineWidth = lineWidth
  }

  context.stroke()
}

/**
 * 计算画笔宽度
 * @param speed 鼠标移动速度
 * @param instance FreeLine 实例
 * @returns 画笔宽度
 */
const _computedLineWidth = (speed: number, instance: FreeLine) => {
  let lineWidth = 0
  const minWidth = instance.minWidth
  const maxWidth = instance.maxWidth
  if (speed >= instance.maxSpeed) {
    lineWidth = minWidth
  } else if (speed <= instance.minSpeed) {
    lineWidth = maxWidth
  } else {
    lineWidth =
      maxWidth -
      ((speed - instance.minSpeed) / (instance.maxSpeed - instance.minSpeed)) *
        maxWidth
  }

  lineWidth = lineWidth * (1 / 3) + instance.lastLineWidth * (2 / 3)
  instance.lastLineWidth = lineWidth
  return lineWidth
}
