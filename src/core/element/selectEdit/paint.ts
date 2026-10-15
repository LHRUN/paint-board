import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import { DrawLineType } from '@/constants/draw'

/**
 * Select-mode edits for colors and dash styles already stored on objects.
 * Closed shapes keep Rough.js path order: fill geometry first, outline last.
 * Fill style, material patterns, and brush-type changes are out of scope.
 */
export type Editable = {
  type?: string
  _customType?: string
  stroke?: unknown
  fill?: unknown
  opacity?: number
  strokeWidth?: number
  strokeDashArray?: number[] | null
  dirty?: boolean
  _objects?: Editable[]
  getObjects?: () => Editable[]
  set?: (props: Record<string, unknown>) => unknown
}

export type ColorEdit = 'draw' | 'shape' | 'text'
export type LineEdit = 'brush' | 'shape'
export type LineStyleName = 'solid' | 'dashed' | 'dotted'

export type SelectionEdit = {
  color: ColorEdit | null
  line: LineEdit | null
}

const DRAW_COLOR_GROUPS = new Set<string>([
  ELEMENT_CUSTOM_TYPE.MULTI_LINE,
  ELEMENT_CUSTOM_TYPE.RETICULATE,
  ELEMENT_CUSTOM_TYPE.MULTI_POINT,
  ELEMENT_CUSTOM_TYPE.WIGGLE,
  ELEMENT_CUSTOM_TYPE.THORN
])

const SHAPE_LINES = new Set<string>([
  ELEMENT_CUSTOM_TYPE.SHAPE_LINE,
  ELEMENT_CUSTOM_TYPE.SHAPE_ARROW_LINE
])

const CLOSED_SHAPES = new Set<string>([
  ELEMENT_CUSTOM_TYPE.SHAPE_RECTANGLE,
  ELEMENT_CUSTOM_TYPE.SHAPE_CIRCLE,
  ELEMENT_CUSTOM_TYPE.SHAPE_TRIANGLE,
  ELEMENT_CUSTOM_TYPE.SHAPE_PENTAGON,
  ELEMENT_CUSTOM_TYPE.SHAPE_HEXAGON
])

const STROKE_LEAVES = new Set(['line', 'polyline', 'circle', 'path'])

const childrenOf = (object: Editable) => {
  if (typeof object.getObjects === 'function') {
    return object.getObjects()
  }
  return object._objects ?? []
}

const colorText = (value: unknown) => (typeof value === 'string' ? value : '')

const sameColor = (current: unknown, next: string) =>
  colorText(current).toLowerCase() === next.toLowerCase()

const assign = (object: Editable, props: Record<string, unknown>) => {
  if (typeof object.set === 'function') {
    object.set(props)
  } else {
    Object.assign(object, props)
  }
  object.dirty = true
}

const setStroke = (object: Editable, color: string) => {
  if (sameColor(object.stroke, color)) {
    return false
  }
  assign(object, { stroke: color })
  return true
}

const setFill = (object: Editable, color: string) => {
  if (sameColor(object.fill, color)) {
    return false
  }
  assign(object, { fill: color })
  return true
}

const isBasicBrush = (object: Editable) =>
  object.type === 'path' &&
  !object._customType &&
  typeof object.stroke === 'string'

const isDrawText = (object: Editable) =>
  object._customType === ELEMENT_CUSTOM_TYPE.DRAW_TEXT

const isInputText = (object: Editable) =>
  object.type === 'i-text' || object._customType === ELEMENT_CUSTOM_TYPE.I_TEXT

const paintChildren = (
  object: Editable,
  paintChild: (child: Editable) => boolean
) => {
  const children = childrenOf(object)
  if (object.type === 'group' && children.length) {
    let changed = false
    children.forEach((child) => {
      if (paintChild(child)) {
        changed = true
      }
    })
    if (changed) {
      object.dirty = true
    }
    return changed
  }
  return false
}

const paintStrokeLeaves = (object: Editable, color: string): boolean => {
  if (paintChildren(object, (child) => paintStrokeLeaves(child, color))) {
    return true
  }
  if (STROKE_LEAVES.has(object.type || '')) {
    return setStroke(object, color)
  }
  return false
}

const paintMultiPoint = (object: Editable, color: string): boolean => {
  if (paintChildren(object, (child) => paintMultiPoint(child, color))) {
    return true
  }
  if (object.type === 'circle') {
    return setFill(object, color)
  }
  if (object.type === 'line') {
    return setStroke(object, color)
  }
  return false
}

const paintThorn = (object: Editable, color: string): boolean => {
  if (paintChildren(object, (child) => paintThorn(child, color))) {
    return true
  }
  if (object.type === 'ellipse') {
    return setFill(object, color)
  }
  return false
}

const paintDrawText = (object: Editable, color: string): boolean => {
  if (paintChildren(object, (child) => paintDrawText(child, color))) {
    return true
  }
  if (object.type === 'text' || object.type === 'i-text') {
    return setFill(object, color)
  }
  return false
}

const paintOutline = (object: Editable, color: string) => {
  const children = childrenOf(object)
  const outline = children[children.length - 1]
  if (!outline) {
    return false
  }
  const changed = setStroke(outline, color)
  if (changed) {
    object.dirty = true
  }
  return changed
}

export const objectEditKind = (
  object: Editable
): { color: ColorEdit | null; line: LineEdit | null } => {
  if (isInputText(object) || isDrawText(object)) {
    return { color: 'text', line: null }
  }
  if (object._customType && DRAW_COLOR_GROUPS.has(object._customType)) {
    return { color: 'draw', line: null }
  }
  if (object._customType && SHAPE_LINES.has(object._customType)) {
    return { color: 'shape', line: 'shape' }
  }
  if (object._customType && CLOSED_SHAPES.has(object._customType)) {
    return { color: 'shape', line: null }
  }
  if (isBasicBrush(object)) {
    return { color: 'draw', line: 'brush' }
  }
  return { color: null, line: null }
}

export const selectionEdit = (objects: Editable[]): SelectionEdit => {
  if (!objects.length) {
    return { color: null, line: null }
  }
  const kinds = objects.map(objectEditKind)
  const color = kinds[0].color
  const line = kinds[0].line
  return {
    color: color && kinds.every((kind) => kind.color === color) ? color : null,
    line: line && kinds.every((kind) => kind.line === line) ? line : null
  }
}

export const paintObjectColor = (object: Editable, color: string) => {
  const kind = objectEditKind(object)
  if (kind.color === 'draw' && isBasicBrush(object)) {
    return setStroke(object, color)
  }
  if (
    kind.color === 'draw' &&
    object._customType === ELEMENT_CUSTOM_TYPE.THORN
  ) {
    return paintThorn(object, color)
  }
  if (
    kind.color === 'draw' &&
    object._customType === ELEMENT_CUSTOM_TYPE.MULTI_POINT
  ) {
    return paintMultiPoint(object, color)
  }
  if (kind.color === 'draw') {
    return paintStrokeLeaves(object, color)
  }
  if (kind.color === 'shape' && kind.line === 'shape') {
    return setStroke(object, color)
  }
  if (kind.color === 'shape') {
    return paintOutline(object, color)
  }
  if (kind.color === 'text' && isDrawText(object)) {
    return paintDrawText(object, color)
  }
  return false
}

const collect = (
  object: Editable,
  visit: (object: Editable, colors: string[]) => void
) => {
  const colors: string[] = []
  const walk = (current: Editable) => {
    visit(current, colors)
    if (current.type === 'group') {
      childrenOf(current).forEach(walk)
    }
  }
  walk(object)
  return colors
}

export const editedColors = (object: Editable): string[] => {
  const kind = objectEditKind(object)
  if (kind.color === 'draw' && isBasicBrush(object)) {
    return [colorText(object.stroke)]
  }
  if (
    kind.color === 'draw' &&
    object._customType === ELEMENT_CUSTOM_TYPE.THORN
  ) {
    return collect(object, (current, colors) => {
      if (current.type === 'ellipse') {
        colors.push(colorText(current.fill))
      }
    })
  }
  if (
    kind.color === 'draw' &&
    object._customType === ELEMENT_CUSTOM_TYPE.MULTI_POINT
  ) {
    return collect(object, (current, colors) => {
      if (current.type === 'circle') {
        colors.push(colorText(current.fill))
      }
      if (current.type === 'line') {
        colors.push(colorText(current.stroke))
      }
    })
  }
  if (kind.color === 'draw') {
    return collect(object, (current, colors) => {
      if (STROKE_LEAVES.has(current.type || '') && current.type !== 'group') {
        colors.push(colorText(current.stroke))
      }
    })
  }
  if (kind.color === 'shape' && kind.line === 'shape') {
    return [colorText(object.stroke)]
  }
  if (kind.color === 'shape') {
    const children = childrenOf(object)
    const outline = children[children.length - 1]
    return outline ? [colorText(outline.stroke)] : []
  }
  if (kind.color === 'text' && isDrawText(object)) {
    return collect(object, (current, colors) => {
      if (current.type === 'text' || current.type === 'i-text') {
        colors.push(colorText(current.fill))
      }
    })
  }
  if (kind.color === 'text') {
    return [colorText(object.fill)]
  }
  return []
}

export const brushDashArray = (style: string, strokeWidth: number) => {
  switch (style) {
    case DrawLineType.Dashed:
      return [strokeWidth * 3, strokeWidth * 2]
    case DrawLineType.Dotted:
      return [strokeWidth * 0.5, strokeWidth * 1.25]
    default:
      return null
  }
}

export const shapeDashArray = (style: string, strokeWidth: number) => {
  const value = Math.round(strokeWidth + 5)
  switch (style) {
    case DrawLineType.Dashed:
      return [value * 3, value * 2]
    case DrawLineType.Dotted:
      return [value, value * 3]
    default:
      return null
  }
}

export const classifyDash = (dash: unknown): LineStyleName | null => {
  if (dash == null) {
    return 'solid'
  }
  if (!Array.isArray(dash) || dash.length < 2) {
    return 'solid'
  }
  const first = Number(dash[0])
  const second = Number(dash[1])
  if (!Number.isFinite(first) || !Number.isFinite(second)) {
    return null
  }
  if (first === 0 && second === 0) {
    return 'solid'
  }
  if (first > second) {
    return 'dashed'
  }
  if (second > first) {
    return 'dotted'
  }
  return null
}

export const objectLineStyle = (object: Editable): LineStyleName | null => {
  if (!objectEditKind(object).line) {
    return null
  }
  return classifyDash(object.strokeDashArray)
}

export const sharedLineStyle = (objects: Editable[]): LineStyleName | null => {
  const styles = objects.map(objectLineStyle)
  if (!styles.length || styles.some((style) => style == null)) {
    return null
  }
  const first = styles[0]
  return styles.every((style) => style === first) ? first : null
}

const sameDash = (
  current: number[] | null | undefined,
  next: number[] | null
) => {
  if (current == null || current.length === 0) {
    return next == null
  }
  if (next == null) {
    return false
  }
  return (
    current.length === next.length &&
    current.every((value, index) => value === next[index])
  )
}

export const paintLineStyle = (object: Editable, style: string) => {
  const kind = objectEditKind(object)
  if (!kind.line) {
    return false
  }
  const width = typeof object.strokeWidth === 'number' ? object.strokeWidth : 1
  const next =
    kind.line === 'brush'
      ? brushDashArray(style, width)
      : shapeDashArray(style, width)
  if (sameDash(object.strokeDashArray, next)) {
    return false
  }
  assign(object, { strokeDashArray: next })
  return true
}
