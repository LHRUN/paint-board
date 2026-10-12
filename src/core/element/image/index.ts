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

export class ImageElement {
  image: fabric.Image | null = null

  async addImage(data: string) {
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
    if (!canvas || !stillCurrent()) {
      return
    }
    const limited = await limitImageDataUrl(data)
    if (!stillCurrent()) {
      return
    }
    fabric.Image.fromURL(
      limited,
      (img) => {
        if (!stillCurrent()) {
          return
        }
        const viewportCenter = canvas.getVpCenter()

        // get scaling
        const scaleX = canvas.getWidth() / 2 / (img?.width || 1)
        const scaleY = canvas.getHeight() / 2 / (img?.height || 1)
        const scale = Math.min(scaleX, scaleY, 1) // Make sure the image is not larger than the original size

        img.scale(scale)

        // set image position
        img.set({
          left: viewportCenter.x - img.getScaledWidth() / 2,
          top: viewportCenter.y - img.getScaledHeight() / 2
        })

        initCustomObjectAttr(img, ELEMENT_CUSTOM_TYPE.IMAGE)

        canvas.add(img)
        paintBoard.render()
        useBoardStore.getState().updateMode(ActionMode.SELECT)
        canvas.setActiveObject(img)
      },
      {
        crossOrigin: 'anonymous'
      }
    )
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
