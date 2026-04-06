import { paintBoard } from '@/core/paintBoard'
import { KeyCode } from '@/constants/event'
import useFileStore from '@/store/files'

/**
 * Canvas navigation handler
 * Handles pan operations
 */
export class TransformCanvasHandler {
  /**
   * Pan canvas in specified direction
   */
  panCanvas(direction: string) {
    const canvas = paintBoard?.canvas
    if (!canvas) return

    // pan distance (pixels)
    const panDistance = 50

    // get the current viewport transformation matrix
    const currentVpt = canvas.viewportTransform
    if (!currentVpt) return

    // create a new transformation matrix (avoid modifying the read-only array directly)
    const newVpt = [...currentVpt]

    // calculate the new pan value according to the direction
    let deltaX = 0
    let deltaY = 0

    switch (direction) {
      case KeyCode.ARROW_LEFT:
        deltaX = -panDistance
        break
      case KeyCode.ARROW_RIGHT:
        deltaX = panDistance
        break
      case KeyCode.ARROW_UP:
        deltaY = -panDistance
        break
      case KeyCode.ARROW_DOWN:
        deltaY = panDistance
        break
    }

    // apply pan to the new transformation matrix
    newVpt[4] += deltaX
    newVpt[5] += deltaY

    // update the canvas viewport transformation
    canvas.setViewportTransform(newVpt)
    canvas.renderAll()

    // update the transformation information in the store
    useFileStore.getState().updateTransform(newVpt)

    console.log(`Canvas panned: ${direction}, delta: (${deltaX}, ${deltaY})`)
  }
}
