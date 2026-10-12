import cloneDeep from 'lodash-es/cloneDeep'
import { patch, unpatch, Delta } from 'jsondiffpatch'

/**
 * A save that arrives while undo/redo is still loading would diff the old
 * canvas against the snapshot that has already moved.
 */
export const shouldRecordHistorySave = (applyInFlight: boolean) =>
  !applyInFlight

/**
 * Move the history cursor and snapshot together.
 * The canvas JSON is applied later, so the next undo/redo must not patch the
 * snapshot from before this step.
 */
export const nextHistorySnapshot = <T extends object>(input: {
  diffs: Array<Delta | undefined>
  index: number
  canvasData: T
  direction: 'undo' | 'redo'
}): { index: number; canvasData: T } | null => {
  if (input.direction === 'undo') {
    if (input.index <= 0) {
      return null
    }
    const delta = input.diffs[input.index - 1]
    if (!delta) {
      return null
    }
    return {
      index: input.index - 1,
      canvasData: patch(cloneDeep(input.canvasData), delta) as T
    }
  }

  if (input.index >= input.diffs.length) {
    return null
  }
  const delta = input.diffs[input.index]
  if (!delta) {
    return null
  }
  return {
    index: input.index + 1,
    canvasData: unpatch(cloneDeep(input.canvasData), delta) as T
  }
}
