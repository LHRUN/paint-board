import { fabric } from 'fabric'

/**
 * Screen diameter of the eraser stroke.
 * Fabric stores the brush width in scene units and strokes it after the
 * viewport zoom (and the canvas CSS scale) is applied, so the on-screen
 * diameter is `brushWidth * zoom * displayWidth / canvasWidth`.
 * `getEraserWidth` divides the slider value by zoom, which makes this
 * diameter equal the slider value when the canvas CSS size matches its
 * logical width.
 */
export const eraserScreenDiameter = (
  brushWidth: number,
  zoom: number,
  canvasWidth: number,
  displayWidth: number
) => {
  if (!(brushWidth > 0) || !(zoom > 0)) {
    return 0
  }
  const logicalWidth = canvasWidth > 0 ? canvasWidth : displayWidth
  const shownWidth = displayWidth > 0 ? displayWidth : logicalWidth
  if (!(logicalWidth > 0)) {
    return 0
  }
  return (brushWidth * zoom * shownWidth) / logicalWidth
}

const clientPoint = (event: Event) => {
  if ('clientX' in event && typeof (event as MouseEvent).clientX === 'number') {
    return {
      x: (event as MouseEvent).clientX,
      y: (event as MouseEvent).clientY
    }
  }
  const touch = (event as TouchEvent).touches?.[0]
  if (!touch) {
    return null
  }
  return { x: touch.clientX, y: touch.clientY }
}

/**
 * Visual-only ring that follows the pointer in eraser mode.
 * It lives on the canvas wrapper, outside Fabric's object list, so it is
 * not drawn, selected, saved, undone, or exported.
 */
export class EraserCursor {
  private canvas: fabric.Canvas | null = null
  private element: HTMLDivElement | null = null
  private active = false
  private interactive = true
  private inside = false
  private pointer: { x: number; y: number } | null = null
  private applied = { shown: false, diameter: -1, x: NaN, y: NaN }

  attach(canvas: fabric.Canvas) {
    if (this.canvas === canvas) {
      return
    }
    this.detach()
    const parent = canvas.upperCanvasEl?.parentElement
    if (!parent) {
      return
    }
    const element = document.createElement('div')
    element.setAttribute('data-eraser-cursor', 'true')
    element.setAttribute('aria-hidden', 'true')
    element.style.position = 'absolute'
    element.style.left = '0'
    element.style.top = '0'
    element.style.borderRadius = '50%'
    element.style.background = 'transparent'
    element.style.boxShadow =
      '0 0 0 1px rgba(255, 255, 255, 0.95), inset 0 0 0 1px rgba(0, 0, 0, 0.85)'
    element.style.pointerEvents = 'none'
    element.style.zIndex = '3'
    element.style.display = 'none'
    element.style.transform = 'translate(-50%, -50%)'
    parent.appendChild(element)
    this.element = element
    this.canvas = canvas
    canvas.on('after:render', this.onAfterRender)
  }

  detach() {
    this.canvas?.off('after:render', this.onAfterRender)
    this.element?.remove()
    this.element = null
    this.canvas = null
    this.pointer = null
    this.inside = false
    this.applied = { shown: false, diameter: -1, x: NaN, y: NaN }
  }

  setActive(active: boolean) {
    this.active = active
    this.render()
  }

  setInteractive(interactive: boolean) {
    this.interactive = interactive
    if (!interactive) {
      this.inside = false
    }
    this.render()
  }

  move(event: Event) {
    const point = clientPoint(event)
    const canvas = this.canvas
    const bounds = canvas?.upperCanvasEl?.getBoundingClientRect()
    if (!point || !bounds) {
      return
    }
    const x = point.x - bounds.left
    const y = point.y - bounds.top
    this.pointer = { x, y }
    this.inside = x >= 0 && y >= 0 && x <= bounds.width && y <= bounds.height
    this.render()
  }

  leave() {
    this.inside = false
    this.render()
  }

  refresh() {
    this.render()
  }

  private onAfterRender = () => {
    if (!this.active || !this.element) {
      return
    }
    this.render()
  }

  private render() {
    const element = this.element
    const canvas = this.canvas
    if (!element || !canvas) {
      return
    }
    const show = this.active && this.interactive && this.inside && this.pointer
    if (!show || !this.pointer) {
      if (this.applied.shown) {
        element.style.display = 'none'
        this.applied.shown = false
      }
      return
    }

    const bounds = canvas.upperCanvasEl?.getBoundingClientRect()
    const diameter = eraserScreenDiameter(
      canvas.freeDrawingBrush?.width || 0,
      canvas.getZoom() || 1,
      canvas.getWidth() || 0,
      bounds?.width || 0
    )
    if (!(diameter > 0)) {
      if (this.applied.shown) {
        element.style.display = 'none'
        this.applied.shown = false
      }
      return
    }

    if (!this.applied.shown) {
      element.style.display = 'block'
      this.applied.shown = true
    }
    if (this.applied.diameter !== diameter) {
      const size = `${diameter}px`
      element.style.width = size
      element.style.height = size
      this.applied.diameter = diameter
    }
    if (this.applied.x !== this.pointer.x) {
      element.style.left = `${this.pointer.x}px`
      this.applied.x = this.pointer.x
    }
    if (this.applied.y !== this.pointer.y) {
      element.style.top = `${this.pointer.y}px`
      this.applied.y = this.pointer.y
    }
  }
}
