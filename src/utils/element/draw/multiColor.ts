import useDrawStore from '@/store/draw'
import { getDrawWidth, getShadowWidth } from '@/utils/common/draw'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'

const COLOR_WIDTH = 5

export const MultiColorType = {
  COL: 'col',
  ROW: 'row',
  CIRCLE: 'circle'
}

export const renderMultiColor = (params: {
  type?: string
  colors?: string[]
}) => {
  const canvas = paintBoard.canvas
  if (!canvas) {
    return
  }
  const colors = params?.colors ?? useDrawStore.getState().drawColors
  const type = params?.type ?? useDrawStore.getState().multiColorType

  const patternBrush = new fabric.PatternBrush(canvas)
  const patternCanvas = document.createElement('canvas')
  const context = patternCanvas.getContext('2d')
  if (context) {
    switch (type) {
      case MultiColorType.COL:
        renderCol(patternCanvas, context, colors)
        break
      case MultiColorType.ROW:
        renderRow(patternCanvas, context, colors)
        break
      case MultiColorType.CIRCLE:
        renderCircle(patternCanvas, context, colors)
        break
      default:
        break
    }

    patternBrush.getPatternSrc = () => {
      return patternCanvas
    }
    patternBrush.getPatternSrcFunction = () => {
      return patternCanvas as unknown as string
    }

    canvas.isDrawingMode = true
    canvas.freeDrawingBrush = patternBrush
    canvas.freeDrawingBrush.width = getDrawWidth()
    canvas.freeDrawingBrush.shadow = new fabric.Shadow({
      blur: getShadowWidth(),
      offsetX: 0,
      offsetY: 0,
      color: useDrawStore.getState().shadowColor
    })
  }
}

function renderCol(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  colors: string[]
) {
  canvas.width = COLOR_WIDTH * colors.length
  canvas.height = 20
  colors.forEach((color, i) => {
    context.fillStyle = color
    context.fillRect(COLOR_WIDTH * i, 0, COLOR_WIDTH, 20)
  })
}

function renderRow(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  colors: string[]
) {
  canvas.width = 20
  canvas.height = COLOR_WIDTH * colors.length
  colors.forEach((color, i) => {
    context.fillStyle = color
    context.fillRect(0, COLOR_WIDTH * i, 20, COLOR_WIDTH)
  })
}

function renderCircle(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  colors: string[]
) {
  const radius = 10
  const padding = 5
  const n = colors.length

  const canvasWidth = 2 * padding + n * radius * 2 + (n - 1) * padding
  canvas.width = canvasWidth
  canvas.height = radius * 2 + 2 * padding

  let x = padding + radius
  const y = padding + radius

  // render multi circle
  for (let i = 0; i < n; i++) {
    context.beginPath()
    context.fillStyle = colors[i]
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.closePath()
    context.fill()
    x += 2 * radius + padding
  }
}
