import { fabric } from 'fabric'
import { getRandomInt } from '@/utils/common/index'
import { generateRandomCoordinates } from './util'
import useDrawStore from '@/store/draw'

export function drawBubble(point: fabric.Point, size: number) {
  if (useDrawStore.getState().drawShapeCount === 1) {
    const radius = getRandomInt(size * 0.3, size * 1)
    const left = point?.x - radius
    const top = point?.y - radius
    const circle = new fabric.Circle({
      left,
      top,
      radius,
      opacity: Math.random(),
      fill: useDrawStore.getState().drawColors[0]
    })
    return circle
  }

  const points = generateRandomCoordinates(
    point?.x,
    point?.y,
    size * 3,
    useDrawStore.getState().drawShapeCount
  )
  const circles = points.map((item, index) => {
    const radius = getRandomInt(size * 0.3, size)
    const color =
      index > useDrawStore.getState().drawColors.length - 1
        ? useDrawStore.getState().drawColors[0]
        : useDrawStore.getState().drawColors[index]
    return new fabric.Circle({
      left: item.x,
      top: item.y,
      radius,
      opacity: Math.random(),
      fill: color
    })
  })
  const group = new fabric.Group(circles)
  return group
}
