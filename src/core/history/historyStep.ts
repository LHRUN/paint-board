export const HISTORY_LIMIT = 50

export const appendHistoryStep = <T>(
  diffs: T[],
  index: number,
  delta: T | undefined,
  limit = HISTORY_LIMIT
) => {
  if (!delta) {
    return { diffs, index, changed: false }
  }

  const nextDiffs = diffs.slice(0, index)
  nextDiffs.push(delta)
  if (nextDiffs.length > limit) {
    nextDiffs.shift()
    return { diffs: nextDiffs, index, changed: true }
  }
  return { diffs: nextDiffs, index: index + 1, changed: true }
}
