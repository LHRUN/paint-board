import { fabric } from 'fabric'

export function getObjectSizeWithStroke(object: fabric.Polyline) {
  const stroke = new fabric.Point(
    object.strokeUniform ? 1 / (object.scaleX as number) : 1,
    object.strokeUniform ? 1 / (object.scaleY as number) : 1
  ).multiply(object.strokeWidth as number)
  return new fabric.Point(
    (object.width as number) + stroke.x,
    (object.height as number) + stroke.y
  )
}

export const polygonPositionHandler: fabric.Control['positionHandler'] =
  function (
    this: fabric.Control,
    dim,
    finalMatrix,
    fabricObject: fabric.Polyline
  ) {
    const points = fabricObject.points as fabric.Point[]
    const x = points[this.pointIndex].x - fabricObject.pathOffset.x
    const y = points[this.pointIndex].y - fabricObject.pathOffset.y
    return fabric.util.transformPoint(
      { x, y } as fabric.Point,
      fabric.util.multiplyTransformMatrices(
        fabricObject.canvas?.viewportTransform as number[],
        fabricObject.calcTransformMatrix()
      )
    )
  }

export const actionHandler: fabric.Control['actionHandler'] = function (
  eventData,
  transform,
  x,
  y
) {
  const polygon = transform.target as fabric.Polyline,
    currentControl = polygon.controls[polygon.__corner],
    mouseLocalPosition = polygon.toLocalPoint(
      new fabric.Point(x, y),
      'center',
      'center'
    ),
    polygonBaseSize = getObjectSizeWithStroke(polygon),
    size = polygon._getTransformedDimensions(0, 0),
    finalPointPosition = {
      x:
        (mouseLocalPosition.x * polygonBaseSize.x) / size.x +
        polygon.pathOffset.x,
      y:
        (mouseLocalPosition.y * polygonBaseSize.y) / size.y +
        polygon.pathOffset.y
    } as fabric.Point

  const points = polygon.points as fabric.Point[]
  points[currentControl.pointIndex] = finalPointPosition

  return true
}

export function anchorWrapper(
  anchorIndex: number,
  fn: fabric.Control['actionHandler']
) {
  return function (
    eventData: MouseEvent,
    transform: fabric.Transform,
    x: number,
    y: number
  ) {
    const fabricObject = transform.target as fabric.Polyline
    const points = fabricObject.points as fabric.Point[]
    const absolutePoint = fabric.util.transformPoint(
      {
        x: points[anchorIndex].x - fabricObject.pathOffset.x,
        y: points[anchorIndex].y - fabricObject.pathOffset.y
      } as fabric.Point,
      fabricObject.calcTransformMatrix()
    )
    const actionPerformed = fn(eventData, transform, x, y)
    fabricObject._setPositionDimensions({})
    const polygonBaseSize = getObjectSizeWithStroke(fabricObject)

    const newX =
      (points[anchorIndex].x - fabricObject.pathOffset.x) / polygonBaseSize.x
    const newY =
      (points[anchorIndex].y - fabricObject.pathOffset.y) / polygonBaseSize.y
    fabricObject.setPositionByOrigin(
      absolutePoint,
      (newX + 0.5) as unknown as string,
      (newY + 0.5) as unknown as string
    )
    return actionPerformed
  }
}
