import { fabric } from 'fabric'
import {
  actionHandler,
  anchorWrapper,
  polygonPositionHandler
} from '../element/shape/utils/line'

/**
 * Handling canvas json loaded data
 * Used to initialize undo redo
 * @param canvas fabric.Canvas
 */
export const handleCanvasJSONLoaded = (canvas: fabric.Canvas) => {
  canvas.getObjects().forEach((obj) => {
    if (obj._customType === 'shapeLine') {
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
  })
}
