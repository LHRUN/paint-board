import useDrawStore from '@/store/draw'
import { DrawLineType } from '@/constants/drawLineType'
import { paintBoard } from '@/core/paintBoard'

/**
 * return fabric.js BaseBrush strokeDashArray
 */
export const getStrokeDashArray = (): fabric.BaseBrush['strokeDashArray'] => {
  const { lineType, drawWidth } = useDrawStore.getState()
  const zoom = paintBoard.canvas?.getZoom() ?? 1

  switch (lineType) {
    case DrawLineType.Dashed:
      return [(drawWidth / zoom) * 3, (drawWidth / zoom) * 2]
    case DrawLineType.Dotted:
      return [(drawWidth / zoom) * 0.5, (drawWidth / zoom) * 1.25]
    default:
      return undefined as unknown as any[]
  }
}

/**
 * generate random coordinates
 * @param centerX center point x
 * @param centerY center point y
 * @param size area sice
 * @param count generate count
 * @returns random points
 */
export function generateRandomCoordinates(
  centerX: number,
  centerY: number,
  size: number,
  count: number
) {
  // Because it's the center, take half
  const halfSize = size / 2
  const points = []

  for (let i = 0; i < count; i++) {
    const randomX = Math.floor(centerX - halfSize + Math.random() * size)
    const randomY = Math.floor(centerY - halfSize + Math.random() * size)
    points.push({ x: randomX, y: randomY })
  }

  return points
}
