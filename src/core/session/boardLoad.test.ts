import { describe, expect, it } from 'vitest'
import { followupAfterBoardLoad } from './boardLoad'

describe('followupAfterBoardLoad', () => {
  const latest = {
    callbackCanvasMatches: true,
    latestAvailable: true,
    latestRunning: false,
    latestSettled: false
  }

  it('commits the newest load once', () => {
    expect(
      followupAfterBoardLoad({
        ...latest,
        callbackIsLatest: true
      })
    ).toBe('commit')
  })

  it('ignores a second callback for a load that already committed', () => {
    expect(
      followupAfterBoardLoad({
        ...latest,
        callbackIsLatest: true,
        latestSettled: true
      })
    ).toBe('ignore')
  })

  it('does not start another load while the newest one is still applying', () => {
    expect(
      followupAfterBoardLoad({
        ...latest,
        callbackIsLatest: false,
        latestRunning: true
      })
    ).toBe('wait')
  })

  it('replays a committed load after an older load replaces the canvas', () => {
    expect(
      followupAfterBoardLoad({
        ...latest,
        callbackIsLatest: false,
        latestSettled: true
      })
    ).toBe('replay')
  })

  it('drops a callback whose canvas was disposed instead of painting onto a new one', () => {
    expect(
      followupAfterBoardLoad({
        ...latest,
        callbackIsLatest: false,
        callbackCanvasMatches: false,
        latestSettled: true
      })
    ).toBe('drop')
  })
})
