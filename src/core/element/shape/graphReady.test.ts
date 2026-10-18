import { describe, expect, it } from 'vitest'
import { shouldAttachGraph } from './graphReady'

describe('shouldAttachGraph', () => {
  const ready = {
    cancelled: false,
    canvasMatches: true,
    generationMatches: true,
    historyApplying: false
  }

  it('attaches when the gesture is still current', () => {
    expect(shouldAttachGraph(ready)).toBe(true)
  })

  it('drops a click that cancelled the gesture', () => {
    expect(shouldAttachGraph({ ...ready, cancelled: true })).toBe(false)
  })

  it('drops a gesture whose canvas was replaced', () => {
    expect(shouldAttachGraph({ ...ready, canvasMatches: false })).toBe(false)
    expect(shouldAttachGraph({ ...ready, generationMatches: false })).toBe(
      false
    )
  })

  it('drops a gesture that finished while undo or redo is loading', () => {
    expect(shouldAttachGraph({ ...ready, historyApplying: true })).toBe(false)
  })
})
