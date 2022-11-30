import { ElementRect, MousePosition } from '@/types'
import { RESIZE_TYPE } from './constants'

/**
 * 计算两点之间的距离
 * @param start 起点
 * @param end 终点
 * @returns 距离
 */
export const getDistance = (start: MousePosition, end: MousePosition) => {
  return Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2))
}

/**
 * 获取鼠标坐标距离线段距离
 * @param pos 鼠标坐标
 * @param startPos 线段起点
 * @param endPos 线段终点
 * @returns 距离
 */
export const getPositionToLineDistance = (
  pos: MousePosition,
  startPos: MousePosition,
  endPos: MousePosition
) => {
  const A = Math.abs(
    Math.sqrt(Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2))
  )
  const B = Math.abs(
    Math.sqrt(Math.pow(pos.x - endPos.x, 2) + Math.pow(pos.y - endPos.y, 2))
  )
  const C = Math.abs(
    Math.sqrt(
      Math.pow(startPos.x - endPos.x, 2) + Math.pow(startPos.y - endPos.y, 2)
    )
  )
  // https://blog.csdn.net/wzp20092009/article/details/124683083
  //利用海伦公式计算三角形面积
  //周长的一半
  const P = (A + B + C) / 2
  const allArea = Math.abs(Math.sqrt(P * (P - A) * (P - B) * (P - C)))
  //普通公式计算三角形面积反推点到线的垂直距离
  const dis = (2 * allArea) / C
  return dis
}

/**
 * 获取两点距离
 * @param startPos
 * @param endPos
 * @returns 距离
 */
export const getTowPointDistance = (
  startPos: MousePosition,
  endPos: MousePosition
) => {
  return Math.sqrt(
    Math.pow(startPos.x - endPos.x, 2) + Math.pow(startPos.y - endPos.y, 2)
  )
}

/**
 * 绘制拖拽矩形
 */
export const drawResizeRect = (
  context: CanvasRenderingContext2D,
  rect: ElementRect
) => {
  const { x, y, width, height } = rect
  context.save()
  context.strokeStyle = '#65CC8A'
  context.setLineDash([5])
  context.lineWidth = 2
  context.lineCap = 'round'
  context.lineJoin = 'round'
  drawRect(context, x, y, width, height)
  context.fillStyle = '#65CC8A'
  drawRect(context, x - 10, y - 10, 10, 10, true)
  drawRect(context, x + width, y - 10, 10, 10, true)
  drawRect(context, x - 10, y + height, 10, 10, true)
  drawRect(context, x + width, y + height, 10, 10, true)
  context.restore()
}

/**
 * 绘制矩形
 */
const drawRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill = false
) => {
  context.beginPath()
  context.rect(x, y, width, height)
  if (fill) {
    context.fill()
  } else {
    context.stroke()
  }
}

/**
 * 获取调整大小类型
 * @param position
 * @param rect
 */
export const getResizeType = (position: MousePosition, rect: ElementRect) => {
  let resizeType = RESIZE_TYPE.NULL
  const { x, y } = position
  if (isInsideRect(position, rect)) {
    resizeType = RESIZE_TYPE.BODY
  } else if (rect.x > x && x > rect.x - 10) {
    if (rect.y > y && y > rect.y - 10) {
      resizeType = RESIZE_TYPE.TOP_LEFT
    } else if (rect.y + rect.height + 10 > y && y > rect.y + rect.height) {
      resizeType = RESIZE_TYPE.BOTTOM_LEFT
    }
  } else if (rect.x + rect.width + 10 > x && x > rect.x + rect.width) {
    if (rect.y > y && y > rect.y - 10) {
      resizeType = RESIZE_TYPE.TOP_RIGHT
    } else if (rect.y + rect.height + 10 > y && y > rect.y + rect.height) {
      resizeType = RESIZE_TYPE.BOTTOM_RIGHT
    }
  }
  return resizeType
}

/**
 * 判断是否在矩形内部
 * @param position
 * @param rect
 * @returns boolean
 */
export const isInsideRect = (
  position: MousePosition,
  rect: {
    x: number
    y: number
    width: number
    height: number
  }
) => {
  return (
    rect.x + rect.width > position.x &&
    position.x > rect.x &&
    rect.y + rect.height > position.y &&
    position.y > rect.y
  )
}

/**
 * 判断key是否存在于object
 * @param key
 * @param object
 * @returns boolean
 */
export const isValidKey = (
  key: string | number | symbol,
  object: object
): key is keyof typeof object => {
  return key in object
}

/**
 * 创建元素
 * @param elType 元素类型
 * @param styleObj 样式对象
 * @param parent 父级元素
 * @returns element
 */
export const createDocument = <T extends keyof HTMLElementTagNameMap>(
  elType: T,
  styleObj: Record<string, string | number> = {},
  parent: HTMLElement | DocumentFragment = document.body
): HTMLElementTagNameMap[T] => {
  const el = document.createElement(elType)
  Object.keys(styleObj).forEach((key) => {
    if (isValidKey(key, styleObj)) {
      Reflect.set(el.style, key, styleObj[key])
    }
  })
  parent.appendChild(el)
  return el
}
