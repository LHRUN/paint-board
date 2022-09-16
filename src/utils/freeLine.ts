import { getDistance } from './index'
import { CANVAS_ELE_TYPE } from './constants'
import { MousePosition } from '@/types'

export class FreeLine {
  // 鼠标移动位置记录
  positions: MousePosition[]
  type: string
  // 当前绘线颜色
  color = 'black'
  // 最大线宽
  maxWidth: number
  // 最小线宽
  minWidth: number
  // 速度列表
  mouseSpeeds: number[]
  // 最大速度
  maxSpeed = 10
  // 最小速度
  minSpeed = 1
  // 最后mouse移动时间
  lastMouseTime = 0
  // 最后绘线宽度
  lastLineWidth: number

  constructor(color: string, width: number) {
    this.positions = []
    this.mouseSpeeds = [0]
    this.type = CANVAS_ELE_TYPE.FREE_LINE
    this.color = color
    this.maxWidth = width
    this.minWidth = width / 2
    this.lastLineWidth = width
  }

  addPosition(position: MousePosition) {
    this.positions.push(position)
    // 记录当前鼠标移动速度，为后面的线宽做计算
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
    // 使用两点距离公式计算出鼠标这一次和上一次的移动距离
    const mouseDistance = getDistance(start, end)
    // 计算时间
    const curTime = Date.now()
    const mouseDuration = curTime - this.lastMouseTime
    // 计算速度
    const mouseSpeed = mouseDistance / mouseDuration
    // 更新时间
    this.lastMouseTime = curTime
    return Number(mouseSpeed.toFixed(5))
  }
}

export const freeLineRender = (
  context: CanvasRenderingContext2D,
  instance: FreeLine
) => {
  context.save()
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.strokeStyle = instance.color
  for (let i = 1; i < instance.positions.length; i++) {
    _drawLine(
      instance.positions[i - 1],
      instance.positions[i],
      context,
      instance.mouseSpeeds[i],
      instance
    )
  }
  context.restore()
}

/**
 * 画线
 * @param start 起点
 * @param end 终点
 * @param context
 * @param speed 鼠标移动速度
 * @param instance 画笔实例
 */
const _drawLine = (
  start: MousePosition,
  end: MousePosition,
  context: CanvasRenderingContext2D,
  speed: number,
  instance: FreeLine
) => {
  context.beginPath()
  context.moveTo(start.x, start.y)
  context.lineTo(end.x, end.y)

  const lineWidth = _computedLineWidth(speed, instance)
  if (lineWidth > 0) {
    context.lineWidth = lineWidth
  }

  context.stroke()
}

/**
 * 计算画笔宽度
 * @param speed 鼠标移动速度
 * @param instance 画笔实例
 * @returns 画笔宽度
 */
const _computedLineWidth = (speed: number, instance: FreeLine) => {
  let lineWidth = 0
  if (speed >= instance.maxSpeed) {
    lineWidth = instance.minWidth
  } else if (speed <= instance.minSpeed) {
    lineWidth = instance.maxWidth
  } else {
    lineWidth =
      instance.maxWidth -
      ((speed - instance.minSpeed) / (instance.maxSpeed - instance.minSpeed)) *
        instance.maxWidth
  }

  lineWidth = lineWidth * (1 / 3) + instance.lastLineWidth * (2 / 3)
  instance.lastLineWidth = lineWidth
  return lineWidth
}
