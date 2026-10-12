import { describe, expect, it } from 'vitest'
import { diff } from 'jsondiffpatch'
import { nextHistorySnapshot, shouldRecordHistorySave } from './historyMove'

describe('nextHistorySnapshot', () => {
  const build = () => {
    const states = [{ objects: [] as Array<{ fill: number }> }]
    const diffs = []
    for (let step = 1; step <= 5; step++) {
      const next = { objects: [{ fill: step }] }
      diffs.push(diff(next, states[states.length - 1]))
      states.push(next)
    }
    return { states, diffs }
  }

  it('chains two undos from the updated snapshot', () => {
    const { states, diffs } = build()
    const first = nextHistorySnapshot({
      diffs,
      index: 5,
      canvasData: states[5],
      direction: 'undo'
    })
    const second = nextHistorySnapshot({
      diffs,
      index: first?.index ?? 0,
      canvasData: first?.canvasData ?? states[5],
      direction: 'undo'
    })

    expect(first?.canvasData).toEqual(states[4])
    expect(second?.index).toBe(3)
    expect(second?.canvasData).toEqual(states[3])
  })

  it('redoes back to the step that was undone', () => {
    const { states, diffs } = build()
    const undone = nextHistorySnapshot({
      diffs,
      index: 5,
      canvasData: states[5],
      direction: 'undo'
    })
    const redone = nextHistorySnapshot({
      diffs,
      index: undone?.index ?? 0,
      canvasData: undone?.canvasData ?? states[5],
      direction: 'redo'
    })

    expect(redone).toEqual({ index: 5, canvasData: states[5] })
  })

  it('does not record a save while a step is still loading', () => {
    expect(shouldRecordHistorySave(false)).toBe(true)
    expect(shouldRecordHistorySave(true)).toBe(false)
  })

  it('does nothing at the ends of the stack', () => {
    const { states, diffs } = build()
    expect(
      nextHistorySnapshot({
        diffs,
        index: 0,
        canvasData: states[0],
        direction: 'undo'
      })
    ).toBeNull()
    expect(
      nextHistorySnapshot({
        diffs,
        index: diffs.length,
        canvasData: states[5],
        direction: 'redo'
      })
    ).toBeNull()
  })
})
