import { getDistance } from './index'
import { CANVAS_ELE_TYPE, CommonWidth } from './constants'
import { MousePosition } from '@/types'

export class FreeLine {
  positions: MousePosition[]
  type: string

  // 当前绘线颜色
  color = 'black'
  // 当前绘线宽
  maxWidth = CommonWidth.W5
  // 速度列表
  mouseSpeeds: number[]
  maxSpeed = 10
  minSpeed = 0.5

  constructor(color: string, width: number) {
    this.positions = []
    this.mouseSpeeds = [0]
    this.type = CANVAS_ELE_TYPE.FREE_LINE
    this.color = color
    this.maxWidth = width
  }

  addPosition(position: MousePosition) {
    this.positions.push(position)
    if (this.positions.length > 1) {
      this.mouseSpeeds.push(
        this.computedSpeed(
          this.positions[this.positions.length - 2],
          this.positions[this.positions.length - 1]
        )
      )
    }
  }

  render(context: CanvasRenderingContext2D) {
    context.save()
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = this.color
    for (let i = 1; i < this.positions.length; i++) {
      this.drawLine(
        this.positions[i - 1],
        this.positions[i],
        context,
        this.mouseSpeeds[i]
      )
    }
    context.restore()
  }

  // 最后mouse移动时间
  lastMouseTime = 0
  // 最后绘线宽度
  lastLineWidth = CommonWidth.W5

  /**
   * 画线
   * @param start 起点
   * @param end 终点
   */
  drawLine(
    start: MousePosition,
    end: MousePosition,
    context: CanvasRenderingContext2D,
    speed: number
  ) {
    context.beginPath()
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)

    const lineWidth = this.computedLineWidth(speed)
    if (lineWidth > 0) {
      context.lineWidth = lineWidth
    }

    context.stroke()
  }

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
    return mouseSpeed
  }

  /**
   * 计算线宽
   * @param speed
   * @returns
   */
  private computedLineWidth(speed: number) {
    let lineWidth = 0
    const minLineWidth = Math.floor(this.maxWidth / 2)
    // 速度超快，那么直接使用最小的笔画
    if (speed >= this.maxSpeed) {
      lineWidth = minLineWidth
    } else if (speed <= this.minSpeed) {
      // 速度超慢，那么直接使用最大的笔画
      lineWidth = this.maxWidth
    } else {
      // 中间速度，那么根据速度的比例来计算
      lineWidth =
        this.maxWidth -
        ((speed - this.minSpeed) / (this.maxSpeed - this.minSpeed)) *
          this.maxWidth
    }

    lineWidth = lineWidth * (1 / 2) + this.lastLineWidth * (1 / 2)
    this.lastLineWidth = lineWidth
    return lineWidth
  }
}
