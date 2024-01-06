import { fabric } from 'fabric'
import { formatPublicUrl } from '@/utils/common/index'
import { paintBoard } from '@/utils/paintBoard'
import useDrawStore from '@/store/draw'
import { getDrawWidth, getShadowWidth } from '@/utils/common/draw'

export const MATERIAL_TYPE = {
  CRAYON: 'crayon',
  CARBON: 'carbon',
  CLOTH: 'cloth',
  OIL: 'oil',
  CRAYON_DARK: 'crayonDark'
}

export class Material {
  initPromise: Promise<boolean[]> | null = null // Initialize promise
  crayonImage: HTMLImageElement | null = null
  carbonImage: HTMLImageElement | null = null
  clothImage: HTMLImageElement | null = null
  oilImage: HTMLImageElement | null = null
  crayonDarkImage: HTMLImageElement | null = null

  constructor() {
    this.initMaterial()
  }

  async initMaterial() {
    this.initPromise = Promise.all([
      this.loadImage(MATERIAL_TYPE.CRAYON),
      this.loadImage(MATERIAL_TYPE.CARBON),
      this.loadImage(MATERIAL_TYPE.CLOTH),
      this.loadImage(MATERIAL_TYPE.OIL),
      this.loadImage(MATERIAL_TYPE.CRAYON_DARK)
    ])
  }

  render({
    materialType = useDrawStore.getState().materialType,
    color = useDrawStore.getState().drawColors[0]
  }) {
    this.initPromise?.then(() => {
      switch (materialType) {
        case MATERIAL_TYPE.CRAYON:
          this.renderMaterial(this.crayonImage, color)
          break
        case MATERIAL_TYPE.CARBON:
          this.renderMaterial(this.carbonImage, color)
          break
        case MATERIAL_TYPE.CLOTH:
          this.renderMaterial(this.clothImage, color)
          break
        case MATERIAL_TYPE.OIL:
          this.renderMaterial(this.oilImage, color)
          break
        case MATERIAL_TYPE.CRAYON_DARK:
          this.renderMaterial(this.crayonDarkImage, color)
          break
        default:
          break
      }
    })
  }

  renderMaterial(
    materialImg: HTMLImageElement | null,
    color: string,
    opacity = 1
  ) {
    if (paintBoard.canvas) {
      const patternBrush = new fabric.PatternBrush(paintBoard.canvas)
      const patternCanvas = document.createElement('canvas')
      patternCanvas.width = patternCanvas.height = 100
      const context = patternCanvas.getContext('2d')
      if (context) {
        context.fillStyle = color
        context.fillRect(0, 0, 100, 100)
        if (materialImg) {
          context.globalAlpha = opacity
          context.drawImage(materialImg, 0, 0, 100, 100)
        }
      }
      patternBrush.getPatternSrc = () => {
        return patternCanvas
      }
      patternBrush.getPatternSrcFunction = () => {
        return patternCanvas as unknown as string
      }
      paintBoard.canvas.freeDrawingBrush = patternBrush
      paintBoard.canvas.freeDrawingBrush.width = getDrawWidth()
      paintBoard.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
        blur: getShadowWidth(),
        offsetX: 0,
        offsetY: 0,
        color: useDrawStore.getState().shadowColor
      })
    }
  }

  loadImage(imageName: string) {
    return new Promise<boolean>((resolve) => {
      const img = new Image()
      img.src = formatPublicUrl(`pattern/${imageName}.png`)
      img.onload = () => {
        switch (imageName) {
          case MATERIAL_TYPE.CARBON:
            this.carbonImage = img
            break
          case MATERIAL_TYPE.CRAYON:
            this.crayonImage = img
            break
          case MATERIAL_TYPE.CLOTH:
            this.clothImage = img
            break
          case MATERIAL_TYPE.OIL:
            this.oilImage = img
            break
          case MATERIAL_TYPE.CRAYON_DARK:
            this.crayonDarkImage = img
            break
          default:
            break
        }
        resolve(true)
      }
      img.onerror = () => {
        resolve(false)
      }
    })
  }
}

export const material = new Material()
