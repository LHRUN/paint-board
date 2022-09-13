import { MousePosition } from '@/types'
import { CANVAS_ELE_TYPE, CleanWidth } from './constants'

export class CleanLine {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  positions: MousePosition[]
  type: string
  // 当前橡皮擦宽度
  cleanWidth: number

  constructor(
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    width: number
  ) {
    this.positions = []
    this.type = CANVAS_ELE_TYPE.FREE_LINE
    this.canvas = canvas
    this.context = context
    this.cleanWidth = width
  }

  addPosition(position: MousePosition) {
    this.positions.push(position)
  }

  render() {
    for (let i = 0; i < this.positions.length - 1; i++) {
      this.cleanLine(this.positions[i], this.positions[i + 1])
    }
  }

  /**
   * 模拟橡皮擦线性清除
   * @param start 起点
   * @param end 终点
   */
  cleanLine(start: MousePosition, end: MousePosition) {
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
    this.context.save()
    this.context.beginPath()
    this.context.arc(x2, y2, this.cleanWidth, 0, 2 * Math.PI)
    this.context.clip()
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.restore()

    //清除矩形剪辑区域里的像素
    this.context.save()
    this.context.beginPath()
    this.context.moveTo(x3, y3)
    this.context.lineTo(x5, y5)
    this.context.lineTo(x6, y6)
    this.context.lineTo(x4, y4)
    this.context.closePath()
    this.context.clip()
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.context.restore()
  }
}
