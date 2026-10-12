import { fabric } from 'fabric'
import { ActionMode } from '@/constants'
import { paintBoard } from '@/core/paintBoard'
import useBoardStore from '@/store/board'
import {
  objectAtListIndex,
  selectableAfterVisibilityChange,
  stackAfterListMove
} from './objectList'

const selectionEnabled = () => {
  const mode = useBoardStore.getState().mode
  return mode === ActionMode.SELECT || mode === ActionMode.Board
}

const applySelectable = (object: fabric.Object, visible: boolean) => {
  const selectable = selectableAfterVisibilityChange(
    object._customType,
    visible,
    selectionEnabled()
  )
  if (selectable === undefined) {
    delete object.selectable
    return
  }
  object.selectable = selectable
}

export const toggleObjectVisible = (object: fabric.Object) => {
  const canvas = paintBoard.canvas
  if (!canvas) {
    return
  }
  const visible = object.visible === false
  object.set({
    visible,
    evented: visible
  })
  applySelectable(object, visible)
  if (!visible && canvas.getActiveObjects().includes(object)) {
    canvas.discardActiveObject()
  }
  paintBoard.render()
  paintBoard.triggerHook()
}

export const selectObjectFromList = (object: fabric.Object) => {
  const canvas = paintBoard.canvas
  if (!canvas || object.visible === false) {
    return
  }
  const active = canvas.getActiveObjects()
  if (active.length === 1 && active[0] === object) {
    return
  }
  useBoardStore.getState().updateMode(ActionMode.SELECT)
  canvas.setActiveObject(object)
  canvas.requestRenderAll()
  paintBoard.triggerHook()
}

export const moveObjectInList = (
  fromListIndex: number,
  toListIndex: number
) => {
  const canvas = paintBoard.canvas
  if (!canvas) {
    return
  }
  const next = stackAfterListMove(
    canvas.getObjects(),
    fromListIndex,
    toListIndex
  )
  if (!next) {
    return
  }
  next.forEach((object, index) => {
    canvas.moveTo(object, index)
  })
  paintBoard.render()
  paintBoard.triggerHook()
}

export const objectFromList = (listIndex: number) => {
  const objects = paintBoard.canvas?.getObjects()
  if (!objects) {
    return undefined
  }
  return objectAtListIndex(objects, listIndex)
}
