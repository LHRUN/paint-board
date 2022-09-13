import { getDistance } from './index'
import { CANVAS_ELE_TYPE, LineWidth } from './constants'
import { MousePosition } from '@/types'

export class FreeLine {
  positions: MousePosition[]
  type: string

  // 当前绘线颜色
  color = 'black'
  // 当前绘线宽
  currentLineWidth = LineWidth.W5

  constructor(color: string, width: number) {
    this.positions = []
    this.type = CANVAS_ELE_TYPE.FREE_LINE
    this.color = color
    this.currentLineWidth = width
  }

  addPosition(position: MousePosition) {
    this.positions.push(position)
  }

  render(context: CanvasRenderingContext2D) {
    context.beginPath()
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = this.color
    for (let i = 1; i < this.positions.length; i++) {
      this.drawLine(this.positions[i - 1], this.positions[i], context)
    }
    context.stroke()
  }

  // 最后mouse移动时间
  lastMouseTime = 0
  // 最后绘线宽度
  lastLineWidth = LineWidth.W5

  /**
   * 画线
   * @param start 起点
   * @param end 终点
   */
  drawLine(
    start: MousePosition,
    end: MousePosition,
    context: CanvasRenderingContext2D
  ) {
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)

    // 使用两点距离公式计算出鼠标这一次和上一次的移动距离
    // const mouseDistance = getDistance(start, end)
    // // 计算时间
    // const curTime = Date.now()
    // const mouseDuration = curTime - this.lastMouseTime
    // // 计算速度
    // const mouseSpeed = mouseDistance / mouseDuration
    // // 更新时间
    // this.lastMouseTime = curTime

    // const lineWidth = this.computedLineWidth(mouseSpeed)
    context.lineWidth = this.currentLineWidth
  }

  /**
   * 计算线宽
   * @param speed
   * @returns
   */
  // private computedLineWidth(speed: number) {
  //   let lineWidth = 0
  //   const minLineWidth = 2
  //   const maxSpeed = 10
  //   const minSpeed = 0.5
  //   // 速度超快，那么直接使用最小的笔画
  //   if (speed >= maxSpeed) {
  //     lineWidth = minLineWidth
  //   } else if (speed <= minSpeed) {
  //     // 速度超慢，那么直接使用最大的笔画
  //     lineWidth = this.currentLineWidth
  //   } else {
  //     // 中间速度，那么根据速度的比例来计算
  //     lineWidth =
  //       this.currentLineWidth -
  //       ((speed - minSpeed) / (maxSpeed - minSpeed)) * this.currentLineWidth
  //   }

  //   lineWidth = lineWidth * (1 / 2) + this.lastLineWidth * (1 / 2)
  //   this.lastLineWidth = lineWidth
  //   return lineWidth
  // }
}
