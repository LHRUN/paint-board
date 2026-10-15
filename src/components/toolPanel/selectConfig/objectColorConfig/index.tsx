import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import useDrawStore from '@/store/draw'
import useShapeStore from '@/store/shape'
import { paintBoard } from '@/core/paintBoard'
import { activeTextColorIndexes } from '@/core/element/text/textColor'
import {
  editedColors,
  paintObjectColor,
  selectionEdit,
  type ColorEdit,
  type Editable
} from '@/core/element/selectEdit/paint'
import ColorSwatchList from '@/components/toolPanel/colorSwatchList'

interface IProps {
  refreshCount: number
  kind: Extract<ColorEdit, 'draw' | 'shape'>
}

const readTargets = (kind: IProps['kind']) => {
  const objects = (paintBoard.canvas?.getActiveObjects() ?? []) as Editable[]
  if (selectionEdit(objects).color !== kind) {
    return []
  }
  return objects
}

const recordEdit = (changed: boolean) => {
  if (changed) {
    paintBoard.render()
  } else {
    paintBoard.canvas?.requestRenderAll()
  }
  paintBoard.triggerHook()
}

const ObjectColorConfig = ({ refreshCount, kind }: IProps) => {
  const { t } = useTranslation()
  const drawColors = useDrawStore((state) => state.drawColors)
  const updateDrawColor = useDrawStore((state) => state.updateDrawColor)
  const deleteDrawColor = useDrawStore((state) => state.deleteDrawColor)
  const focusDrawColor = useDrawStore((state) => state.focusDrawColor)
  const strokeColorList = useShapeStore((state) => state.strokeColorList)
  const updateStrokeColor = useShapeStore((state) => state.updateStrokeColor)
  const deleteStrokeColor = useShapeStore((state) => state.deleteStrokeColor)
  const updateCurrentStrokeColor = useShapeStore(
    (state) => state.updateCurrentStrokeColor
  )
  const editingHighlighted = useRef(false)
  const fillsBeforeEdit = useRef<string[]>([])

  const colors = kind === 'draw' ? drawColors : strokeColorList
  const targets = useMemo(() => readTargets(kind), [refreshCount, kind])
  const activeIndexes = activeTextColorIndexes(
    colors,
    targets.flatMap((object) => editedColors(object))
  )

  if (targets.length === 0) {
    return null
  }

  const rememberColor = (index: number) => {
    if (kind === 'draw') {
      focusDrawColor(index)
      return
    }
    updateCurrentStrokeColor(index)
  }

  const updatePalette = (color: string, index: number) => {
    if (kind === 'draw') {
      updateDrawColor(color, index)
      return
    }
    updateStrokeColor(color, index)
  }

  const paintTargets = (color: string) => {
    readTargets(kind).forEach((object) => {
      paintObjectColor(object, color)
    })
  }

  const selectColor = (index: number) => {
    const palette =
      kind === 'draw'
        ? useDrawStore.getState().drawColors
        : useShapeStore.getState().strokeColorList
    const color = palette[index]
    if (!color) {
      return
    }
    const objects = readTargets(kind)
    const changed = objects.some((object) =>
      editedColors(object).some(
        (fill) => fill.toLowerCase() !== color.toLowerCase()
      )
    )
    objects.forEach((object) => {
      paintObjectColor(object, color)
    })
    rememberColor(index)
    recordEdit(changed)
  }

  const editColor = (color: string, index: number) => {
    updatePalette(color, index)
    if (!editingHighlighted.current) {
      return
    }
    paintTargets(color)
    paintBoard.canvas?.requestRenderAll()
  }

  const finishEdit = (color: string, index: number) => {
    const highlighted = editingHighlighted.current
    const previousFills = fillsBeforeEdit.current
    editingHighlighted.current = false
    fillsBeforeEdit.current = []
    updatePalette(color, index)
    if (!highlighted) {
      return
    }
    const changed = previousFills.some(
      (fill) => fill.toLowerCase() !== color.toLowerCase()
    )
    paintTargets(color)
    if (!changed) {
      paintBoard.canvas?.requestRenderAll()
      return
    }
    rememberColor(index)
    recordEdit(true)
  }

  return (
    <ColorSwatchList
      label={t(kind === 'draw' ? 'title.drawColor' : 'title.strokeColor')}
      inputId={
        kind === 'draw'
          ? 'select-draw-color-input'
          : 'select-stroke-color-input'
      }
      colors={colors}
      activeIndexes={activeIndexes}
      inline
      onSelect={selectColor}
      onEditStart={(index) => {
        editingHighlighted.current = activeIndexes.includes(index)
        fillsBeforeEdit.current = readTargets(kind).flatMap((object) =>
          editedColors(object)
        )
      }}
      onEdit={editColor}
      onEditEnd={finishEdit}
      onAdd={() => {
        updatePalette('#000000', colors.length)
      }}
      onDelete={(index) => {
        if (kind === 'draw') {
          deleteDrawColor(index)
          return
        }
        deleteStrokeColor(index)
      }}
    />
  )
}

export default ObjectColorConfig
