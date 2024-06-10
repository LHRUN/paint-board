import { paintBoard } from '../paintBoard'
import { fabric } from 'fabric'
import useBoardStore from '@/store/board'

export const handleBackgroundImageWhenCanvasSizeChange = (isRender = true) => {
  const backgroundImage = paintBoard?.canvas?.backgroundImage as fabric.Image
  if (backgroundImage) {
    updateCanvasBackgroundImageRect(backgroundImage)
    if (isRender) {
      paintBoard.canvas?.requestRenderAll()
    }
  }
}

export const updateCanvasBackgroundImage = (data: string) => {
  const canvas = paintBoard.canvas
  if (!canvas) {
    return
  }
  fabric.Image.fromURL(
    data,
    (image) => {
      updateCanvasBackgroundImageRect(image)

      canvas.setBackgroundImage(image, () => {
        paintBoard.render()
      })
    },
    {
      crossOrigin: 'anonymous'
    }
  )
}

export const updateCanvasBackgroundImageRect = (image: fabric.Image) => {
  const canvas = paintBoard?.canvas
  if (!canvas) {
    return
  }

  const canvasWidth = canvas.getWidth()
  const canvasHeight = canvas.getHeight()

  const imgWidth = image.width as number
  const imgHeight = image.height as number

  const scaleWidth = canvasWidth / imgWidth
  const scaleHeight = canvasHeight / imgHeight

  const scale = Math.min(scaleWidth, scaleHeight)
  image.scale(scale)

  const imgLeft = canvasWidth / 2 - (imgWidth * scale) / 2
  const imgTop = canvasHeight / 2 - (imgHeight * scale) / 2

  image.set({
    left: imgLeft,
    top: imgTop,
    originX: 'left',
    originY: 'top',
    opacity: useBoardStore.getState().backgroundImageOpacity
  })
}
