import { fabric } from 'fabric'
import { paintBoard } from '../../paintBoard'
import { initCustomObjectAttr } from '../../utils/object'
import { limitImageDataUrl } from '../../utils/imageLimit'
import {
  canWriteFile,
  shouldCommitDeferredCanvasWrite
} from '../../session/canvasWrite'
import { ActionMode, ELEMENT_CUSTOM_TYPE } from '@/constants'
import useBoardStore from '@/store/board'
import {
  dropCenters,
  fitCanvasImageScale,
  imageOriginAtCenter
} from './placement'

const loadFabricImage = (src: string) => {
  return new Promise<fabric.Image | null>((resolve) => {
    fabric.Image.fromURL(
      src,
      (img) => {
        resolve(img?.width ? img : null)
      },
      { crossOrigin: 'anonymous' }
    )
  })
}

const SCREEN_STAGGER = 36

export class ImageElement {
  image: fabric.Image | null = null

  /** Click upload and paste keep the viewport-center placement. */
  async addImage(data: string) {
    return this.addImagesAt([data])
  }

  /**
   * Add every image in one history step.
   * With `origin`, that point is the center of a single image, or the middle
   * of a staggered group.
   */
  async addImagesAt(sources: string[], origin?: { x: number; y: number }) {
    const canvas = paintBoard.canvas
    const generation = paintBoard.getLoadGeneration()
    const fileId = paintBoard.canvasFileId
    const stillCurrent = () =>
      shouldCommitDeferredCanvasWrite({
        canvasMatches: !!canvas && paintBoard.canvas === canvas,
        generationMatches: paintBoard.getLoadGeneration() === generation,
        canWrite: canWriteFile(paintBoard.canvasFileId, fileId),
        historyApplying: paintBoard.history?.isApplying() ?? false
      })
    if (!canvas || !stillCurrent() || !sources.length) {
      return 0
    }

    const loaded: fabric.Image[] = []
    for (const source of sources) {
      if (!stillCurrent()) {
        return 0
      }
      const limited = await limitImageDataUrl(source)
      if (!stillCurrent()) {
        return 0
      }
      const img = await loadFabricImage(limited)
      if (!img || !stillCurrent()) {
        continue
      }
      img.scale(
        fitCanvasImageScale(
          img.width || 1,
          img.height || 1,
          canvas.getWidth(),
          canvas.getHeight()
        )
      )
      loaded.push(img)
    }

    if (!loaded.length || !stillCurrent()) {
      return 0
    }

    const zoom = canvas.getZoom() || 1
    const centers = origin
      ? dropCenters(
          loaded.map((img) => ({
            width: img.getScaledWidth(),
            height: img.getScaledHeight()
          })),
          origin,
          SCREEN_STAGGER / zoom
        )
      : loaded.map(() => canvas.getVpCenter())

    loaded.forEach((img, index) => {
      img.set(
        imageOriginAtCenter(
          centers[index],
          img.getScaledWidth(),
          img.getScaledHeight()
        )
      )
      initCustomObjectAttr(img, ELEMENT_CUSTOM_TYPE.IMAGE)
      canvas.add(img)
    })

    paintBoard.render()
    useBoardStore.getState().updateMode(ActionMode.SELECT)
    canvas.setActiveObject(loaded[loaded.length - 1])
    return loaded.length
  }
}

export function renderImageFilters(image: fabric.Image, filterType: string) {
  const findFilterIndex =
    image.filters?.findIndex((item) => (item as any)?.type === filterType) ?? -1

  if (findFilterIndex > -1) {
    image.filters?.splice(findFilterIndex, 1)
  } else {
    switch (filterType) {
      case 'Grayscale':
        image.filters?.push(new fabric.Image.filters.Grayscale())
        break
      case 'Invert':
        image.filters?.push(new fabric.Image.filters.Invert())
        break
      case 'BlackWhite':
        image.filters?.push(new fabric.Image.filters.BlackWhite())
        break
      case 'Sepia':
        image.filters?.push(new fabric.Image.filters.Sepia())
        break
      case 'Blur':
        image.filters?.push(
          new fabric.Image.filters.Blur({
            blur: 0.5
          })
        )
        break
      case 'Vintage':
        image.filters?.push(new fabric.Image.filters.Vintage())
        break
      case 'BlendColor':
        image.filters?.push(
          new fabric.Image.filters.BlendColor({
            color: '#66CC89',
            mode: 'diff'
          })
        )
        break
      case 'Brownie':
        image.filters?.push(new fabric.Image.filters.Brownie())
        break
      case 'Kodachrome':
        image.filters?.push(new fabric.Image.filters.Kodachrome())
        break
      case 'Pixelate':
        image.filters?.push(new fabric.Image.filters.Pixelate())
        break
      case 'Polaroid':
        image.filters?.push(new fabric.Image.filters.Polaroid())
        break
      case 'Technicolor':
        image.filters?.push(new fabric.Image.filters.Technicolor())
        break
      case 'Brightness':
        image.filters?.push(
          new fabric.Image.filters.Brightness({
            brightness: 0.6
          })
        )
        break
      case 'Noise':
        image.filters?.push(
          new fabric.Image.filters.Noise({
            noise: 100
          })
        )
        break
      case 'Convolute':
        image.filters?.push(
          new fabric.Image.filters.Convolute({
            matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1]
          })
        )
        break
      default:
        break
    }
  }

  image.applyFilters()
}
