import { v4 as uuidv4 } from 'uuid'
import { paintBoard } from '../paintBoard'
import { fabric } from 'fabric'
import { CANVAS_CUSTOM_PROPERTIES } from './canvasProperties'
import { initObjectControls } from './loadCanvas'

export const initCustomObjectAttr = (obj: fabric.Object, type: string) => {
  const id = uuidv4()
  obj.set({
    id,
    _customType: type
  } as any)
}

export const cloneObjects = (objects: fabric.Object[]) => {
  const canvas = paintBoard.canvas
  if (!canvas) {
    return
  }

  // clear the current selection
  canvas.discardActiveObject()

  const offsetX = 20
  const offsetY = 20

  const copys = objects.map((object) => {
    return new Promise<fabric.Object>((resolve) => {
      object?.clone((cloned: fabric.Object) => {
        const id = uuidv4()
        cloned.set({
          left: (cloned?.left || 0) + offsetX,
          top: (cloned?.top || 0) + offsetY,
          evented: true,
          id,
          perPixelTargetFind: true
        })
        canvas.add(cloned)
        // Endpoint handlers read the canvas transform, so the object has to be
        // on the canvas before the controls are built and measured.
        initObjectControls(cloned)
        cloned.setCoords()
        resolve(cloned)
      }, CANVAS_CUSTOM_PROPERTIES)
    })
  })
  Promise.all(copys).then((objs) => {
    if (!objs.length) {
      return
    }
    // A one-object ActiveSelection draws the default bounding-box handles.
    // Select the copy itself so its own controls, such as line endpoints, show immediately.
    if (objs.length === 1) {
      canvas.setActiveObject(objs[0])
    } else {
      canvas.setActiveObject(
        new fabric.ActiveSelection(objs, {
          canvas
        })
      )
    }
    paintBoard.render()
  })
}

/**
 * Check if the object is locked (cannot move, rotate or scale)
 * @param obj fabric object
 * @returns if the object is locked return true, otherwise return false
 */
export const isObjectLocked = (obj: fabric.Object): boolean => {
  // check if any locked properties are set to true
  return !!(
    obj.lockMovementX ||
    obj.lockMovementY ||
    obj.lockRotation ||
    obj.lockScalingX ||
    obj.lockScalingY ||
    obj.lockUniScaling
  )
}

/**
 * Filter out locked objects
 * @param objects objects array
 * @returns filtered objects array (excluding locked objects)
 */
export const filterUnlockedObjects = (
  objects: fabric.Object[]
): fabric.Object[] => {
  return objects.filter((obj) => !isObjectLocked(obj))
}
