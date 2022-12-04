import { MousePosition } from '@/types'
import { CanvasElement } from './element'
import { CANVAS_ELE_TYPE } from '../constants'

/**
 * 橡皮擦
 */
export class Eraser extends CanvasElement {
  // 鼠标移动位置记录
  positions: MousePosition[]
  // 当前橡皮擦宽度
  cleanWidth: number

  constructor(width: number, layer: number) {
    super(CANVAS_ELE_TYPE.ERASER, layer)
    this.positions = []
    this.cleanWidth = width
  }

  /**
   * 添加位置记录
   * @param position
   */
  addPosition(position: MousePosition) {
    this.positions.push(position)
  }
}

/**
 * 橡皮擦渲染
 * @param context canvas二维渲染上下文
 * @param cleanCanvas 清除画板
 * @param instance Eraser
 */
export const eraserRender = (
  context: CanvasRenderingContext2D,
  cleanCanvas: () => void,
  instance: Eraser
) => {
  for (let i = 0; i < instance.positions.length - 1; i++) {
    _cleanLine(
      instance.positions[i],
      instance.positions[i + 1],
      context,
      cleanCanvas,
      instance.cleanWidth
    )
  }
}

/**
 * 线状清除
 * @param start 起点
 * @param end 终点
 * @param context canvas二维渲染上下文
 * @param cleanCanvas 清除画板
 * @param cleanWidth 清除宽度
 */
const _cleanLine = (
  start: MousePosition,
  end: MousePosition,
  context: CanvasRenderingContext2D,
  cleanCanvas: () => void,
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
  cleanCanvas()
  context.restore()

  //清除矩形剪辑区域里的像素
  context.save()
  context.beginPath()
  context.moveTo(x3, y3)
  context.lineTo(x5, y5)
  context.lineTo(x6, y6)
  context.lineTo(x4, y4)
  // context.stroke()
  context.closePath()
  context.clip()
  cleanCanvas()
  context.restore()
}
