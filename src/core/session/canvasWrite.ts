export const isCurrentCanvasLoad = (
  generation: number,
  activeGeneration: number,
  requestFileId: string,
  currentFileId: string
) => generation === activeGeneration && requestFileId === currentFileId

export const canWriteFile = (
  canvasFileId: string | null,
  fileId: string | null | undefined
): fileId is string =>
  typeof fileId === 'string' && fileId.length > 0 && canvasFileId === fileId

/**
 * An image or background chosen on one file must not land on another file,
 * and must not be inserted while an undo/redo is still replacing the canvas.
 */
export const shouldCommitDeferredCanvasWrite = (input: {
  canvasMatches: boolean
  generationMatches: boolean
  canWrite: boolean
  historyApplying: boolean
}) =>
  input.canvasMatches &&
  input.generationMatches &&
  input.canWrite &&
  !input.historyApplying
