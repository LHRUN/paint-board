import { fabric } from 'fabric'
import { contentBounds, type MeasurableObject } from '@/core/export/bounds'
import { canvasToPngBlob } from '@/core/utils/canvasBlob'
import { prepareBoardFonts } from '@/core/font/googleFont'
import type { IFile } from '@/store/files'
import {
  fitContentFrame,
  shouldRetryThumbnailMeasure,
  type ThumbnailContentBounds
} from './frame'

type StaticCanvasWithSkip = fabric.StaticCanvas & {
  skipOffscreen?: boolean
}

const contentFrame = (
  canvas: fabric.StaticCanvas
): ThumbnailContentBounds | null => {
  try {
    return contentBounds(
      canvas.getObjects() as MeasurableObject[],
      1,
      [1, 0, 0, 1, 0, 0]
    )
  } catch (error) {
    console.error('Failed to measure thumbnail content', error)
    return null
  }
}

/**
 * Paint the drawn elements of one board on a temporary static canvas.
 * Board background color and image are not included.
 * The live editing canvas, its selection, and its viewport are not used.
 */
export const renderBoardThumbnail = async (
  file: IFile
): Promise<Blob | null> => {
  if (typeof document === 'undefined') {
    return null
  }

  const element = document.createElement('canvas')
  element.setAttribute('aria-hidden', 'true')
  element.style.position = 'fixed'
  element.style.left = '-10000px'
  element.style.top = '0'
  element.style.pointerEvents = 'none'
  document.body.appendChild(element)

  const staticCanvas = new fabric.StaticCanvas(element, {
    enableRetinaScaling: false,
    renderOnAddRemove: false,
    backgroundColor: ''
  }) as StaticCanvasWithSkip
  staticCanvas.skipOffscreen = false

  try {
    try {
      await prepareBoardFonts(file.boardData || {})
    } catch (error) {
      console.error('Failed to prepare thumbnail fonts', error)
    }

    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        reject(new Error('Timed out while loading the board thumbnail'))
      }, 15000)
      try {
        staticCanvas.loadFromJSON(file.boardData || {}, () => {
          window.clearTimeout(timer)
          resolve()
        })
      } catch (error) {
        window.clearTimeout(timer)
        reject(error)
      }
    })

    const frame = fitContentFrame(contentFrame(staticCanvas))
    if (!frame) {
      if (shouldRetryThumbnailMeasure(staticCanvas.getObjects())) {
        throw new Error('Could not measure board thumbnail content')
      }
      return null
    }

    staticCanvas.setWidth(frame.outputWidth)
    staticCanvas.setHeight(frame.outputHeight)
    staticCanvas.setViewportTransform([
      frame.scale,
      0,
      0,
      frame.scale,
      -frame.left * frame.scale,
      -frame.top * frame.scale
    ])
    staticCanvas.renderAll()

    const output = document.createElement('canvas')
    output.width = frame.outputWidth
    output.height = frame.outputHeight
    const ctx = output.getContext('2d')
    if (!ctx) {
      return null
    }
    ctx.drawImage(staticCanvas.getElement(), 0, 0)

    return await canvasToPngBlob(
      output,
      output.width,
      output.height,
      output.width,
      output.height
    )
  } finally {
    staticCanvas.dispose()
    element.remove()
  }
}
