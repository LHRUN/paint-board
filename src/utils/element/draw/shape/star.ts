import { fabric } from 'fabric'
import { getRandomInt } from '@/utils/common/index'
import { generateRandomCoordinates } from './util'
import useDrawStore from '@/store/draw'

export function drawStar(point: fabric.Point, size: number) {
  if (useDrawStore.getState().drawShapeCount === 1) {
    const star = drawItemStar(size)
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
      const star = drawItemStar(size)
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

function drawItemStar(size: number) {
  const height = getRandomInt(size, size * 2) * 2
  // 计算五角星的顶点坐标
  const width = height * (9 / 10) // 假设五角星的宽度是高度的9/10
  const centerX = width / 2
  const centerY = height / 2
  const angle = Math.PI / 5 // 五角星的角度

  const points = []
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? width / 2 : width / 4 // 交替使用两种半径
    const x = centerX + radius * Math.cos(i * angle)
    const y = centerY + radius * Math.sin(i * angle)
    points.push({ x: x, y: y })
  }

  // 创建五角星
  const star = new fabric.Polygon(points, {
    opacity: Math.random()
  })

  return star
}
