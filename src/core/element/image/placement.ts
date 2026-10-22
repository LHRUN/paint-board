/** Same formats as the toolbar file picker: `.jpeg, .jpg, .png`. */
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png']

export const isBoardImageFile = (file: { name: string; type: string }) => {
  const type = file.type.toLowerCase()
  if (type === 'image/png' || type === 'image/jpeg' || type === 'image/jpg') {
    return true
  }
  const name = file.name.toLowerCase()
  return IMAGE_EXTENSIONS.some((extension) => name.endsWith(extension))
}

/**
 * Map a browser point onto the canvas scene.
 * Logical canvas pixels account for a CSS size that differs from the canvas
 * width, then the viewport inverse removes zoom and pan.
 */
export const scenePoint = (
  clientX: number,
  clientY: number,
  bounds: { left: number; top: number; width: number; height: number },
  canvasSize: { width: number; height: number },
  viewport: number[]
) => {
  const logicalX =
    bounds.width > 0
      ? ((clientX - bounds.left) * canvasSize.width) / bounds.width
      : clientX - bounds.left
  const logicalY =
    bounds.height > 0
      ? ((clientY - bounds.top) * canvasSize.height) / bounds.height
      : clientY - bounds.top
  return invertViewport(logicalX, logicalY, viewport)
}

export const invertViewport = (x: number, y: number, viewport: number[]) => {
  const [a, b, c, d, e, f] =
    viewport.length >= 6 ? viewport : [1, 0, 0, 1, 0, 0]
  const determinant = a * d - b * c
  if (!determinant) {
    return { x, y }
  }
  return {
    x: (d * (x - e) - c * (y - f)) / determinant,
    y: (a * (y - f) - b * (x - e)) / determinant
  }
}

/** Keep an uploaded image within half the canvas, and never enlarge it. */
export const fitCanvasImageScale = (
  imageWidth: number,
  imageHeight: number,
  canvasWidth: number,
  canvasHeight: number
) => {
  const scaleX = canvasWidth / 2 / (imageWidth || 1)
  const scaleY = canvasHeight / 2 / (imageHeight || 1)
  return Math.min(scaleX, scaleY, 1)
}

/** Fabric's default origin is the top-left, so the center sits half a size away. */
export const imageOriginAtCenter = (
  center: { x: number; y: number },
  scaledWidth: number,
  scaledHeight: number
) => {
  return {
    left: center.x - scaledWidth / 2,
    top: center.y - scaledHeight / 2
  }
}

/**
 * Place several images around the drop point.
 * One image is centered on the point. Further images step down-right by at
 * least `minStep`, or 20% of the smaller side when that is larger, and the
 * whole group is shifted so the drop point stays in the middle.
 */
export const dropCenters = (
  sizes: Array<{ width: number; height: number }>,
  origin: { x: number; y: number },
  minStep: number
) => {
  if (!sizes.length) {
    return []
  }
  const offsets = [0]
  for (let index = 1; index < sizes.length; index += 1) {
    const size = sizes[index]
    const nudge = Math.max(minStep, Math.min(size.width, size.height) * 0.2)
    offsets.push(offsets[index - 1] + nudge)
  }
  const middle = (offsets[offsets.length - 1] || 0) / 2
  return offsets.map((offset) => ({
    x: origin.x + offset - middle,
    y: origin.y + offset - middle
  }))
}
