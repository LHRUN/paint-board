/**
 * A Lucide icon is added only after SVG parsing finishes.
 * A click, file switch, or disposed canvas that happened during the wait must not add it.
 */
export const shouldAttachGraph = (input: {
  cancelled: boolean
  canvasMatches: boolean
  generationMatches: boolean
  historyApplying: boolean
}) =>
  input.canvasMatches &&
  input.generationMatches &&
  !input.cancelled &&
  !input.historyApplying
