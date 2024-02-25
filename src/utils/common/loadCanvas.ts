import { fabric } from 'fabric'
import {
  actionHandler,
  anchorWrapper,
  polygonPositionHandler
} from '../element/shape/utils/line'
import {
  actionHandler as arrowActionHandler,
  anchorWrapper as arrowAnchorWrapper,
  pathPositionHandler
} from '../element/shape/utils/arrowLine'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import { paintBoard } from '../paintBoard'
import { IBoardData } from '@/store/files'

/**
 * get fabric.js canvas JSON data
 * @returns JSON
 */
export const getCanvasJSON = (): Partial<IBoardData> => {
  const canvas = paintBoard?.canvas
  if (canvas) {
    return (
      canvas.toDatalessJSON([
        'id',
        '_customType',
        'perPixelTargetFind',
        'objectCaching'
      ]) ?? {}
    )
  }
  return {}
}

/**
 * Handling canvas json loaded data
 * Used to initialize undo redo
 * @param canvas fabric.Canvas
 */
export const handleCanvasJSONLoaded = (canvas: fabric.Canvas) => {
  canvas.getObjects().forEach((obj) => {
    if (obj._customType === ELEMENT_CUSTOM_TYPE.SHAPE_LINE) {
      const points = (obj as fabric.Polyline).points as fabric.Point[]
      const lastControl = points.length - 1
      obj.controls = points.reduce(function (acc, point, index) {
        acc['p' + index] = new fabric.Control({
          positionHandler: polygonPositionHandler,
          actionHandler: anchorWrapper(
            index > 0 ? index - 1 : lastControl,
            actionHandler
          ),
          actionName: 'polylineEndPoint',
          pointIndex: index
        })
        return acc
      }, {} as Record<string, fabric.Control>)
    }

    if (obj._customType === ELEMENT_CUSTOM_TYPE.SHAPE_ARROW_LINE) {
      const paths = (obj as fabric.Path).path
      obj.controls = paths
        .slice(0, paths.length - 4)
        .reduce(function (acc, point, index) {
          acc['p' + index] = new fabric.Control({
            positionHandler: pathPositionHandler,
            actionHandler: arrowAnchorWrapper(
              index > 0 ? index - 1 : paths.length - 5,
              arrowActionHandler
            ),
            actionName: 'pathEndPoint',
            pointIndex: index
          })
          return acc
        }, {} as Record<string, fabric.Control>)
    }
  })
}
