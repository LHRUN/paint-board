import { fabric } from 'fabric'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import { refreshEditingBox } from '@/core/element/text/editingBox'
import { collectFontSamples, textUsesFontFamilies } from './collectFontFamilies'
import { ensureFontSamples } from './googleFont'

type FabricUtilWithFontCache = typeof fabric.util & {
  clearFabricFontCache?: (fontFamily?: string) => void
}

type GroupWithBounds = fabric.Group & {
  _calcBounds?: (onlyWidthHeight?: boolean) => void
}

const textTypes = new Set(['text', 'i-text', 'textbox'])

export const clearFabricFontCache = (fontFamily: string) => {
  const util = fabric.util as FabricUtilWithFontCache
  util.clearFabricFontCache?.(fontFamily)
}

const updateDrawTextBounds = (group: fabric.Group) => {
  const withBounds = group as GroupWithBounds
  withBounds._calcBounds?.(true)
  group.setCoords()
  group.dirty = true
}

const remeasureText = (text: fabric.Text) => {
  if (text.fontFamily) {
    clearFabricFontCache(text.fontFamily)
  }
  text.initDimensions()
  text.setCoords()
  text.dirty = true
}

export const applyFontFamily = (
  target: fabric.Object | undefined,
  fontFamily: string
) => {
  if (!target) {
    return
  }
  clearFabricFontCache(fontFamily)
  if (target._customType === ELEMENT_CUSTOM_TYPE.I_TEXT) {
    const text = target as fabric.IText
    text.set('fontFamily', fontFamily)
    text.dirty = true
    void refreshEditingBox(text)
    return
  }
  if (target._customType === ELEMENT_CUSTOM_TYPE.DRAW_TEXT) {
    const group = target as fabric.Group
    group.getObjects().forEach((obj) => {
      const text = obj as fabric.Text
      text.set('fontFamily', fontFamily)
      text.dirty = true
    })
    updateDrawTextBounds(group)
  }
}

const relayoutObject = (obj: fabric.Object, families: string[]): boolean => {
  if (obj.type === 'group') {
    const group = obj as fabric.Group
    let changed = false
    group.getObjects().forEach((child) => {
      if (relayoutObject(child, families)) {
        changed = true
      }
    })
    if (changed && obj._customType === ELEMENT_CUSTOM_TYPE.DRAW_TEXT) {
      updateDrawTextBounds(group)
    }
    return changed
  }
  if (!textTypes.has(obj.type || '')) {
    return false
  }
  const text = obj as fabric.Text
  if (!textUsesFontFamilies(text, families)) {
    return false
  }
  remeasureText(text)
  return true
}

export const relayoutFonts = (canvas: fabric.Canvas, families: string[]) => {
  if (!families.length) {
    return
  }
  families.forEach((family) => clearFabricFontCache(family))
  canvas.getObjects().forEach((obj) => relayoutObject(obj, families))
}

export const prepareCanvasTextForExport = async (canvas: fabric.Canvas) => {
  const source = { objects: canvas.getObjects() }
  const samples = collectFontSamples(source)
  await ensureFontSamples(samples)
  relayoutFonts(
    canvas,
    samples.map((item) => item.family)
  )
  canvas.renderAll()
}
