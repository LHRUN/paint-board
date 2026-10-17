import { getStroke, type StrokeOptions } from 'perfect-freehand'

export type FreehandSettings = {
  size: number
  thinning: number
  smoothing: number
  streamline: number
  startTaper: number
  endTaper: number
}

export type PenInputEvent = {
  pointerType?: string
  pressure?: number
  touches?: ArrayLike<{ force?: number; touchType?: string }>
  changedTouches?: ArrayLike<{ force?: number; touchType?: string }>
}

const MIN_PEN_PRESSURE = 0.05

export type OutlineStroke = {
  stroke?: string
  strokeWidth: number
  strokeLineCap?: 'round'
  strokeLineJoin?: 'round'
}

/**
 * Screen-pixel stroke width, divided by zoom like the pen size.
 * Width 0 leaves the filled outline without a border.
 */
export const outlineStroke = (
  outlined: boolean,
  width: number,
  color: string,
  zoom: number
): OutlineStroke => {
  if (!outlined) {
    return { strokeWidth: 0 }
  }
  const strokeWidth = width / (zoom > 0 ? zoom : 1)
  if (!(strokeWidth > 0)) {
    return { strokeWidth: 0 }
  }
  return {
    stroke: color || '#FF6363',
    strokeWidth,
    strokeLineCap: 'round',
    strokeLineJoin: 'round'
  }
}

const average = (left: number, right: number) => (left + right) / 2

const round = (value: number) => value.toFixed(2)

/**
 * A press or mouse click reports 0.5 without a real sensor.
 * Only a pen, or an iOS stylus touch, supplies pressure for this brush.
 */
export const readPenPressure = (event: PenInputEvent): number | undefined => {
  if (event.pointerType != null) {
    if (event.pointerType !== 'pen') {
      return undefined
    }
    return clampPenPressure(event.pressure)
  }

  const touch = event.touches?.[0] || event.changedTouches?.[0]
  if (!touch || touch.touchType !== 'stylus') {
    return undefined
  }
  return clampPenPressure(touch.force)
}

export const clampPenPressure = (
  value: number | undefined
): number | undefined => {
  if (value == null || !Number.isFinite(value) || value < 0 || value > 1) {
    return undefined
  }
  if (value === 0) {
    return MIN_PEN_PRESSURE
  }
  return value
}

export const screenPointGap = (zoom: number) => {
  return 1 / (zoom > 0 ? zoom : 1)
}

export const isFarEnough = (
  previous: { x: number; y: number } | undefined,
  next: { x: number; y: number },
  minDistance: number
) => {
  if (!previous) {
    return true
  }
  const dx = next.x - previous.x
  const dy = next.y - previous.y
  return dx * dx + dy * dy >= minDistance * minDistance
}

export const freehandStrokeOptions = (
  settings: FreehandSettings,
  zoom: number,
  complete: boolean,
  simulatePressure: boolean
): StrokeOptions => {
  const scale = zoom > 0 ? zoom : 1
  const taper = (distance: number) => (distance > 0 ? distance / scale : 0)

  return {
    size: settings.size / scale,
    thinning: settings.thinning,
    smoothing: settings.smoothing,
    streamline: settings.streamline,
    simulatePressure,
    last: complete,
    start: {
      cap: true,
      taper: taper(settings.startTaper)
    },
    end: {
      cap: true,
      taper: taper(settings.endTaper)
    }
  }
}

export const outlineToSvgPath = (
  points: Array<[number, number]>,
  closed = true
) => {
  const length = points.length
  if (length < 2) {
    return ''
  }

  if (length < 4) {
    const commands = points.map((point, index) => {
      const command = index === 0 ? 'M' : 'L'
      return `${command}${round(point[0])},${round(point[1])}`
    })
    if (closed) {
      commands.push('Z')
    }
    return commands.join(' ')
  }

  const start = points[0]
  const control = points[1]
  const next = points[2]
  let path = `M${round(start[0])},${round(start[1])} Q${round(
    control[0]
  )},${round(control[1])} ${round(average(control[0], next[0]))},${round(
    average(control[1], next[1])
  )} T`

  for (let index = 2; index < length - 1; index++) {
    const current = points[index]
    const following = points[index + 1]
    path += `${round(average(current[0], following[0]))},${round(
      average(current[1], following[1])
    )} `
  }

  if (closed) {
    path += 'Z'
  }
  return path
}

export const buildFreehandPath = (
  points: number[][],
  settings: FreehandSettings,
  zoom: number,
  complete: boolean,
  simulatePressure: boolean
) => {
  if (points.length === 0 || settings.size <= 0) {
    return ''
  }
  const outline = getStroke(
    points,
    freehandStrokeOptions(settings, zoom, complete, simulatePressure)
  )
  return outlineToSvgPath(outline)
}
