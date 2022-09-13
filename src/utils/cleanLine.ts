import { MousePosition } from '@/types'
import { CANVAS_ELE_TYPE } from './constants'

export class CleanLine {
  positions: MousePosition[]
  type: string
  // 当前橡皮擦宽度
  cleanWidth: number

  constructor(width: number) {
    this.positions = []
    this.type = CANVAS_ELE_TYPE.FREE_LINE
    this.cleanWidth = width
  }

  addPosition(position: MousePosition) {
    this.positions.push(position)
  }

  render(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    for (let i = 0; i < this.positions.length - 1; i++) {
      this.cleanLine(this.positions[i], this.positions[i + 1], context, canvas)
    }
  }

  /**
   * 模拟橡皮擦线性清除
   * @param start 起点
   * @param end 终点
   */
  cleanLine(
    start: MousePosition,
    end: MousePosition,
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) {
    const { x: x1, y: y1 } = start
    const { x: x2, y: y2 } = end

    //获取两个点之间的剪辑区域四个端点
    const asin = this.cleanWidth * Math.sin(Math.atan((y2 - y1) / (x2 - x1)))
    const acos = this.cleanWidth * Math.cos(Math.atan((y2 - y1) / (x2 - x1)))
    const x3 = x1 + asin
    const y3 = y1 - acos
    const x4 = x1 - asin
    const y4 = y1 + acos
    const x5 = x2 + asin
    const y5 = y2 - acos
    const x6 = x2 - asin
    const y6 = y2 + acos

    //保证线条的连贯，所以在矩形一端画圆
    context.save()
    context.beginPath()
    context.arc(x2, y2, this.cleanWidth, 0, 2 * Math.PI)
    context.clip()
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.restore()

    //清除矩形剪辑区域里的像素
    context.save()
    context.beginPath()
    context.moveTo(x3, y3)
    context.lineTo(x5, y5)
    context.lineTo(x6, y6)
    context.lineTo(x4, y4)
    context.closePath()
    context.clip()
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.restore()
  }
}
