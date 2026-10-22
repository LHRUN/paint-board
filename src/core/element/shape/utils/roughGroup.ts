import { fabric } from 'fabric'
import {
  contentFrame,
  roughShapePlacement,
  SHAPE_VIEWBOX,
  undoStrokeOrigin
} from './roughFrame'

const MIN_SHAPE_SIZE = 0.0001

/**
 * Build a rough-shape group whose box is the visible centerline.
 * `offsetX/Y` is that centerline's top-left in path coordinates, before
 * Fabric recenters the children. Icons keep this so they stay in the viewBox.
 */
export const createRoughShapeGroup = (
  objects: fabric.Object[],
  point: fabric.Point,
  zoom: number
) => {
  objects.forEach((object) => {
    object.set(undoStrokeOrigin(object))
  })

  const pathFrame = contentFrame(objects)
  const group = new fabric.Group(objects, {
    left: point.x,
    top: point.y,
    scaleX: 0,
    scaleY: 0,
    perPixelTargetFind: true,
    objectCaching: false
  })

  const groupedFrame = contentFrame(group.getObjects(), true)
  if (groupedFrame) {
    const shiftX = groupedFrame.minX + groupedFrame.width / 2
    const shiftY = groupedFrame.minY + groupedFrame.height / 2
    group.getObjects().forEach((object) => {
      object.set({
        left: (object.left || 0) - shiftX,
        top: (object.top || 0) - shiftY
      })
      object.setCoords()
    })
    const outset = groupedFrame.outset
    group.set({
      width: Math.max(groupedFrame.width, MIN_SHAPE_SIZE),
      height: Math.max(groupedFrame.height, MIN_SHAPE_SIZE),
      roughStrokeOutset: outset,
      padding: outset * zoom
    })
  } else {
    group.set({
      width: SHAPE_VIEWBOX,
      height: SHAPE_VIEWBOX,
      roughStrokeOutset: 0,
      padding: 0
    })
  }
  group.setCoords()

  return {
    group,
    offsetX: pathFrame?.minX ?? 0,
    offsetY: pathFrame?.minY ?? 0
  }
}

export const layoutRoughShape = (
  group: fabric.Object,
  startX: number,
  startY: number,
  point: { x: number; y: number },
  basis: { x: number; y: number },
  offset = { x: 0, y: 0 }
) => {
  group.set(roughShapePlacement(startX, startY, point, basis, offset))
  group.setCoords()
}

/**
 * `roughStrokeOutset` is half the stroke in scene pixels. Fabric padding is
 * applied after the viewport zoom, so it has to be scaled with the zoom.
 */
export const applyRoughShapePadding = (object: fabric.Object, zoom: number) => {
  const outset = object.roughStrokeOutset
  if (typeof outset !== 'number' || !Number.isFinite(outset)) {
    return
  }
  const padding = outset * zoom
  if (object.padding === padding) {
    return
  }
  object.set({ padding })
  object.setCoords()
}

export const syncRoughShapePadding = (
  objects: fabric.Object[],
  zoom: number
) => {
  objects.forEach((object) => {
    applyRoughShapePadding(object, zoom)
    if (object.type === 'group') {
      syncRoughShapePadding((object as fabric.Group).getObjects(), zoom)
    }
  })
}
