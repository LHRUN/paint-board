export const BRUSH_DRAG_THRESHOLD_PX = 2

export interface BrushPoint {
  x: number
  y: number
}

export interface BrushPressState {
  clientAnchor: BrushPoint | null
  origin: BrushPoint | null
  drawing: boolean
}

export const createBrushPressState = (): BrushPressState => ({
  clientAnchor: null,
  origin: null,
  drawing: false
})

export const beginBrushPress = (
  client: BrushPoint | null,
  origin: BrushPoint | null
): BrushPressState => ({
  clientAnchor: client,
  origin,
  drawing: false
})

export const brushDragScreenDistance = (
  start: BrushPoint,
  current: BrushPoint
) => Math.hypot(current.x - start.x, current.y - start.y)

export const hasBrushDrag = (start: BrushPoint, current: BrushPoint) =>
  brushDragScreenDistance(start, current) >= BRUSH_DRAG_THRESHOLD_PX

/**
 * A press stays pending until the pointer moves at least the threshold.
 * `start` is true only on the move that crosses it.
 */
export const advanceBrushPress = (
  state: BrushPressState,
  client: BrushPoint
): { state: BrushPressState; start: boolean } => {
  if (state.drawing) {
    return { state, start: false }
  }
  if (!state.clientAnchor) {
    return {
      state: { ...state, clientAnchor: client },
      start: false
    }
  }
  if (!hasBrushDrag(state.clientAnchor, client)) {
    return { state, start: false }
  }
  return {
    state: { ...state, drawing: true },
    start: true
  }
}

export const pointerClientPoint = (event: object): BrushPoint | null => {
  const point = event as {
    clientX?: number
    clientY?: number
    touches?: ArrayLike<{ clientX: number; clientY: number }>
    changedTouches?: ArrayLike<{ clientX: number; clientY: number }>
  }
  const touch = point.touches?.[0] ?? point.changedTouches?.[0]
  if (touch) {
    return { x: touch.clientX, y: touch.clientY }
  }
  if (typeof point.clientX === 'number' && typeof point.clientY === 'number') {
    return { x: point.clientX, y: point.clientY }
  }
  return null
}
