export const MAX_IMAGE_LONG_EDGE = 2048

export const fittedImageSize = (
  width: number,
  height: number,
  maxEdge = MAX_IMAGE_LONG_EDGE
) => {
  const longEdge = Math.max(width, height)
  if (longEdge <= maxEdge || longEdge === 0 || maxEdge <= 0) {
    return { width, height, scale: 1 }
  }
  const scale = maxEdge / longEdge
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale
  }
}

const loadHtmlImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('image load failed'))
    image.src = src
  })

/**
 * Shrink a data-URL image so its long edge fits on the canvas document.
 * Non-image strings and images that already fit are returned unchanged.
 */
export const limitImageDataUrl = async (
  dataUrl: string,
  maxEdge = MAX_IMAGE_LONG_EDGE
): Promise<string> => {
  if (typeof document === 'undefined' || !dataUrl.startsWith('data:image/')) {
    return dataUrl
  }

  let image: HTMLImageElement
  try {
    image = await loadHtmlImage(dataUrl)
  } catch {
    return dataUrl
  }

  const size = fittedImageSize(image.naturalWidth, image.naturalHeight, maxEdge)
  if (size.scale === 1) {
    return dataUrl
  }

  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  if (!context) {
    return dataUrl
  }
  context.drawImage(image, 0, 0, size.width, size.height)
  if (dataUrl.startsWith('data:image/png')) {
    return canvas.toDataURL('image/png')
  }
  return canvas.toDataURL('image/jpeg', 0.85)
}
