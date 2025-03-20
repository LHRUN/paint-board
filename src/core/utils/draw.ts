import useDrawStore from '@/store/draw'
import { paintBoard } from '../paintBoard'

export const getDrawWidth = (width?: number) => {
  return (
    (width ?? useDrawStore.getState().drawWidth) /
    (paintBoard.canvas?.getZoom() ?? 1)
  )
}

export const getEraserWidth = (width?: number) => {
  return (
    (width ?? useDrawStore.getState().eraserWidth) /
    (paintBoard.canvas?.getZoom() ?? 1)
  )
}

export const getShadowWidth = (width?: number) => {
  return (
    (width ?? useDrawStore.getState().shadowWidth) /
    (paintBoard.canvas?.getZoom() ?? 1)
  )
}
