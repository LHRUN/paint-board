export interface Bounds {
  left: number
  top: number
  width: number
  height: number
}

export const CONTENT_SAFETY_PADDING = 4
/** Blank margin around the painted pixels of an object export, in canvas pixels. */
export const CONTENT_PADDING = 16
export const MAX_EXPORT_SIDE = 16384
export const MAX_EXPORT_PIXELS = 4096 * 4096 * 4

export interface EffectShadow {
  offsetX?: number
  offsetY?: number
  blur?: number
  nonScaling?: boolean
}

export interface MeasurableObject {
  visible?: boolean
  opacity?: number
  type?: string
  strokeWidth?: number
  shadow?: EffectShadow | string | null
  getBoundingRect: (absolute?: boolean, calculate?: boolean) => Bounds
  getObjectScaling: () => { scaleX: number; scaleY: number }
  getObjects?: () => MeasurableObject[]
  group?: MeasurableObject
  calcTransformMatrix?: () => number[]
  /**
   * Corners in the parent coordinate space. Dimensions already include the
   * object's own scale, so this must not be multiplied by that scale again.
   */
  calcACoords?: () => {
    tl: { x: number; y: number }
    tr: { x: number; y: number }
    bl: { x: number; y: number }
    br: { x: number; y: number }
  }
  _getTransformedDimensions?: () => { x: number; y: number }
}

const isContainer = (obj: MeasurableObject) =>
  (obj.type === 'group' || obj.type === 'activeSelection') && !!obj.getObjects

/**
 * Canvas is centered in the window. This is the part of the canvas element
 * that is actually on screen, in canvas pixels.
 */
export const intersectVisibleCanvas = (
  canvasWidth: number,
  canvasHeight: number,
  viewWidth: number,
  viewHeight: number
): Bounds => {
  const offsetX = (canvasWidth - viewWidth) / 2
  const offsetY = (canvasHeight - viewHeight) / 2
  const left = Math.max(0, offsetX)
  const top = Math.max(0, offsetY)
  const right = Math.min(canvasWidth, offsetX + viewWidth)
  const bottom = Math.min(canvasHeight, offsetY + viewHeight)
  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top)
  }
}

/**
 * Padding Fabric uses when rasterizing one object, converted into canvas pixels.
 * The bounding box does not include the shadow.
 */
export const shadowPadding = (
  shadow: EffectShadow | string | null | undefined,
  scaleX: number,
  scaleY: number,
  zoom: number
) => {
  if (!shadow || typeof shadow === 'string') {
    return { x: 0, y: 0 }
  }
  const scale = shadow.nonScaling
    ? { scaleX: 1, scaleY: 1 }
    : { scaleX, scaleY }
  const extentX = Math.abs(shadow.offsetX || 0) + (shadow.blur || 0)
  const extentY = Math.abs(shadow.offsetY || 0) + (shadow.blur || 0)
  return {
    x: 2 * Math.round(extentX) * Math.abs(scale.scaleX) * zoom,
    y: 2 * Math.round(extentY) * Math.abs(scale.scaleY) * zoom
  }
}

const maxShadowPadding = (obj: MeasurableObject, zoom: number) => {
  const scaling = obj.getObjectScaling()
  const own = shadowPadding(obj.shadow, scaling.scaleX, scaling.scaleY, zoom)
  let x = own.x
  let y = own.y
  if (!isContainer(obj)) {
    return { x, y }
  }
  obj.getObjects?.().forEach((child) => {
    const pad = maxShadowPadding(child, zoom)
    x = Math.max(x, pad.x)
    y = Math.max(y, pad.y)
  })
  return { x, y }
}

const maxStrokeExtra = (obj: MeasurableObject) => {
  const scaling = obj.getObjectScaling()
  const scale = Math.max(Math.abs(scaling.scaleX), Math.abs(scaling.scaleY))
  let extra = ((obj.strokeWidth || 0) * scale) / 2
  if (isContainer(obj)) {
    obj.getObjects?.().forEach((child) => {
      extra = Math.max(extra, maxStrokeExtra(child))
    })
  }
  return extra
}

const transformPoint = (point: { x: number; y: number }, matrix: number[]) => ({
  x: matrix[0] * point.x + matrix[2] * point.y + matrix[4],
  y: matrix[1] * point.x + matrix[3] * point.y + matrix[5]
})

const boundsFromPoints = (points: Array<{ x: number; y: number }>): Bounds => {
  const xs = points.map((point) => point.x)
  const ys = points.map((point) => point.y)
  const left = Math.min(...xs)
  const top = Math.min(...ys)
  return {
    left,
    top,
    width: Math.max(...xs) - left,
    height: Math.max(...ys) - top
  }
}

/**
 * Axis-aligned box in canvas pixels.
 * `calcACoords` already includes the object's own scale. Multiplying those
 * corners by `calcTransformMatrix` would apply that scale a second time.
 * Corners of a grouped object are in group space, so the group matrix is
 * applied once before the viewport.
 */
const objectCanvasRect = (
  obj: MeasurableObject,
  viewportTransform?: number[]
): Bounds => {
  const coords = obj.calcACoords?.()
  if (!coords || !viewportTransform || viewportTransform.length < 6) {
    return obj.getBoundingRect(false, true)
  }

  let corners = [coords.tl, coords.tr, coords.bl, coords.br]
  if (obj.group) {
    const groupMatrix = obj.group.calcTransformMatrix?.()
    if (!groupMatrix || groupMatrix.length < 6) {
      return obj.getBoundingRect(false, true)
    }
    corners = corners.map((point) => transformPoint(point, groupMatrix))
  }
  return boundsFromPoints(
    corners.map((point) => transformPoint(point, viewportTransform))
  )
}

/**
 * Union of object bounds in current canvas pixels, expanded for shadow,
 * stroke, and a small margin so sketch strokes are not clipped.
 */
export const contentBounds = (
  objects: MeasurableObject[],
  zoom: number,
  viewportTransform?: number[]
): Bounds | null => {
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity

  objects.forEach((obj) => {
    if (obj.visible === false || obj.opacity === 0) {
      return
    }
    const rect = objectCanvasRect(obj, viewportTransform)
    const shadow = maxShadowPadding(obj, zoom)
    const safety = Math.max(
      CONTENT_SAFETY_PADDING * zoom,
      maxStrokeExtra(obj) * zoom
    )
    const padX = shadow.x + safety
    const padY = shadow.y + safety
    left = Math.min(left, rect.left - padX)
    top = Math.min(top, rect.top - padY)
    right = Math.max(right, rect.left + rect.width + padX)
    bottom = Math.max(bottom, rect.top + rect.height + padY)
  })

  if (!Number.isFinite(left) || !Number.isFinite(top)) {
    return null
  }
  const width = right - left
  const height = bottom - top
  if (width <= 0 || height <= 0) {
    return null
  }
  return { left, top, width, height }
}

/**
 * Smallest rectangle of pixels whose alpha is above the threshold.
 * Coordinates are in the rendered image, origin at the top left.
 */
export const opaqueBounds = (
  alpha: ArrayLike<number>,
  width: number,
  height: number,
  threshold = 0
): Bounds | null => {
  if (width < 1 || height < 1) {
    return null
  }
  let left = width
  let top = height
  let right = -1
  let bottom = -1
  for (let y = 0; y < height; y++) {
    const row = y * width
    for (let x = 0; x < width; x++) {
      if (alpha[(row + x) * 4 + 3] <= threshold) {
        continue
      }
      if (x < left) {
        left = x
      }
      if (y < top) {
        top = y
      }
      if (x > right) {
        right = x
      }
      if (y > bottom) {
        bottom = y
      }
    }
  }
  if (right < left || bottom < top) {
    return null
  }
  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1
  }
}

/**
 * Canvas-pixel crop that contains the painted pixels plus a margin.
 * `ink` is the opaque rectangle inside an image rendered from `crop`.
 */
export const boundsAroundInk = (
  crop: Bounds,
  ink: Bounds,
  multiplier: number,
  padding: number
): Bounds => {
  const scale = multiplier > 0 ? multiplier : 1
  const pad = padding * scale
  return {
    left: crop.left + (ink.left - pad) / scale,
    top: crop.top + (ink.top - pad) / scale,
    width: (ink.width + pad * 2) / scale,
    height: (ink.height + pad * 2) / scale
  }
}

export const outputPixelSize = (
  width: number,
  height: number,
  multiplier: number
) => ({
  width: Math.ceil(width * multiplier),
  height: Math.ceil(height * multiplier)
})

export const withinExportLimit = (width: number, height: number) => {
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    return false
  }
  if (width < 1 || height < 1) {
    return false
  }
  if (width > MAX_EXPORT_SIDE || height > MAX_EXPORT_SIDE) {
    return false
  }
  return width * height <= MAX_EXPORT_PIXELS
}

export const chooseExportMultiplier = (
  width: number,
  height: number,
  preferred: number
) => {
  const safePreferred = preferred > 0 ? preferred : 1
  const preferredSize = outputPixelSize(width, height, safePreferred)
  if (withinExportLimit(preferredSize.width, preferredSize.height)) {
    return safePreferred
  }
  if (safePreferred !== 1) {
    const unit = outputPixelSize(width, height, 1)
    if (withinExportLimit(unit.width, unit.height)) {
      return 1
    }
  }
  return null
}
