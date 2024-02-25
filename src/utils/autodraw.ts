import { fabric } from 'fabric'
import { IInk } from '@/services/autodraw'
import { paintBoard } from './paintBoard'
import useDrawStore from '@/store/draw'

class AutoDrawData {
  inks: IInk[] = []
  paths: fabric.Path[] = [] // array of path objects on the board
  oldSVG: fabric.Object | null = null // previous image, used to replace
  curLeft = 0
  curTop = 0
  curSize = 0

  addPath(path: fabric.Path) {
    this.paths.push(path)
  }

  clearPath() {
    this.paths = []
  }

  addInk(ink: IInk) {
    this.inks.push(ink)
  }

  clearInks() {
    this.inks = []
  }

  resetLoadedSVG() {
    this.oldSVG = null
    this.curLeft = 0
    this.curTop = 0
    this.curSize = 0
  }

  clearDraw() {
    this.clearPath()
    this.clearInks()
  }

  replaceSVGImg(src: string) {
    // replace old autodraw image
    if (this.oldSVG && paintBoard.canvas) {
      paintBoard.canvas.remove(this.oldSVG)

      fabric.loadSVGFromURL(src, (objects, options) => {
        const stroke = useDrawStore.getState().drawColors[0]
        objects.forEach((obj) => {
          obj.set({
            fill: 'transparent',
            stroke
          })
        })
        const loadedObjects = fabric.util.groupSVGElements(objects, {
          ...options,
          minX: 0,
          minY: 0,
          left: this.curLeft,
          top: this.curTop,
          scaleX: this.curSize / options.width,
          scaleY: this.curSize / options.height,
          perPixelTargetFind: true
        })

        this.oldSVG = loadedObjects

        paintBoard.canvas?.add(loadedObjects)
        paintBoard.render()
      })
      return
    }

    // First click on autodraw image
    if (src && this.paths?.length && paintBoard.canvas) {
      let left = Number.MAX_SAFE_INTEGER
      let top = Number.MAX_SAFE_INTEGER
      let size = 0
      this.paths.forEach((path) => {
        const {
          bl = { x: 0, y: 0 },
          tl = { x: 0, y: 0 },
          tr = { x: 0, y: 0 }
        } = path?.lineCoords || {}
        left = Math.min(left, path?.left || Number.MAX_SAFE_INTEGER)
        top = Math.min(top, path?.top || Number.MAX_SAFE_INTEGER)
        size = Math.max(size, Math.abs(tl.x - tr.x), Math.abs(tl.y - bl.y))
      })
      paintBoard.canvas.remove(...this.paths)

      fabric.loadSVGFromURL(src, (objects, options) => {
        const stroke = useDrawStore.getState().drawColors[0]

        objects.forEach((obj) => {
          obj.set({
            fill: 'transparent',
            stroke
          })
        })
        const loadedObjects = fabric.util.groupSVGElements(objects, {
          ...options,
          minX: 0,
          minY: 0,
          left,
          top,
          scaleX: size / options.width,
          scaleY: size / options.height,
          perPixelTargetFind: true
        })

        this.oldSVG = loadedObjects
        this.curLeft = left
        this.curTop = top
        this.curSize = size

        paintBoard.canvas?.add(loadedObjects)
        paintBoard.render()
        this.clearDraw()
      })
    }
  }
}

export const autoDrawData = new AutoDrawData()
