import { fabric } from 'fabric'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import { paintBoard } from '@/core/paintBoard'
import { initObjectControls } from '@/core/utils/loadCanvas'
import { initCustomObjectAttr } from '@/core/utils/object'
import { groupInsertIndex } from './groupSelection'

type SelectionWithObjects = fabric.ActiveSelection & {
  _objects: fabric.Object[]
}

const selectionMembers = (selection: fabric.ActiveSelection) => {
  return (selection as SelectionWithObjects)._objects
}

/**
 * Turn the current ActiveSelection into a real group.
 * Fabric already stores child coordinates relative to that selection, so
 * toGroup keeps the current position. Discarding the selection first would
 * convert those coordinates back and shift the result.
 */
export const groupActiveSelection = () => {
  const canvas = paintBoard.canvas
  if (!canvas || paintBoard.textElement.isTextEditing) {
    return false
  }
  const active = canvas.getActiveObject()
  if (
    !active ||
    active.type !== 'activeSelection' ||
    active.canvas !== canvas
  ) {
    return false
  }

  const selection = active as fabric.ActiveSelection
  const members = selectionMembers(selection)
  const stack = canvas.getObjects()
  const indexes = members.map((object) => stack.indexOf(object))
  const insertIndex = groupInsertIndex(indexes)
  if (insertIndex == null) {
    return false
  }

  const order = new Map(
    members.map((object, index) => [object, indexes[index]])
  )
  members.sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0))

  const group = selection.toGroup()
  initCustomObjectAttr(group, ELEMENT_CUSTOM_TYPE.GROUP)
  group.set({ erasable: 'deep' })
  canvas.moveTo(group, insertIndex)
  initObjectControls(group)
  group.setCoords()
  paintBoard.render()
  paintBoard.triggerHook()
  return true
}
