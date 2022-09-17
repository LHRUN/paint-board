import { MousePosition } from '@/types'
import { scalePosition } from './index'
import { CANVAS_ELE_TYPE } from './constants'

/**
 * 橡皮擦
 */
export class CleanLine {
  // 鼠标移动位置记录
  positions: MousePosition[]
  type: string
  // 当前橡皮擦宽度
  cleanWidth: number
  scale: number

  constructor(width: number, scale: number) {
    this.positions = []
    this.type = CANVAS_ELE_TYPE.CLEAN_LINE
    this.cleanWidth = width
    this.scale = scale
  }

  addPosition(position: MousePosition) {
    this.positions.push(scalePosition(position, this.scale))
  }
}

/**
 * 橡皮擦渲染
 * @param context canvas二维渲染上下文
 * @param canvas
 * @param instance CleanLine实例
 */
export const cleanLineRender = (
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  instance: CleanLine
) => {
  for (let i = 0; i < instance.positions.length - 1; i++) {
    _cleanLine(
      instance.positions[i],
      instance.positions[i + 1],
      context,
      canvas,
      instance.cleanWidth
    )
  }
}

/**
 * 线性清除
 * @param start 起点
 * @param end 终点
 * @param context canvas二维渲染上下文
 * @param canvas
 * @param cleanWidth 清楚宽度
 */
const _cleanLine = (
  start: MousePosition,
  end: MousePosition,
  context: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  cleanWidth: number
) => {
  const { x: x1, y: y1 } = start
  const { x: x2, y: y2 } = end

  //获取两个点之间的剪辑区域四个端点
  const asin = cleanWidth * Math.sin(Math.atan((y2 - y1) / (x2 - x1)))
  const acos = cleanWidth * Math.cos(Math.atan((y2 - y1) / (x2 - x1)))
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
  context.arc(x2, y2, cleanWidth, 0, 2 * Math.PI)
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
