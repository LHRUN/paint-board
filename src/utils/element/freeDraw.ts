import { getDistance, getRandomInt } from '../common'
import {
  CANVAS_ELE_TYPE,
  RECT_MIN_SIZE,
  RESIZE_TYPE,
  sprayPoint
} from '../constants'
import { ElementRect, MousePosition } from '@/types'
import { CanvasElement } from './element'

export interface FreeDrawRect extends ElementRect {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export enum FreeDrawStyle {
  Basic = 'basic', // 基础线条
  Shadow = 'shadow', // 带阴影的荧光线条
  MultiColor = 'multiColor', // 双色线条
  Spray = 'spray', // 喷雾
  Crayon = 'crayon', // 蜡笔
  Bubble = 'bubble' // 泡泡
}

/**
 * 自由画笔
 */
export class FreeDraw extends CanvasElement {
  // 鼠标移动位置记录
  positions: MousePosition[]
  // 当前绘线颜色
  colors = ['#000000']
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
  // 当前画笔的矩形属性
  rect: FreeDrawRect = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity
  }
  circles?: {
    radius: number
    opacity: number
  }[]
  style: FreeDrawStyle // 画笔模式

  constructor(
    colors: string[],
    width: number,
    layer: number,
    style = FreeDrawStyle.Basic
  ) {
    super(CANVAS_ELE_TYPE.FREE_DRAW, layer)
    this.positions = []
    this.lineWidths = [0]
    this.colors = colors
    this.maxWidth = width
    this.minWidth = width / 2
    this.lastLineWidth = width
    this.style = style
    if (this.style === FreeDrawStyle.Bubble) {
      this.circles = []
    }
  }

  /**
   * 添加位置记录
   * @param position
   */
  addPosition(position: MousePosition) {
    this.positions.push(position)
    updateRect(this, position)
    if (this.style === FreeDrawStyle.Bubble && this.circles) {
      this.circles.push({
        radius: getRandomInt(10, 30),
        opacity: Math.random()
      })
    }

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
 * @param instance FreeDraw
 */
export const freeDrawRender = (
  context: CanvasRenderingContext2D,
  instance: FreeDraw
) => {
  context.save()
  context.lineCap = 'round'
  context.lineJoin = 'round'
  switch (instance.style) {
    case FreeDrawStyle.Basic:
      context.strokeStyle = instance.colors[0]
      break
    case FreeDrawStyle.Shadow:
      context.shadowColor = instance.colors[0]
      context.strokeStyle = instance.colors[0]
      break
    case FreeDrawStyle.Bubble:
    case FreeDrawStyle.Spray:
      context.fillStyle = instance.colors[0]
      break
    case FreeDrawStyle.MultiColor:
      context.strokeStyle = getMultiColorPattern(instance.colors)
      break
    case FreeDrawStyle.Crayon:
      context.strokeStyle = getCrayonPattern(instance.colors[0])
      break
    default:
      break
  }

  for (let i = 1; i < instance.positions.length; i++) {
    switch (instance.style) {
      case FreeDrawStyle.MultiColor:
      case FreeDrawStyle.Crayon:
      case FreeDrawStyle.Basic:
        _drawBasic(instance, i, context)
        break
      case FreeDrawStyle.Shadow:
        _drawShadow(instance, i, context)
        break
      case FreeDrawStyle.Spray:
        _drawSpray(instance, i, context)
        break
      case FreeDrawStyle.Bubble:
        _drawBubble(instance, i, context)
        break
      default:
        break
    }
  }
  context.restore()
}

/**
 * 绘制基础线条
 * @param instance FreeDraw 实例
 * @param i 下标
 * @param context canvas二维渲染上下文
 */
const _drawBasic = (
  instance: FreeDraw,
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

/**
 * 绘制带阴影的荧光线条
 * @param instance FreeDraw 实例
 * @param i 下标
 * @param context canvas二维渲染上下文
 */
const _drawShadow = (
  instance: FreeDraw,
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
  context.shadowBlur = lineWidths[i]
  context.stroke()
}

/**
 * 绘制喷雾
 * @param instance FreeDraw 实例
 * @param i 下标
 * @param context canvas二维渲染上下文
 */
const _drawSpray = (
  instance: FreeDraw,
  i: number,
  context: CanvasRenderingContext2D
) => {
  const { x, y } = instance.positions[i]
  for (let j = 0; j < 50; j++) {
    const { angle, radius, alpha } = sprayPoint[i % 5][j]
    context.globalAlpha = alpha
    context.fillRect(
      x + radius * Math.cos(angle),
      y + radius * Math.sin(angle),
      2,
      2
    )
  }
}

/**
 * 绘制泡泡
 * @param instance FreeDraw 实例
 * @param i 下标
 * @param context canvas二维渲染上下文
 */
const _drawBubble = (
  instance: FreeDraw,
  i: number,
  context: CanvasRenderingContext2D
) => {
  context.beginPath()
  if (instance.circles) {
    const { x, y } = instance.positions[i]
    context.globalAlpha = instance.circles[i].opacity
    context.arc(x, y, instance.circles[i].radius, 0, Math.PI * 2, false)
    context.fill()
  }
}

/**
 * 更新位置
 * @param distanceX
 * @param distanceY
 */
export const moveFreeDraw = (
  instance: FreeDraw,
  distanceX: number,
  distanceY: number
) => {
  initRect(instance)
  instance.positions.forEach((position) => {
    position.x += distanceX
    position.y += distanceY
    updateRect(instance, position)
  })
}

/**
 * 缩放绘画
 * @param instance
 * @param scaleX
 * @param scaleY
 * @param rect
 * @param resizeType
 */
export const resizeFreeDraw = (
  instance: FreeDraw,
  scaleX: number,
  scaleY: number,
  rect: FreeDrawRect,
  resizeType: string
) => {
  // 没有做反向移动处理，所以在宽度和高度小到一定程度就禁止缩小
  if (
    (instance.rect.width <= RECT_MIN_SIZE && scaleX < 1) ||
    (instance.rect.height <= RECT_MIN_SIZE && scaleY < 1)
  ) {
    return
  }
  initRect(instance)
  instance.positions.forEach((position) => {
    position.x = position.x * scaleX
    position.y = position.y * scaleY
    updateRect(instance, position)
  })
  const { x: newX, y: newY, width: newWidth, height: newHeight } = instance.rect
  let offsetX = 0
  let offsetY = 0
  switch (resizeType) {
    case RESIZE_TYPE.BOTTOM_RIGHT:
      offsetX = newX - rect.x
      offsetY = newY - rect.y
      break
    case RESIZE_TYPE.BOTTOM_LEFT:
      offsetX = newX + newWidth - (rect.x + rect.width)
      offsetY = newY - rect.y
      break
    case RESIZE_TYPE.TOP_LEFT:
      offsetX = newX + newWidth - (rect.x + rect.width)
      offsetY = newY + newHeight - (rect.y + rect.height)
      break
    case RESIZE_TYPE.TOP_RIGHT:
      offsetX = newX - rect.x
      offsetY = newY + newHeight - (rect.y + rect.height)
      break
    default:
      break
  }
  initRect(instance)
  instance.positions.forEach((position) => {
    position.x = position.x - offsetX
    position.y = position.y - offsetY
    updateRect(instance, position)
  })
}

/**
 * 初始化矩形属性
 * @param instance
 */
export const initRect = (instance: FreeDraw) => {
  instance.rect = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity
  }
}

/**
 * 计算矩形属性
 * @param instance
 * @param position
 * @returns
 */
export const updateRect = (instance: FreeDraw, position: MousePosition) => {
  const { x, y } = position
  let { minX, maxX, minY, maxY } = instance.rect
  if (x < minX) {
    minX = x
  }
  if (x > maxX) {
    maxX = x
  }
  if (y < minY) {
    minY = y
  }
  if (y > maxY) {
    maxY = y
  }
  const rect = {
    minX,
    maxX,
    minY,
    maxY,
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  }
  instance.rect = rect
  return rect
}

/**
 * 获取多色图案
 * @param colors 多色数组
 */
const getMultiColorPattern = (colors: string[]) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D

  canvas.width = 5 * colors.length
  canvas.height = 20
  colors.forEach((color, i) => {
    context.fillStyle = color
    context.fillRect(5 * i, 0, 5, 20)
  })
  return context.createPattern(canvas, 'repeat') as CanvasPattern
}

const getCrayonPattern = (color: string) => {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  context.globalAlpha = 0.5
  canvas.width = 10
  canvas.height = 10
  context.fillStyle = color
  context.fillRect(0, 0, 10, 10)

  const img = new Image()
  img.src = '/pattern/crayon.png'
  context.drawImage(img, 0, 0, 10, 10)

  return context.createPattern(canvas, 'repeat') as CanvasPattern
}
