import { fabric } from 'fabric'
import { formatPublicUrl } from '@/utils/index'
import { paintBoard } from '@/core/paintBoard'
import useDrawStore from '@/store/draw'
import useBoardStore from '@/store/board'
import { getDrawWidth } from '@/core/utils/draw'
import { getStrokeDashArray } from './utils'
import { shouldApplyMaterialBrush } from './materialBrush'

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
  private renderSerial = 0

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
    color
  }: {
    materialType?: string
    color?: string
  }) {
    if (!color) {
      const { currentDrawColor, drawColors } = useDrawStore.getState()
      color = drawColors[currentDrawColor]
    }

    const serial = ++this.renderSerial
    const canvas = paintBoard.canvas
    const generation = paintBoard.getLoadGeneration()
    this.initPromise?.then(() => {
      if (serial !== this.renderSerial) {
        return
      }
      if (
        !shouldApplyMaterialBrush({
          mode: useBoardStore.getState().mode,
          drawType: useBoardStore.getState().drawType,
          drawStyle: useDrawStore.getState().drawStyle,
          canvasMatches: !!canvas && paintBoard.canvas === canvas,
          generationMatches: paintBoard.getLoadGeneration() === generation
        })
      ) {
        return
      }
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

  renderMaterial(materialImg: HTMLImageElement | null, color: string) {
    if (paintBoard.canvas) {
      const patternBrush = new fabric.PatternBrush(paintBoard.canvas)
      const patternCanvas = document.createElement('canvas')
      patternCanvas.width = patternCanvas.height = 100
      const context = patternCanvas.getContext('2d')
      if (context) {
        context.fillStyle = color
        context.fillRect(0, 0, 100, 100)
        if (materialImg) {
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

      const strokeDashArray = getStrokeDashArray()
      paintBoard.canvas.freeDrawingBrush.strokeDashArray = strokeDashArray

      const { shadowOffsetX, shadowOffsetY, shadowColor, shadowBlur } =
        useDrawStore.getState()

      if (shadowBlur > 0) {
        paintBoard.canvas.freeDrawingBrush.shadow = new fabric.Shadow({
          blur: shadowBlur,
          offsetX: shadowOffsetX,
          offsetY: shadowOffsetY,
          color: shadowColor
        })
      }
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
