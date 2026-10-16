/**
 * The group button is shown only while two or more objects are selected.
 */
export const canGroupActiveObjects = (count: number) => count >= 2

/**
 * Slot left after the selected objects leave the stack.
 * The group keeps the place of the front-most selected object.
 */
export const groupInsertIndex = (indexes: number[]) => {
  if (indexes.length < 2) {
    return null
  }
  if (
    indexes.some((index) => !Number.isInteger(index) || index < 0) ||
    new Set(indexes).size !== indexes.length
  ) {
    return null
  }
  return Math.max(...indexes) - indexes.length + 1
}
