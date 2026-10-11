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
