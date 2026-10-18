export type BoardTitleIssue = 'empty' | 'duplicate'

/**
 * New and edited titles must be unique after trimming both sides.
 * A board may keep its stored title unchanged, even when older data already
 * contains the same name. Trimming a spaced title still counts as a rename.
 */
export const boardTitleIssue = (
  title: string,
  existingTitles: string[],
  currentTitle?: string
): BoardTitleIssue | null => {
  const name = title.trim()
  if (!name) {
    return 'empty'
  }
  if (currentTitle !== undefined && name === currentTitle) {
    return null
  }
  const others = [...existingTitles]
  if (currentTitle !== undefined) {
    const ownIndex = others.indexOf(currentTitle)
    if (ownIndex >= 0) {
      others.splice(ownIndex, 1)
    }
  }
  if (others.some((item) => item.trim() === name)) {
    return 'duplicate'
  }
  return null
}

/**
 * Delete every selected board, but never the last one.
 * Selecting every board keeps the current board.
 */
export const idsToDelete = (
  files: Array<{ id: string }>,
  selectedIds: string[],
  currentId: string
) => {
  const ids = files.map((file) => file.id)
  const alive = new Set(ids)
  const chosen = [...new Set(selectedIds)].filter((id) => alive.has(id))
  if (chosen.length === 0 || ids.length === 0) {
    return []
  }
  if (chosen.length < ids.length) {
    return chosen
  }
  const keep = alive.has(currentId) ? currentId : ids[0]
  return chosen.filter((id) => id !== keep)
}
