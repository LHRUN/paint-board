import { describe, expect, it } from 'vitest'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import { DrawLineType } from '@/constants/draw'
import {
  brushDashArray,
  editedColors,
  paintLineStyle,
  paintObjectColor,
  paintOutlineStroke,
  selectionEdit,
  shapeDashArray,
  sharedLineStyle,
  type Editable
} from './paint'

const group = (customType: string, children: Editable[]): Editable => ({
  type: 'group',
  _customType: customType,
  _objects: children
})

describe('selection edit capabilities', () => {
  it('edits a basic brush color and dash, and ignores pattern strokes', () => {
    const basic: Editable = { type: 'path', stroke: '#111111', strokeWidth: 10 }
    const pattern: Editable = { type: 'path', stroke: { type: 'pattern' } }

    expect(selectionEdit([basic])).toEqual({ color: 'draw', line: 'brush' })
    expect(selectionEdit([pattern])).toEqual({ color: null, line: null })
    expect(selectionEdit([basic, pattern])).toEqual({ color: null, line: null })
  })

  it('shares draw color across brush groups and hides dash when any object lacks it', () => {
    const thorn = group(ELEMENT_CUSTOM_TYPE.THORN, [])
    const basic: Editable = { type: 'path', stroke: '#111111' }

    expect(selectionEdit([thorn])).toEqual({ color: 'draw', line: null })
    expect(selectionEdit([basic, thorn])).toEqual({ color: 'draw', line: null })
  })

  it('shares shape stroke color and only offers dash for lines and arrows', () => {
    const line: Editable = {
      type: 'polyline',
      _customType: ELEMENT_CUSTOM_TYPE.SHAPE_LINE
    }
    const arrow: Editable = {
      type: 'path',
      _customType: ELEMENT_CUSTOM_TYPE.SHAPE_ARROW_LINE
    }
    const rect = group(ELEMENT_CUSTOM_TYPE.SHAPE_RECTANGLE, [])

    expect(selectionEdit([line, arrow])).toEqual({
      color: 'shape',
      line: 'shape'
    })
    expect(selectionEdit([line, rect])).toEqual({ color: 'shape', line: null })
    expect(selectionEdit([rect])).toEqual({ color: 'shape', line: null })
  })

  it('hides controls when the selection mixes palettes or unsupported objects', () => {
    const basic: Editable = { type: 'path', stroke: '#111111' }
    const line: Editable = { _customType: ELEMENT_CUSTOM_TYPE.SHAPE_LINE }
    const graph = group(ELEMENT_CUSTOM_TYPE.SHAPE_GRAPH, [])
    const rainbow = group(ELEMENT_CUSTOM_TYPE.RAINBOW, [])

    expect(selectionEdit([basic, line])).toEqual({ color: null, line: null })
    expect(selectionEdit([graph, rainbow])).toEqual({ color: null, line: null })
    expect(selectionEdit([])).toEqual({ color: null, line: null })
  })

  it('treats input text and the text brush as one color edit', () => {
    const input: Editable = { type: 'i-text', fill: '#000000' }
    const drawn = group(ELEMENT_CUSTOM_TYPE.DRAW_TEXT, [])

    expect(selectionEdit([input, drawn])).toEqual({ color: 'text', line: null })
  })
})

describe('paint object color', () => {
  it('recolors nested strokes and keeps thorn opacity', () => {
    const segment = { type: 'line', stroke: '#111111' }
    const multiLine = group(ELEMENT_CUSTOM_TYPE.MULTI_LINE, [
      group('inner', [segment])
    ])
    const leaf = { type: 'ellipse', fill: '#111111', opacity: 0.25 }
    const thorn = group(ELEMENT_CUSTOM_TYPE.THORN, [leaf])

    expect(paintObjectColor(multiLine, '#65CC8A')).toBe(true)
    expect(segment.stroke).toBe('#65CC8A')
    expect(paintObjectColor(thorn, '#FF6363')).toBe(true)
    expect(leaf.fill).toBe('#FF6363')
    expect(leaf.opacity).toBe(0.25)
  })

  it('recolors multi-point fills and strokes, and wiggle strokes only', () => {
    const dot = { type: 'circle', fill: '#111111' }
    const link = { type: 'line', stroke: '#111111' }
    const points = group(ELEMENT_CUSTOM_TYPE.MULTI_POINT, [
      group('inner', [dot, link])
    ])
    const arc = { type: 'circle', stroke: '#111111', fill: '' }
    const wiggle = group(ELEMENT_CUSTOM_TYPE.WIGGLE, [arc])

    paintObjectColor(points, '#3A59D1')
    paintObjectColor(wiggle, '#3A59D1')

    expect(dot.fill).toBe('#3A59D1')
    expect(link.stroke).toBe('#3A59D1')
    expect(arc.stroke).toBe('#3A59D1')
    expect(arc.fill).toBe('')
  })

  it('recolors a freehand fill and does not treat it as a dashed brush', () => {
    const pen: Editable = {
      type: 'path',
      _customType: ELEMENT_CUSTOM_TYPE.FREEHAND,
      fill: '#111111',
      strokeWidth: 0
    }
    const basic: Editable = { type: 'path', stroke: '#111111' }

    expect(selectionEdit([pen])).toEqual({ color: 'draw', line: null })
    expect(selectionEdit([pen, basic])).toEqual({ color: 'draw', line: null })
    expect(paintObjectColor(pen, '#65CC8A')).toBe(true)
    expect(pen.fill).toBe('#65CC8A')
    expect(editedColors(pen)).toEqual(['#65CC8A'])
  })

  it('recolors an outlined pen fill and stroke separately', () => {
    const pen: Editable = {
      type: 'path',
      _customType: ELEMENT_CUSTOM_TYPE.FREEHAND_STROKE,
      fill: '#111111',
      stroke: '#FF6363',
      strokeWidth: 2
    }

    expect(selectionEdit([pen])).toEqual({ color: 'draw', line: null })
    expect(paintObjectColor(pen, '#65CC8A')).toBe(true)
    expect(pen.fill).toBe('#65CC8A')
    expect(pen.stroke).toBe('#FF6363')
    expect(paintOutlineStroke(pen, '#000000')).toBe(true)
    expect(pen.stroke).toBe('#000000')
    expect(editedColors(pen)).toEqual(['#65CC8A'])

    pen.strokeWidth = 0
    expect(paintOutlineStroke(pen, '#FFFFFF')).toBe(false)
    expect(pen.stroke).toBe('#000000')
  })

  it('recolors ink lines and splashes with one brush color', () => {
    const line: Editable = { type: 'line', stroke: '#111111' }
    const dot: Editable = { type: 'circle', fill: '#111111' }
    const ink = group(ELEMENT_CUSTOM_TYPE.INK, [line, dot])

    expect(selectionEdit([ink])).toEqual({ color: 'draw', line: null })
    expect(paintObjectColor(ink, '#65CC8A')).toBe(true)
    expect(line.stroke).toBe('#65CC8A')
    expect(dot.fill).toBe('#65CC8A')
    expect(editedColors(ink)).toEqual(['#65CC8A', '#65CC8A'])
  })

  it('recolors only the outline of a closed shape', () => {
    const hatch = { type: 'path', stroke: '#ff0000', fill: 'transparent' }
    const outline = { type: 'path', stroke: '#111111', fill: 'transparent' }
    const rect = group(ELEMENT_CUSTOM_TYPE.SHAPE_RECTANGLE, [hatch, outline])

    expect(paintObjectColor(rect, '#65CC8A')).toBe(true)
    expect(editedColors(rect)).toEqual(['#65CC8A'])
    expect(hatch.stroke).toBe('#ff0000')
    expect(hatch.fill).toBe('transparent')
    expect(outline.stroke).toBe('#65CC8A')
  })

  it('recolors text-brush letters and leaves input text to its own fill helper', () => {
    const letter = { type: 'text', fill: '#111111' }
    const drawn = group(ELEMENT_CUSTOM_TYPE.DRAW_TEXT, [letter])
    const input: Editable = { type: 'i-text', fill: '#111111' }

    expect(paintObjectColor(drawn, '#000000')).toBe(true)
    expect(letter.fill).toBe('#000000')
    expect(paintObjectColor(input, '#FF6363')).toBe(false)
    expect(input.fill).toBe('#111111')
  })
})

describe('line style', () => {
  it('builds brush and shape dashes from the object stroke width', () => {
    expect(brushDashArray(DrawLineType.Dashed, 10)).toEqual([30, 20])
    expect(brushDashArray(DrawLineType.Dotted, 10)).toEqual([5, 12.5])
    expect(brushDashArray(DrawLineType.Solid, 10)).toBeNull()
    expect(shapeDashArray(DrawLineType.Dashed, 3)).toEqual([24, 16])
    expect(shapeDashArray(DrawLineType.Dotted, 3)).toEqual([8, 24])
  })

  it('applies and clears dash without touching closed shapes', () => {
    const brush: Editable = {
      type: 'path',
      stroke: '#111111',
      strokeWidth: 10,
      strokeDashArray: [30, 20]
    }
    const line: Editable = {
      type: 'polyline',
      _customType: ELEMENT_CUSTOM_TYPE.SHAPE_LINE,
      stroke: '#111111',
      strokeWidth: 3
    }
    const rect = group(ELEMENT_CUSTOM_TYPE.SHAPE_RECTANGLE, [
      { type: 'path', stroke: '#111111' }
    ])

    expect(sharedLineStyle([brush])).toBe('dashed')
    expect(paintLineStyle(brush, DrawLineType.Solid)).toBe(true)
    expect(brush.strokeDashArray).toBeNull()
    expect(paintLineStyle(line, DrawLineType.Dotted)).toBe(true)
    expect(line.strokeDashArray).toEqual([8, 24])
    expect(paintLineStyle(rect, DrawLineType.Dashed)).toBe(false)
  })
})
