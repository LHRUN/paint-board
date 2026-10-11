export type BoardLoadFollowup = 'commit' | 'ignore' | 'drop' | 'wait' | 'replay'

/**
 * What to do after Fabric finishes one loadFromJSON.
 * Fabric clears the canvas and inserts that load's objects before the callback,
 * and a second load of an in-flight job would clear the canvas again.
 */
export const followupAfterBoardLoad = (input: {
  callbackIsLatest: boolean
  callbackCanvasMatches: boolean
  latestAvailable: boolean
  latestRunning: boolean
  latestSettled: boolean
}): BoardLoadFollowup => {
  if (!input.callbackCanvasMatches) {
    return 'drop'
  }
  if (!input.callbackIsLatest) {
    if (!input.latestAvailable) {
      return 'drop'
    }
    if (input.latestRunning) {
      return 'wait'
    }
    return 'replay'
  }
  return input.latestSettled ? 'ignore' : 'commit'
}
