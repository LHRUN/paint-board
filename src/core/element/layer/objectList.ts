import { ELEMENT_CUSTOM_TYPE } from '@/constants'

const TEXT_DETAIL_LIMIT = 16

const CUSTOM_LABEL: Record<string, string> = {
  [ELEMENT_CUSTOM_TYPE.I_TEXT]: 'objectList.text',
  [ELEMENT_CUSTOM_TYPE.IMAGE]: 'objectList.image',
  [ELEMENT_CUSTOM_TYPE.RAINBOW]: 'style.rainbow',
  [ELEMENT_CUSTOM_TYPE.SHAPE]: 'style.shape',
  [ELEMENT_CUSTOM_TYPE.PIXELS]: 'style.pixels',
  [ELEMENT_CUSTOM_TYPE.DRAW_TEXT]: 'style.text',
  [ELEMENT_CUSTOM_TYPE.MULTI_LINE]: 'style.multiLine',
  [ELEMENT_CUSTOM_TYPE.RETICULATE]: 'style.reticulate',
  [ELEMENT_CUSTOM_TYPE.MULTI_POINT]: 'style.multiPoint',
  [ELEMENT_CUSTOM_TYPE.WIGGLE]: 'style.wiggle',
  [ELEMENT_CUSTOM_TYPE.THORN]: 'style.thorn',
  [ELEMENT_CUSTOM_TYPE.SHAPE_LINE]: 'objectList.line',
  [ELEMENT_CUSTOM_TYPE.SHAPE_ARROW_LINE]: 'objectList.arrow',
  [ELEMENT_CUSTOM_TYPE.SHAPE_RECTANGLE]: 'objectList.rectangle',
  [ELEMENT_CUSTOM_TYPE.SHAPE_CIRCLE]: 'objectList.circle',
  [ELEMENT_CUSTOM_TYPE.SHAPE_TRIANGLE]: 'objectList.polygon',
  [ELEMENT_CUSTOM_TYPE.SHAPE_PENTAGON]: 'objectList.polygon',
  [ELEMENT_CUSTOM_TYPE.SHAPE_HEXAGON]: 'objectList.polygon',
  [ELEMENT_CUSTOM_TYPE.SHAPE_GRAPH]: 'objectList.graph'
}

export type ObjectListSource = {
  id?: string
  type?: string
  _customType?: string
  text?: string
  visible?: boolean
}

export type ObjectListRow = {
  key: string
  labelKey: string
  detail?: string
  visible: boolean
  selected: boolean
}

/**
 * `undefined` means delete the instance value and follow `fabric.Object.prototype`.
 * An own `true` stays clickable after handleMode sets the prototype to false.
 */
export const selectableAfterVisibilityChange = (
  customType: string | undefined,
  visible: boolean,
  selectionEnabled: boolean
): boolean | undefined => {
  if (!visible) {
    return false
  }
  if (customType === ELEMENT_CUSTOM_TYPE.I_TEXT) {
    return selectionEnabled
  }
  return undefined
}

export const textSnippet = (text?: string) => {
  const value = (text || '').replace(/\s+/g, ' ').trim()
  if (!value) {
    return undefined
  }
  if (value.length <= TEXT_DETAIL_LIMIT) {
    return value
  }
  return `${value.slice(0, TEXT_DETAIL_LIMIT)}…`
}

export const objectListLabel = (object: ObjectListSource) => {
  const customType = object._customType
  if (
    customType === ELEMENT_CUSTOM_TYPE.I_TEXT ||
    object.type === 'i-text' ||
    object.type === 'text' ||
    object.type === 'textbox'
  ) {
    return {
      labelKey: 'objectList.text',
      detail: textSnippet(object.text)
    }
  }
  if (customType && CUSTOM_LABEL[customType]) {
    return { labelKey: CUSTOM_LABEL[customType] }
  }
  if (object.type === 'path') {
    return { labelKey: 'objectList.brush' }
  }
  if (object.type === 'image') {
    return { labelKey: 'objectList.image' }
  }
  return { labelKey: 'objectList.element' }
}

/**
 * Canvas stack is bottom-to-top. The panel shows the front object first.
 */
export const objectListRows = (
  objects: ObjectListSource[],
  selected: ObjectListSource[]
): ObjectListRow[] => {
  const selectedSet = new Set(selected)
  return [...objects].reverse().map((object, listIndex) => {
    const label = objectListLabel(object)
    const canvasIndex = objects.length - 1 - listIndex
    return {
      key: object.id || `missing:${canvasIndex}`,
      labelKey: label.labelKey,
      detail: label.detail,
      visible: object.visible !== false,
      selected: selectedSet.has(object)
    }
  })
}

export const objectAtListIndex = <T>(bottomToTop: T[], listIndex: number) => {
  return bottomToTop[bottomToTop.length - 1 - listIndex]
}

/**
 * List indexes count from the front. The returned array is bottom-to-top.
 */
export const stackAfterListMove = <T>(
  bottomToTop: T[],
  fromListIndex: number,
  toListIndex: number
): T[] | null => {
  if (
    !Number.isInteger(fromListIndex) ||
    !Number.isInteger(toListIndex) ||
    fromListIndex === toListIndex
  ) {
    return null
  }
  const list = [...bottomToTop].reverse()
  if (
    fromListIndex < 0 ||
    toListIndex < 0 ||
    fromListIndex >= list.length ||
    toListIndex >= list.length
  ) {
    return null
  }
  const [moved] = list.splice(fromListIndex, 1)
  list.splice(toListIndex, 0, moved)
  return list.reverse()
}
