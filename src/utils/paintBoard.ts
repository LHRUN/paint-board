import { MousePosition } from '@/types/mouse'
import { getDistance } from '@/utils'
import { CleanWidth, LineWidth } from '../pages/board/constants'
import { History } from './history'

export class PaintBoard {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  history: History
  position = {
    top: 0,
    left: 0
  }

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.context = canvas.getContext('2d') as CanvasRenderingContext2D
    const { top, left } = canvas.getBoundingClientRect()
    this.position = {
      top,
      left
    }
    this.history = new History()
  }

  lastMouseTime = 0
  // 最后绘线宽度
  lastLineWidth = LineWidth.W5
  // 当前绘线宽
  currentLineWidth = LineWidth.W5
  // 当前绘线颜色
  currentLineColor = 'black'

  /**
   * 画线
   * @param start 起点
   * @param end 终点
   */
  drawLine(start: MousePosition, end: MousePosition) {
    this.context.beginPath()
    this.context.lineCap = 'round'
    this.context.lineJoin = 'round'
    this.context.moveTo(start.x, start.y)
    this.context.lineTo(end.x, end.y)
    this.context.strokeStyle = this.currentLineColor

    // 使用两点距离公式计算出鼠标这一次和上一次的移动距离
    const mouseDistance = getDistance(start, end)
    console.log('mouseDistance', mouseDistance)
    // 计算时间
    const curTime = Date.now()
    const mouseDuration = curTime - this.lastMouseTime
    // 计算速度
    const mouseSpeed = mouseDistance / mouseDuration
    // 更新时间
    this.lastMouseTime = curTime

    const lineWidth = this.computedLineWidth(Number(mouseSpeed))
    this.context.lineWidth = lineWidth

    this.context.stroke()
    this.context.closePath()
  }

  /**
   * 计算线宽
   * @param speed
   * @returns
   */
  private computedLineWidth(speed: number) {
    console.log('speed', speed)
    let lineWidth = 0
    const minLineWidth = 2
    const maxSpeed = 10
    const minSpeed = 0.5
    // 速度超快，那么直接使用最小的笔画
    if (speed >= maxSpeed) {
      lineWidth = minLineWidth
    } else if (speed <= minSpeed) {
      // 速度超慢，那么直接使用最大的笔画
      lineWidth = this.currentLineWidth
    } else {
      // 中间速度，那么根据速度的比例来计算
      lineWidth =
        this.currentLineWidth -
        ((speed - minSpeed) / (maxSpeed - minSpeed)) * this.currentLineWidth
    }

    lineWidth = lineWidth * (1 / 2) + this.lastLineWidth * (1 / 2)
    this.lastLineWidth = lineWidth
    return lineWidth
  }

  /**
   * 修改绘线宽
   * @param width 绘线宽
   */
  setLineWidth(width: number) {
    this.currentLineWidth = width
  }

  /**
   * 修改绘线颜色
   * @param color 绘线颜色
   */
  setLineColor(color: string) {
    this.currentLineColor = color
  }

  // 当前橡皮擦宽度
  cleanWidth = CleanWidth.W5

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

  /**
   * 修改橡皮擦宽度
   * @param width 橡皮擦宽度
   */
  setCleanWidth(width: number) {
    this.cleanWidth = width
  }

  /**
   * 记录当前绘画
   */
  record() {
    const data = this.canvas.toDataURL()
    console.log(data)
    this.history.add(data)
  }

  /**
   * 后退
   */
  undo() {
    const img = new Image()
    img.src = this.history.undo() as string

    img.onload = () => {
      this.context.drawImage(img, 0, 0)
    }
  }

  /**
   * 前进
   */
  redo() {
    console.log('redo')
  }
}
