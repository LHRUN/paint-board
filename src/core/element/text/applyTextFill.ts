import { fabric } from 'fabric'

type StyledText = fabric.IText & {
  removeStyle?: (property: string) => void
}

/** The whole text element uses one fill. Character-level fills are cleared. */
export const applyTextFill = (textObj: fabric.IText, color: string) => {
  textObj.set({ fill: color })
  ;(textObj as StyledText).removeStyle?.('fill')
  textObj.dirty = true
}
