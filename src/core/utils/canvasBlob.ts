export const supportsOffscreenPng = (offscreen?: {
  prototype?: { convertToBlob?: unknown }
}) => typeof offscreen?.prototype?.convertToBlob === 'function'

/**
 * Encode a canvas to PNG. Safari before 16.4 has no OffscreenCanvas.convertToBlob,
 * so those browsers draw into a normal canvas and use toBlob.
 */
export const canvasToPngBlob = async (
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  width: number,
  height: number
) => {
  if (
    typeof OffscreenCanvas !== 'undefined' &&
    supportsOffscreenPng(OffscreenCanvas)
  ) {
    const offscreen = new OffscreenCanvas(width, height)
    const context = offscreen.getContext('2d')
    if (!context) {
      throw new Error('No 2d context')
    }
    context.drawImage(
      source,
      0,
      0,
      sourceWidth,
      sourceHeight,
      0,
      0,
      width,
      height
    )
    return offscreen.convertToBlob({ type: 'image/png' })
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('No 2d context')
  }
  context.drawImage(
    source,
    0,
    0,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height
  )
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/png')
  })
  if (!blob) {
    throw new Error('canvas toBlob failed')
  }
  return blob
}
