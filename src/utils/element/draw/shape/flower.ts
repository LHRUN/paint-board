import { fabric } from 'fabric'
import { getRandomInt } from '@/utils/common/index'
import { generateRandomCoordinates } from './util'
import useDrawStore from '@/store/draw'

export function drawFlower(point: fabric.Point, size: number) {
  if (useDrawStore.getState().drawShapeCount === 1) {
    const flower = drawFlowerItem(size)
    flower.set({
      left: point.x - size,
      top: point.y - size,
      fill: useDrawStore.getState().drawColors[0]
    })
    return flower
  } else {
    const points = generateRandomCoordinates(
      point?.x,
      point?.y,
      size * 3,
      useDrawStore.getState().drawShapeCount
    )
    const flowers = points.map((item, index) => {
      const color =
        index > useDrawStore.getState().drawColors.length - 1
          ? useDrawStore.getState().drawColors[0]
          : useDrawStore.getState().drawColors[index]
      const flower = drawFlowerItem(size)
      flower.set({
        left: item.x,
        top: item.y,
        fill: color
      })
      return flower
    })
    const group = new fabric.Group(flowers)
    return group
  }
}

function drawFlowerItem(size: number) {
  const maxSize = getRandomInt(size * 1.5, size * 3)
  const path = `M512,224.438c0-63.766-51.703-115.469-115.484-115.469c-8.781,0-17.328,1-25.531,2.859 C365.656,52.984,316.219,6.875,256,6.875c-60.234,0-109.672,46.109-114.984,104.953c-8.219-1.859-16.766-2.859-25.531-2.859 C51.703,108.969,0,160.672,0,224.438c0,47.594,28.797,88.469,69.906,106.141c-10.297,17.281-16.234,37.484-16.234,59.063 c0,63.766,51.703,115.484,115.484,115.484c34.625,0,65.672-15.266,86.844-39.406c21.156,24.141,52.219,39.406,86.844,39.406 c63.781,0,115.484-51.719,115.484-115.484c0-21.578-5.938-41.781-16.25-59.063C483.203,312.906,512,272.031,512,224.438z M256,372.531c-53.563,0-97-43.406-97-97c0-53.563,43.438-96.984,97-96.984s96.984,43.422,96.984,96.984 C352.984,329.125,309.563,372.531,256,372.531z`
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
