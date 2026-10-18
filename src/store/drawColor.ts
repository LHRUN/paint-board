export const reindexDrawColorSelection = (
  drawColors: string[],
  deleteIndex: number,
  currentDrawColor: number,
  currentMultiColor: number[]
) => {
  if (deleteIndex < 0 || deleteIndex >= drawColors.length) {
    return null
  }
  if (drawColors.length <= 1) {
    return null
  }

  const nextColors = drawColors.filter((_, index) => index !== deleteIndex)
  const nextMulti = currentMultiColor
    .filter((index) => index !== deleteIndex)
    .map((index) => (index > deleteIndex ? index - 1 : index))

  let nextCurrent = currentDrawColor
  if (currentDrawColor === deleteIndex) {
    nextCurrent = 0
  } else if (currentDrawColor > deleteIndex) {
    nextCurrent -= 1
  }
  if (nextCurrent < 0 || nextCurrent >= nextColors.length) {
    nextCurrent = 0
  }

  return {
    drawColors: nextColors,
    currentDrawColor: nextCurrent,
    currentMultiColor: nextMulti.length > 0 ? nextMulti : [0]
  }
}
