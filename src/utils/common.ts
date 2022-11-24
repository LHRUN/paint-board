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
  //利用海伦公式计算三角形面积
  //周长的一半
  const P = (A + B + C) / 2
  const allArea = Math.abs(Math.sqrt(P * (P - A) * (P - B) * (P - C)))
  //普通公式计算三角形面积反推点到线的垂直距离
  const dis = (2 * allArea) / C
  return dis
}

export const dragRender = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  context.save()
  context.setLineDash([5])
  drawRect(context, x, y, width, height)
  context.restore()
  drawRect(context, x - 5, y - 5, 10, 10)
  drawRect(context, x + width - 5, y - 5, 10, 10)
  drawRect(context, x - 5, y + height - 5, 10, 10)
  drawRect(context, x + width - 5, y + height - 5, 10, 10)
  context.restore()
}

const drawRect = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  context.beginPath()
  context.rect(x, y, width, height)
  context.stroke()
}
