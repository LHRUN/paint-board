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
