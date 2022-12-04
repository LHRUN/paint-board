import { MousePosition } from '@/types'

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
  /**
   * 1. 计算三点之间的直线距离
   * 2. 计算三角形半周长
   * 3. 通过海伦公式求面积
   * 4. 根据面积公式求三角形的高
   */
  const A = Math.abs(getDistance(pos, startPos))
  const B = Math.abs(getDistance(pos, endPos))
  const C = Math.abs(getDistance(startPos, endPos))

  const P = (A + B + C) / 2
  const area = Math.abs(Math.sqrt(P * (P - A) * (P - B) * (P - C)))
  const distance = (2 * area) / C
  return distance
}

/**
 * 绘制矩形
 */
export const drawRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill = false // 是否填充
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

/**
 * 获取数组元素，未传坐标时返回最后一个元素
 * @param arr 数组
 * @param n 坐标
 */
export const at = <T>(arr: T[], n?: number) => {
  n = n ?? arr.length - 1
  if (n < 0 || n >= arr.length) return undefined
  return arr[n]
}

/**
 * 比较版本号
 * @param v1
 * @param v2
 * @returns 0: v1 === v2; 1: v1 > v2; -1: v1 < v2
 */
export const compareVersion = (v1: string, v2: string) => {
  const v1s = v1.split('.')
  const v2s = v2.split('.')
  const len = Math.max(v1s.length, v2s.length)

  while (v1s.length < len) {
    v1s.push('0')
  }
  while (v2s.length < len) {
    v1s.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1s[i])
    const num2 = parseInt(v2s[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}
