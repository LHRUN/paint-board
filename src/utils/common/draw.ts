import useDrawStore from '@/store/draw'
import { paintBoard } from '../paintBoard'
import { v4 as uuidv4 } from 'uuid'

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

export const setObjectAttr = (obj: fabric.Object, type: string) => {
  const id = uuidv4()
  obj.set({
    id,
    _customType: type
  } as any)
}
