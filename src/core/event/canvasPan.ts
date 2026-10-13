let depth = 0

type PanCanvas = {
  skipTargetFind: boolean
}

const apply = (canvas: PanCanvas | null | undefined) => {
  if (!canvas) {
    return
  }
  canvas.skipTargetFind = depth > 0
}

/**
 * Space-drag and two-finger pan both turn off drawing mode, so Fabric
 * hit-tests every object on each move. Keep that off until every pan ends.
 */
export const beginCanvasPan = (canvas: PanCanvas | null | undefined) => {
  depth += 1
  apply(canvas)
}

export const endCanvasPan = (canvas: PanCanvas | null | undefined) => {
  depth = Math.max(0, depth - 1)
  apply(canvas)
}
