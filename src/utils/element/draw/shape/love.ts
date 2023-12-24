import { fabric } from 'fabric'
import { getRandomInt } from '@/utils/common/index'
import { generateRandomCoordinates } from './util'
import useDrawStore from '@/store/draw'

export function drawLove(point: fabric.Point, size: number) {
  if (useDrawStore.getState().drawShapeCount === 1) {
    const star = drawLoveItem(size)
    star.set({
      left: point.x - size,
      top: point.y - size,
      fill: useDrawStore.getState().drawColors[0]
    })
    return star
  } else {
    const points = generateRandomCoordinates(
      point?.x,
      point?.y,
      size * 3,
      useDrawStore.getState().drawShapeCount
    )
    const stars = points.map((item, index) => {
      const color =
        index > useDrawStore.getState().drawColors.length - 1
          ? useDrawStore.getState().drawColors[0]
          : useDrawStore.getState().drawColors[index]
      const star = drawLoveItem(size)
      star.set({
        left: item.x,
        top: item.y,
        fill: color
      })
      return star
    })
    const group = new fabric.Group(stars)
    return group
  }
}

function drawLoveItem(size: number) {
  const maxSize = getRandomInt(size * 1.5, size * 3)
  const path = `M20.808,11.079C19.829,16.132,12,20.5,12,20.5s-7.829-4.368-8.808-9.421C2.227,6.1,5.066,3.5,8,3.5a4.444,4.444,0,0,1,4,2,4.444,4.444,0,0,1,4-2C18.934,3.5,21.773,6.1,20.808,11.079Z`
  const loveShape = new fabric.Path(path, {
    opacity: Math.random()
  })
  // 获取形状的未缩放边界
  const boundingRect = loveShape.getBoundingRect()

  // 计算缩放因子
  const scaleX = maxSize / boundingRect.width
  const scaleY = maxSize / boundingRect.height
  const scaleToFit = Math.min(scaleX, scaleY)

  // 应用缩放因子
  loveShape.scale(scaleToFit)
  return loveShape
}
