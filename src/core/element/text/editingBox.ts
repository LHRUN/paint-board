import { fabric } from 'fabric'
import {
  editingOverflowFromMetrics,
  unionOverflow,
  type BoxOverflow
} from './editingOverflow'

type SelectionBounds = {
  left: number
  top: number
}

type MeasuredText = fabric.IText & {
  __editingLines?: BoxOverflow[]
  __editingBorderOverflow?: BoxOverflow
  __editingBoxToken?: number
  __editingBoxBound?: boolean
  _fontSizeMult?: number
  _getFontDeclaration: () => string
  _getLineLeftOffset?: (lineIndex: number) => number
  get2DCursorLocation: (index?: number) => {
    lineIndex: number
    charIndex: number
  }
  inCompositionMode?: boolean
  direction?: string
}

const noOverflow: BoxOverflow = { left: 0, right: 0, top: 0, bottom: 0 }

let patchInstalled = false

const installEditingBoxPatch = () => {
  if (patchInstalled) {
    return
  }
  patchInstalled = true
  const proto = fabric.IText.prototype as MeasuredText & {
    renderSelection: (
      boundaries: unknown,
      ctx: CanvasRenderingContext2D
    ) => void
    renderCursor: (boundaries: unknown, ctx: CanvasRenderingContext2D) => void
    drawBorders: (ctx: CanvasRenderingContext2D, styleOverride?: object) => void
  }
  const originalSelection = proto.renderSelection
  const originalCursor = proto.renderCursor
  const originalBorders = proto.drawBorders

  proto.renderSelection = function (bounds, ctx) {
    const text = this as MeasuredText
    const lines = text.__editingLines
    if (!lines?.length || text.inCompositionMode) {
      originalSelection.call(this, bounds, ctx)
      return
    }
    const boundaries = bounds as SelectionBounds
    const fillRect = ctx.fillRect.bind(ctx)
    let nextLine = text.get2DCursorLocation(text.selectionStart).lineIndex
    ctx.fillRect = (x, y, w, h) => {
      const line = nextLine
      nextLine += 1
      const overflow = lines[line] || noOverflow
      let extraLeft = 0
      let extraRight = 0
      if (text.direction === 'rtl') {
        extraLeft = overflow.left
        extraRight = overflow.right
      } else {
        const lineLeft =
          boundaries.left + (text._getLineLeftOffset?.(line) || 0)
        const lineWidth = text.getLineWidth?.(line) || 0
        if (x <= lineLeft + 0.5) {
          extraLeft = overflow.left
        }
        if (x + w >= lineLeft + lineWidth - 0.5) {
          extraRight = overflow.right
        }
      }
      fillRect(
        x - extraLeft,
        y - overflow.top,
        w + extraLeft + extraRight,
        h + overflow.top + overflow.bottom
      )
    }
    try {
      originalSelection.call(this, bounds, ctx)
    } finally {
      ctx.fillRect = fillRect
    }
  }

  proto.renderCursor = function (bounds, ctx) {
    const text = this as MeasuredText
    const lineIndex = text.get2DCursorLocation?.().lineIndex ?? 0
    const overflow = text.__editingLines?.[lineIndex]
    if (!overflow || text.inCompositionMode) {
      originalCursor.call(this, bounds, ctx)
      return
    }
    const fillRect = ctx.fillRect.bind(ctx)
    ctx.fillRect = (x, y, w, h) => {
      fillRect(x, y - overflow.top, w, h + overflow.top + overflow.bottom)
    }
    try {
      originalCursor.call(this, bounds, ctx)
    } finally {
      ctx.fillRect = fillRect
    }
  }

  proto.drawBorders = function (this: fabric.IText, ctx, styleOverride) {
    const text = this as MeasuredText
    const overflow = text.isEditing ? text.__editingBorderOverflow : undefined
    if (
      !overflow ||
      !(overflow.left || overflow.right || overflow.top || overflow.bottom)
    ) {
      return originalBorders.call(this, ctx, styleOverride)
    }
    const zoom = this.canvas?.getZoom() || 1
    const left = overflow.left * (this.scaleX || 1) * zoom
    const right = overflow.right * (this.scaleX || 1) * zoom
    const top = overflow.top * (this.scaleY || 1) * zoom
    const bottom = overflow.bottom * (this.scaleY || 1) * zoom
    const strokeRect = ctx.strokeRect.bind(ctx)
    ctx.strokeRect = (x, y, w, h) => {
      strokeRect(x - left, y - top, w + left + right, h + top + bottom)
    }
    try {
      return originalBorders.call(this, ctx, styleOverride)
    } finally {
      ctx.strokeRect = strokeRect
    }
  } as typeof proto.drawBorders
}

const lineAdvance = (textObj: MeasuredText, lineIndex: number) =>
  textObj.getLineWidth?.(lineIndex) || 0

const measureEditingOverflow = (textObj: fabric.IText) => {
  const measured = textObj as MeasuredText
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context || !measured._getFontDeclaration) {
    return { lines: [] as BoxOverflow[], border: noOverflow }
  }
  context.font = measured._getFontDeclaration()
  const sample = context.measureText('Hg')
  const fontAscent = sample.fontBoundingBoxAscent
  const fontDescent = sample.fontBoundingBoxDescent
  const fontSize = measured.fontSize || 0
  const fontSizeMult = measured._fontSizeMult || 1.13
  const textLines = measured.textLines?.length
    ? measured.textLines
    : [measured.text || '']
  const objectWidth = measured.width || 0
  const lines = textLines.map((line, index) => {
    const content = line || ' '
    const metrics = context.measureText(content)
    const inkLeft = metrics.actualBoundingBoxLeft || 0
    const inkRight = line ? metrics.actualBoundingBoxRight || 0 : 0
    const lineLeft = measured._getLineLeftOffset?.(index) || 0
    // actualBoundingBox misses some display-font swashes. The font box
    // covers them; per-string ink is still used when it is larger.
    const ascent = Math.max(
      metrics.actualBoundingBoxAscent || 0,
      fontAscent || 0
    )
    const descent = Math.max(
      metrics.actualBoundingBoxDescent || 0,
      fontDescent || 0
    )
    return {
      selection: editingOverflowFromMetrics({
        fontSize,
        fontSizeMult,
        advanceWidth: line ? lineAdvance(measured, index) : 0,
        actualBoundingBoxLeft: inkLeft,
        actualBoundingBoxRight: inkRight,
        fontBoundingBoxAscent: ascent,
        fontBoundingBoxDescent: descent
      }),
      border: editingOverflowFromMetrics({
        fontSize,
        fontSizeMult,
        advanceWidth: objectWidth,
        actualBoundingBoxLeft: inkLeft - lineLeft,
        actualBoundingBoxRight: lineLeft + inkRight,
        fontBoundingBoxAscent: ascent,
        fontBoundingBoxDescent: descent
      })
    }
  })
  return {
    lines: lines.map((line) => line.selection),
    border: unionOverflow(lines.map((line) => line.border))
  }
}

export const refreshEditingBox = async (textObj: fabric.IText) => {
  installEditingBoxPatch()
  const measured = textObj as MeasuredText
  const token = (measured.__editingBoxToken || 0) + 1
  measured.__editingBoxToken = token
  const declaration = measured._getFontDeclaration?.()
  if (declaration && document.fonts?.load) {
    const loaded = document.fonts
      .load(declaration, measured.text || 'Hg')
      .catch(() => undefined)
    await Promise.race([
      loaded,
      new Promise((resolve) => {
        window.setTimeout(resolve, 1200)
      })
    ])
    void loaded.then(() => {
      if (measured.__editingBoxToken === token && measured.canvas) {
        applyEditingOverflow(measured)
      }
    })
  }
  if (measured.__editingBoxToken !== token || !measured.canvas) {
    return
  }
  applyEditingOverflow(measured)
}

const applyEditingOverflow = (textObj: MeasuredText) => {
  if (!textObj.canvas) {
    return
  }
  textObj.initDimensions()
  const measuredOverflow = measureEditingOverflow(textObj)
  textObj.__editingLines = measuredOverflow.lines
  textObj.__editingBorderOverflow = measuredOverflow.border
  textObj.setCoords()
  textObj.dirty = true
  if (textObj.isEditing) {
    textObj.renderCursorOrSelection()
  }
  textObj.canvas.requestRenderAll()
}

export const bindEditingBox = (textObj: fabric.IText) => {
  const measured = textObj as MeasuredText
  if (measured.__editingBoxBound || textObj.type !== 'i-text') {
    return
  }
  measured.__editingBoxBound = true
  textObj.on('changed', () => {
    void refreshEditingBox(textObj)
  })
  void refreshEditingBox(textObj)
}
