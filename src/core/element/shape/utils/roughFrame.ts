import { StrokeStyleType } from '@/constants/shape'
import { Options } from 'roughjs/bin/core'

/**
 * Nominal size of a shape before it is scaled to the drag rectangle.
 * Icons use this as their viewBox. Rectangles, circles and polygons are
 * generated in the same coordinate space.
 */
export const SHAPE_VIEWBOX = 24

export const buildRoughShapeOptions = (input: {
  stroke: string
  strokeStyle: string
  fill: string
  fillStyle?: string
}): Options => {
  const options: Options = {
    roughness: input.strokeStyle === StrokeStyleType.Sketch ? 0.3 : 0,
    bowing: input.strokeStyle === StrokeStyleType.Sketch ? 0.7 : 0,
    stroke: input.stroke
  }
  // roughjs treats any truthy fill as paint. "transparent" still generates
  // an invisible hachure path for rectangles, circles and polygons.
  if (input.fill && input.fill !== 'transparent') {
    options.fill = input.fill
    if (input.fillStyle) {
      options.fillStyle = input.fillStyle
    }
  }
  return options
}

export interface RoughMeasurable {
  left?: number
  top?: number
  width?: number
  height?: number
  scaleX?: number
  scaleY?: number
  stroke?: unknown
  fill?: unknown
  strokeWidth?: number
}

export interface RoughFrame {
  minX: number
  minY: number
  width: number
  height: number
  outset: number
}

const isClearPaint = (value: unknown) => {
  return (
    value == null || value === '' || value === 'transparent' || value === 'none'
  )
}

/**
 * Fabric shifts a path's top-left by half the stroke width without growing
 * the box. Putting that half back places the centerline on the path geometry.
 */
export const undoStrokeOrigin = (shape: RoughMeasurable) => {
  const shift = (shape.strokeWidth || 0) / 2
  return {
    left: (shape.left || 0) + shift,
    top: (shape.top || 0) + shift
  }
}

export const shapePaints = (shape: RoughMeasurable) => {
  const hasStroke = !isClearPaint(shape.stroke) && (shape.strokeWidth || 0) > 0
  const hasFill = !isClearPaint(shape.fill)
  return hasStroke || hasFill
}

/**
 * Axis-aligned centerline bounds of the paths that actually paint.
 * `outset` is half the widest visible stroke, in the same unscaled units.
 *
 * Inside a Fabric group, `strokeUniform` places the drawing origin at
 * `left + (width + strokeWidth) / 2`: the stroke is added on the right and
 * bottom of that measurement, while the path itself is centered there.
 * The centerline therefore starts `strokeWidth / 2` past `left`/`top`.
 */
export const contentFrame = (
  shapes: RoughMeasurable[],
  inGroup = false
): RoughFrame | null => {
  const painted = shapes.filter(shapePaints)
  if (!painted.length) {
    return null
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let outset = 0

  painted.forEach((shape) => {
    const strokeInset = inGroup ? (shape.strokeWidth || 0) / 2 : 0
    const left = (shape.left || 0) + strokeInset
    const top = (shape.top || 0) + strokeInset
    const right = left + (shape.width || 0) * (shape.scaleX || 1)
    const bottom = top + (shape.height || 0) * (shape.scaleY || 1)
    minX = Math.min(minX, left)
    minY = Math.min(minY, top)
    maxX = Math.max(maxX, right)
    maxY = Math.max(maxY, bottom)
    if (!isClearPaint(shape.stroke) && (shape.strokeWidth || 0) > 0) {
      outset = Math.max(outset, (shape.strokeWidth || 0) / 2)
    }
  })

  return {
    minX,
    minY,
    width: maxX - minX,
    height: maxY - minY,
    outset
  }
}

export const roughShapePlacement = (
  startX: number,
  startY: number,
  point: { x: number; y: number },
  basis: { x: number; y: number },
  offset = { x: 0, y: 0 }
) => {
  const dragW = Math.abs(point.x - startX)
  const dragH = Math.abs(point.y - startY)
  const left = point.x > startX ? startX : startX - dragW
  const top = point.y > startY ? startY : startY - dragH
  const scaleX = basis.x > 0 ? dragW / basis.x : 0
  const scaleY = basis.y > 0 ? dragH / basis.y : 0
  return {
    scaleX,
    scaleY,
    left: left + offset.x * scaleX,
    top: top + offset.y * scaleY
  }
}
