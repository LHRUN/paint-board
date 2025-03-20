import { fabric } from 'fabric'

export function calculateArrowSlidePath(
  paths: any[],
  startX: number,
  startY: number,
  endX: number,
  endY: number
) {
  const angleRad = Math.atan2(endY - startY, endX - startX)
  const arrowWidthHalf = 10

  const arrowLeftX = endX - arrowWidthHalf * Math.cos(angleRad - Math.PI / 6)
  const arrowLeftY = endY - arrowWidthHalf * Math.sin(angleRad - Math.PI / 6)
  const arrowRightX = endX - arrowWidthHalf * Math.cos(angleRad + Math.PI / 6)
  const arrowRightY = endY - arrowWidthHalf * Math.sin(angleRad + Math.PI / 6)

  paths[paths.length - 4][1] = endX
  paths[paths.length - 4][2] = endY
  paths[paths.length - 3][1] = arrowLeftX
  paths[paths.length - 3][2] = arrowLeftY
  paths[paths.length - 2][1] = endX
  paths[paths.length - 2][2] = endY
  paths[paths.length - 1][1] = arrowRightX
  paths[paths.length - 1][2] = arrowRightY

  return paths
}

export function getObjectSizeWithStroke(object: fabric.Path) {
  const stroke = new fabric.Point(
    object.strokeUniform ? 1 / (object.scaleX as number) : 1,
    object.strokeUniform ? 1 / (object.scaleY as number) : 1
  ).multiply(object.strokeWidth as number)
  return new fabric.Point(
    (object.width as number) + stroke.x,
    (object.height as number) + stroke.y
  )
}

export const pathPositionHandler: fabric.Control['positionHandler'] = function (
  this: fabric.Control,
  dim,
  finalMatrix,
  fabricObject: fabric.Path
) {
  const paths = fabricObject.path
  const x = paths[this.pointIndex][1] - fabricObject.pathOffset.x
  const y = paths[this.pointIndex][2] - fabricObject.pathOffset.y
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
  const pathObj = transform.target as fabric.Path,
    currentControl = pathObj.controls[pathObj.__corner],
    mouseLocalPosition = pathObj.toLocalPoint(
      new fabric.Point(x, y),
      'center',
      'center'
    ),
    pathBaseSize = getObjectSizeWithStroke(pathObj),
    size = pathObj._getTransformedDimensions(0, 0),
    finalPointPosition = {
      x:
        (mouseLocalPosition.x * pathBaseSize.x) / size.x + pathObj.pathOffset.x,
      y: (mouseLocalPosition.y * pathBaseSize.y) / size.y + pathObj.pathOffset.y
    }

  const path = pathObj.path
  path[currentControl.pointIndex][1] = finalPointPosition.x
  path[currentControl.pointIndex][2] = finalPointPosition.y

  if (
    currentControl.pointIndex === path?.length - 5 ||
    currentControl.pointIndex === path?.length - 6
  ) {
    const point1 = path[path.length - 6]
    const point2 = path[path.length - 5]
    const newPath = calculateArrowSlidePath(
      path,
      point1[1],
      point1[2],
      point2[1],
      point2[2]
    )
    pathObj._setPath(newPath)
  }

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
    const fabricObject = transform.target as fabric.Path
    const paths = fabricObject.path
    const absolutePoint = fabric.util.transformPoint(
      {
        x: paths[anchorIndex][1] - fabricObject.pathOffset.x,
        y: paths[anchorIndex][2] - fabricObject.pathOffset.y
      } as fabric.Point,
      fabricObject.calcTransformMatrix()
    )
    const actionPerformed = fn(eventData, transform, x, y)
    fabricObject._setPath(fabricObject.path)
    const pathBaseSize = getObjectSizeWithStroke(fabricObject)

    const newX =
      (paths[anchorIndex][1] - fabricObject.pathOffset.x) / pathBaseSize.x
    const newY =
      (paths[anchorIndex][2] - fabricObject.pathOffset.y) / pathBaseSize.y
    fabricObject.setPositionByOrigin(
      absolutePoint,
      (newX + 0.5) as unknown as string,
      (newY + 0.5) as unknown as string
    )
    return actionPerformed
  }
}
