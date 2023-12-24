export function generateRandomCoordinates(
  centerX: number,
  centerY: number,
  size: number,
  count: number
) {
  const halfSize = size / 2 // 因为是中心，所以取半
  const points = []

  for (let i = 0; i < count; i++) {
    // Math.random() 返回 [0, 1) 的随机数
    // 通过它来随机生成矩形内的坐标点
    const randomX = Math.floor(centerX - halfSize + Math.random() * size)
    const randomY = Math.floor(centerY - halfSize + Math.random() * size)
    points.push({ x: randomX, y: randomY })
  }

  return points
}
