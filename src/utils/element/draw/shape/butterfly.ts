import { fabric } from 'fabric'
import { getRandomInt } from '@/utils/common/index'
import { generateRandomCoordinates } from './util'
import useDrawStore from '@/store/draw'

export function drawButterfly(point: fabric.Point, size: number) {
  if (useDrawStore.getState().drawShapeCount === 1) {
    const butterfly = drawButterflyItem(size)
    butterfly.set({
      left: point.x - size,
      top: point.y - size,
      fill: useDrawStore.getState().drawColors[0]
    })
    return butterfly
  } else {
    const points = generateRandomCoordinates(
      point?.x,
      point?.y,
      size * 3,
      useDrawStore.getState().drawShapeCount
    )
    const butterflys = points.map((item, index) => {
      const color =
        index > useDrawStore.getState().drawColors.length - 1
          ? useDrawStore.getState().drawColors[0]
          : useDrawStore.getState().drawColors[index]
      const butterfly = drawButterflyItem(size)
      butterfly.set({
        left: item.x,
        top: item.y,
        fill: color
      })
      return butterfly
    })
    const group = new fabric.Group(butterflys)
    return group
  }
}

function drawButterflyItem(size: number) {
  const maxSize = getRandomInt(size * 1.5, size * 3)
  const path = `M214.37 208H70.57c-31 0-57.37 14.9-67.26 45.33C1.57 258.71 0 265.54 0 272c0 48 96 128 144 128 28.95 0 53.24-10.67 75.72-33.14-8.58 11.05-13.81 23.47-15.72 37.28-6.98 49.25 1.73 83.2 27.23 91.48C255.99 503.66 288 512 304 512c48 0 53.35-109.18 26.33-144.39L214.37 208zm29.29-21.28L288.1 49.96C297.68 20.47 320 0 352 0c5.66 0 12.64.62 18.78 2.61 45.65 14.84 92.07 130.86 77.23 176.51-8.94 27.54-26.59 47.34-54.91 61.77 13.15-4.74 26.59-5.88 40.31-3.42 49 8.58 78.59 27.35 78.59 54.16 0 26.04-1.96 59.05-6.91 74.27-14.83 45.65-120.32 17.01-145.46-19.58l-115.97-159.6z`
  const butterflyShape = new fabric.Path(path, {
    opacity: Math.random()
  })

  const boundingRect = butterflyShape.getBoundingRect()

  const scaleX = maxSize / boundingRect.width
  const scaleY = maxSize / boundingRect.height
  const scaleToFit = Math.min(scaleX, scaleY)

  butterflyShape.scale(scaleToFit)
  return butterflyShape
}
