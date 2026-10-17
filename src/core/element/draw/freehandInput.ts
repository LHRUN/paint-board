import { DrawStyle } from '@/constants/draw'
import useDrawStore from '@/store/draw'
import { readPenPressure, type PenInputEvent } from './freehandPath'

const SAMPLE_MS = 100

let watching = false
let bound = false
let latestPen: { pressure: number; at: number } | undefined

const remember = (event: Event) => {
  const pressure = readPenPressure(event as PenInputEvent)
  if (pressure == null) {
    return
  }
  latestPen = { pressure, at: performance.now() }
}

const startWatching = () => {
  if (watching) {
    return
  }
  window.addEventListener('pointerdown', remember, true)
  window.addEventListener('pointermove', remember, true)
  window.addEventListener('touchstart', remember, true)
  window.addEventListener('touchmove', remember, true)
  watching = true
}

const stopWatching = () => {
  if (!watching) {
    return
  }
  window.removeEventListener('pointerdown', remember, true)
  window.removeEventListener('pointermove', remember, true)
  window.removeEventListener('touchstart', remember, true)
  window.removeEventListener('touchmove', remember, true)
  watching = false
  latestPen = undefined
}

const usesPenPressure = (drawStyle: string) =>
  drawStyle === DrawStyle.Freehand || drawStyle === DrawStyle.FreehandStroke

const syncWatching = (drawStyle: string) => {
  if (usesPenPressure(drawStyle)) {
    startWatching()
    return
  }
  stopWatching()
}

/**
 * Listen for pen pressure only while this brush is selected.
 * Fabric stays on mouse events, so the sample is captured beside those events.
 */
export const ensureFreehandInput = () => {
  if (bound) {
    return
  }
  bound = true
  syncWatching(useDrawStore.getState().drawStyle)
  useDrawStore.subscribe((state, previous) => {
    if (state.drawStyle === previous.drawStyle) {
      return
    }
    syncWatching(state.drawStyle)
  })
}

export const currentPenPressure = () => {
  if (!latestPen) {
    return undefined
  }
  if (performance.now() - latestPen.at > SAMPLE_MS) {
    return undefined
  }
  return latestPen.pressure
}
