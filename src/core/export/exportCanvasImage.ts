import { fabric } from 'fabric'
import { prepareCanvasTextForExport } from '@/core/font/applyFont'
import { drawBackground } from '@/components/background/backgroundColor/utils'
import { drawBackgroundImage } from '@/components/background/backgroundImage/utils'
import {
  boundsAroundInk,
  chooseExportMultiplier,
  CONTENT_PADDING,
  contentBounds,
  intersectVisibleCanvas,
  opaqueBounds,
  outputPixelSize,
  withinExportLimit,
  type Bounds,
  type MeasurableObject
} from './bounds'
import { EXPORT_TOO_LARGE_ERROR } from './exportError'

export type ExportScope = 'viewport' | 'content' | 'selection'

export interface ExportBackground {
  sort: string[]
  color: string | null
  imageUrl: string
  imageOpacity: number
  cameraFrame: string | null
  cameraOpacity: number
}

/** Where the full canvas background sits relative to the exported image. */
export interface ExportBackgroundFrame {
  width: number
  height: number
  offsetX: number
  offsetY: number
}

export interface ExportImageResult {
  url: string
  background: ExportBackground | null
  backgroundFrame: ExportBackgroundFrame | null
}

const paintBackground = async (
  ctx: CanvasRenderingContext2D,
  background: ExportBackground,
  width: number,
  height: number
) => {
  const layers = [...background.sort].reverse()
  for (let i = 0; i < layers.length; i++) {
    const type = layers[i]
    if (type === 'image' && background.imageUrl) {
      await drawBackgroundImage(
        ctx,
        background.imageUrl,
        background.imageOpacity,
        width,
        height
      )
    } else if (type === 'color' && background.color) {
      drawBackground(ctx, background.color, width, height)
    } else if (type === 'camera' && background.cameraFrame) {
      await drawBackgroundImage(
        ctx,
        background.cameraFrame,
        background.cameraOpacity,
        width,
        height
      )
    }
  }
}

const compositeImage = async (
  foreground: CanvasImageSource,
  sourceX: number,
  sourceY: number,
  sourceWidth: number,
  sourceHeight: number,
  outputWidth: number,
  outputHeight: number,
  background: ExportBackground,
  backgroundWidth: number,
  backgroundHeight: number,
  offsetX: number,
  offsetY: number
) => {
  const output = document.createElement('canvas')
  output.width = outputWidth
  output.height = outputHeight
  const ctx = output.getContext('2d')
  if (!ctx) {
    throw new Error('No 2d context')
  }

  ctx.save()
  ctx.translate(offsetX, offsetY)
  await paintBackground(ctx, background, backgroundWidth, backgroundHeight)
  ctx.restore()
  ctx.drawImage(
    foreground,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    outputWidth,
    outputHeight
  )
  return output.toDataURL('image/png')
}

const loadImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Failed to load export image'))
    image.src = url
  })

/**
 * Paint the canvas background under an already exported foreground.
 * The foreground itself stays transparent until the modal asks for this.
 */
export const applyExportBackground = async (
  foregroundUrl: string,
  background: ExportBackground,
  frame: ExportBackgroundFrame
) => {
  const image = await loadImage(foregroundUrl)
  return compositeImage(
    image,
    0,
    0,
    image.naturalWidth,
    image.naturalHeight,
    image.naturalWidth,
    image.naturalHeight,
    background,
    frame.width,
    frame.height,
    frame.offsetX,
    frame.offsetY
  )
}

const transparentResult = (image: HTMLCanvasElement): ExportImageResult => ({
  url: image.toDataURL('image/png'),
  background: null,
  backgroundFrame: null
})

/**
 * Paint objects into an offscreen canvas. The live canvas keeps its viewport,
 * selection, and upper context, so guide-line rendering is not disturbed.
 */
const renderObjects = (
  canvas: fabric.Canvas,
  objects: fabric.Object[],
  crop: Bounds,
  multiplier: number
) => {
  const pixelWidth = Math.max(1, Math.ceil(crop.width * multiplier))
  const pixelHeight = Math.max(1, Math.ceil(crop.height * multiplier))
  const element = document.createElement('canvas')
  element.width = pixelWidth
  element.height = pixelHeight
  const ctx = element.getContext('2d')
  if (!ctx) {
    throw new Error('No 2d context')
  }

  const viewport = canvas.viewportTransform || [1, 0, 0, 1, 0, 0]
  const previousSkip = canvas.skipOffscreen
  canvas.skipOffscreen = false
  try {
    ctx.setTransform(
      viewport[0] * multiplier,
      viewport[1] * multiplier,
      viewport[2] * multiplier,
      viewport[3] * multiplier,
      (viewport[4] - crop.left) * multiplier,
      (viewport[5] - crop.top) * multiplier
    )
    objects.forEach((obj) => {
      obj.render(ctx)
    })
  } finally {
    canvas.skipOffscreen = previousSkip === undefined ? true : previousSkip
  }
  return element
}

/**
 * Drop transparent margins, then add a small padding around the painted pixels.
 */
const frameInk = (
  rendered: HTMLCanvasElement,
  crop: Bounds,
  multiplier: number
) => {
  const ctx = rendered.getContext('2d')
  if (!ctx) {
    return { image: rendered, crop }
  }
  const pixels = ctx.getImageData(0, 0, rendered.width, rendered.height)
  const ink = opaqueBounds(pixels.data, rendered.width, rendered.height)
  if (!ink) {
    return { image: rendered, crop }
  }

  let padding = CONTENT_PADDING
  let framed = boundsAroundInk(crop, ink, multiplier, padding)
  let size = outputPixelSize(framed.width, framed.height, multiplier)
  while (padding > 0 && !withinExportLimit(size.width, size.height)) {
    padding = Math.floor(padding / 2)
    framed = boundsAroundInk(crop, ink, multiplier, padding)
    size = outputPixelSize(framed.width, framed.height, multiplier)
  }
  if (!withinExportLimit(size.width, size.height)) {
    return { image: rendered, crop }
  }

  const pad = Math.round(padding * multiplier)
  const image = document.createElement('canvas')
  image.width = ink.width + pad * 2
  image.height = ink.height + pad * 2
  const framedCtx = image.getContext('2d')
  if (!framedCtx) {
    return { image: rendered, crop }
  }
  framedCtx.drawImage(
    rendered,
    ink.left,
    ink.top,
    ink.width,
    ink.height,
    pad,
    pad,
    ink.width,
    ink.height
  )
  return {
    image,
    crop: boundsAroundInk(crop, ink, multiplier, pad / multiplier)
  }
}

const exportViewport = (
  canvas: fabric.Canvas,
  background: ExportBackground
): ExportImageResult => {
  const lower = canvas.getElement()
  const cssWidth = canvas.getWidth()
  const cssHeight = canvas.getHeight()
  if (!lower.width || !lower.height || !cssWidth || !cssHeight) {
    throw new Error('Canvas is empty')
  }

  const view = intersectVisibleCanvas(
    cssWidth,
    cssHeight,
    window.innerWidth,
    window.innerHeight
  )
  const ratioX = lower.width / cssWidth
  const ratioY = lower.height / cssHeight
  const outputWidth = Math.max(1, Math.round(view.width * ratioX))
  const outputHeight = Math.max(1, Math.round(view.height * ratioY))
  if (!withinExportLimit(outputWidth, outputHeight)) {
    throw new Error(EXPORT_TOO_LARGE_ERROR)
  }

  const output = document.createElement('canvas')
  output.width = outputWidth
  output.height = outputHeight
  const ctx = output.getContext('2d')
  if (!ctx) {
    throw new Error('No 2d context')
  }
  ctx.drawImage(
    lower,
    view.left * ratioX,
    view.top * ratioY,
    view.width * ratioX,
    view.height * ratioY,
    0,
    0,
    outputWidth,
    outputHeight
  )
  return {
    url: output.toDataURL('image/png'),
    background,
    backgroundFrame: {
      width: lower.width,
      height: lower.height,
      offsetX: -view.left * ratioX,
      offsetY: -view.top * ratioY
    }
  }
}

const exportObjectRegion = (
  canvas: fabric.Canvas,
  crop: Bounds,
  objects: fabric.Object[]
) => {
  const lower = canvas.getElement()
  const cssWidth = canvas.getWidth() || 1
  const retina = lower.width > 0 ? lower.width / cssWidth : 1
  const multiplier = chooseExportMultiplier(crop.width, crop.height, retina)
  if (!multiplier) {
    throw new Error(EXPORT_TOO_LARGE_ERROR)
  }

  const rendered = renderObjects(canvas, objects, crop, multiplier)
  const framed = frameInk(rendered, crop, multiplier)
  return transparentResult(framed.image)
}

export const exportCanvasImage = async (
  canvas: fabric.Canvas,
  scope: ExportScope,
  background: ExportBackground
): Promise<ExportImageResult> => {
  try {
    await prepareCanvasTextForExport(canvas)
  } catch (error) {
    console.error('Failed to prepare fonts for export', error)
  }

  if (scope === 'viewport') {
    return exportViewport(canvas, background)
  }

  if (scope === 'selection') {
    const active = canvas.getActiveObject()
    if (!active) {
      throw new Error('No selection')
    }
    const bounds = contentBounds(
      [active as MeasurableObject],
      canvas.getZoom(),
      canvas.viewportTransform
    )
    if (!bounds) {
      throw new Error('Empty selection')
    }
    return exportObjectRegion(canvas, bounds, [active])
  }

  const bounds = contentBounds(
    canvas.getObjects() as MeasurableObject[],
    canvas.getZoom(),
    canvas.viewportTransform
  )
  if (!bounds) {
    return exportViewport(canvas, background)
  }
  return exportObjectRegion(canvas, bounds, canvas.getObjects())
}
