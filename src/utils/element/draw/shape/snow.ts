import { fabric } from 'fabric'
import { getRandomInt } from '@/utils/common/index'
import { generateRandomCoordinates } from './util'
import useDrawStore from '@/store/draw'

export function drawSnow(point: fabric.Point, size: number) {
  if (useDrawStore.getState().drawShapeCount === 1) {
    const snow = drawSnowItem(size)
    snow.set({
      left: point.x - size,
      top: point.y - size,
      stroke: useDrawStore.getState().drawColors[0],
      strokeWidth: 2
    })
    return snow
  } else {
    const points = generateRandomCoordinates(
      point?.x,
      point?.y,
      size * 3,
      useDrawStore.getState().drawShapeCount
    )
    const snows = points.map((item, index) => {
      const color =
        index > useDrawStore.getState().drawColors.length - 1
          ? useDrawStore.getState().drawColors[0]
          : useDrawStore.getState().drawColors[index]
      const snow = drawSnowItem(size)
      snow.set({
        left: item.x,
        top: item.y,
        stroke: color,
        strokeWidth: 2
      })
      return snow
    })
    const group = new fabric.Group(snows)
    return group
  }
}

function drawSnowItem(size: number) {
  const maxSize = getRandomInt(size * 1.5, size * 3)
  const path = `M11.9994 3V7M11.9994 7V17M11.9994 7L8.99943 4M11.9994 7L14.9994 4M11.9994 17V21M11.9994 17L8.99943 20M11.9994 17L14.9994 20M4.20624 7.49999L7.67034 9.49999M7.67034 9.49999L16.3306 14.5M7.67034 9.49999L3.57227 10.5981M7.67034 9.49999L6.57227 5.40191M16.3306 14.5L19.7947 16.5M16.3306 14.5L17.4287 18.5981M16.3306 14.5L20.4287 13.4019M4.2067 16.5L7.6708 14.5M7.6708 14.5L16.3311 9.49999M7.6708 14.5L3.57273 13.4019M7.6708 14.5L6.57273 18.5981M16.3311 9.49999L19.7952 7.49999M16.3311 9.49999L17.4291 5.40192M16.3311 9.49999L20.4291 10.5981`
  const shape = new fabric.Path(path, {
    opacity: Math.random()
  })
  const boundingRect = shape.getBoundingRect()

  const scaleX = maxSize / boundingRect.width
  const scaleY = maxSize / boundingRect.height
  const scaleToFit = Math.min(scaleX, scaleY)

  shape.scale(scaleToFit)
  return shape
}
