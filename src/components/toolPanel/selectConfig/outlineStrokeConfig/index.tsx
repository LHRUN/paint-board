import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import ColorSwatchList from '@/components/toolPanel/colorSwatchList'
import { paintBoard } from '@/core/paintBoard'
import { paintOutlineStroke } from '@/core/element/selectEdit/paint'
import { activeTextColorIndexes } from '@/core/element/text/textColor'
import useDrawStore from '@/store/draw'
import { FREEHAND_STROKE_COLOR_LIMIT } from '@/store/freehandStrokeColor'

const readOutlined = () => {
  const active = paintBoard.canvas?.getActiveObjects() ?? []
  const outlined = active.filter(
    (object) =>
      object._customType === ELEMENT_CUSTOM_TYPE.FREEHAND_STROKE &&
      (object.strokeWidth ?? 0) > 0
  )
  return outlined.length === active.length ? outlined : []
}

const strokeText = (object: { stroke?: unknown }) =>
  typeof object.stroke === 'string' ? object.stroke : ''

const recordEdit = (changed: boolean) => {
  if (changed) {
    paintBoard.render()
  } else {
    paintBoard.canvas?.requestRenderAll()
  }
  paintBoard.triggerHook()
}

const OutlineStrokeConfig = ({ refreshCount }: { refreshCount: number }) => {
  const { t } = useTranslation()
  const colors = useDrawStore((state) => state.freehandStrokeColors)
  const updateFreehandStrokeColor = useDrawStore(
    (state) => state.updateFreehandStrokeColor
  )
  const deleteFreehandStrokeColor = useDrawStore(
    (state) => state.deleteFreehandStrokeColor
  )
  const updateCurrentFreehandStrokeColor = useDrawStore(
    (state) => state.updateCurrentFreehandStrokeColor
  )
  const editingHighlighted = useRef(false)
  const strokesBeforeEdit = useRef<string[]>([])

  const objects = useMemo(() => readOutlined(), [refreshCount])
  const activeIndexes = activeTextColorIndexes(
    colors,
    objects.map((object) => strokeText(object))
  )

  if (!objects.length) {
    return null
  }

  const paintTargets = (color: string) => {
    readOutlined().forEach((object) => {
      paintOutlineStroke(object, color)
    })
  }

  const selectColor = (index: number) => {
    const color = useDrawStore.getState().freehandStrokeColors[index]
    if (!color) {
      return
    }
    const targets = readOutlined()
    const changed = targets.some(
      (object) => strokeText(object).toLowerCase() !== color.toLowerCase()
    )
    targets.forEach((object) => {
      paintOutlineStroke(object, color)
    })
    updateCurrentFreehandStrokeColor(index)
    recordEdit(changed)
  }

  const editColor = (color: string, index: number) => {
    updateFreehandStrokeColor(color, index)
    if (!editingHighlighted.current) {
      return
    }
    paintTargets(color)
    paintBoard.canvas?.requestRenderAll()
  }

  const finishEdit = (color: string, index: number) => {
    const highlighted = editingHighlighted.current
    const previousStrokes = strokesBeforeEdit.current
    editingHighlighted.current = false
    strokesBeforeEdit.current = []
    updateFreehandStrokeColor(color, index)
    if (!highlighted) {
      return
    }
    const changed = previousStrokes.some(
      (stroke) => stroke.toLowerCase() !== color.toLowerCase()
    )
    paintTargets(color)
    if (!changed) {
      paintBoard.canvas?.requestRenderAll()
      return
    }
    updateCurrentFreehandStrokeColor(index)
    recordEdit(true)
  }

  return (
    <ColorSwatchList
      label={t('title.freehandStrokeColor')}
      inputId="select-freehand-stroke-color-input"
      colors={colors}
      activeIndexes={activeIndexes}
      maxColors={FREEHAND_STROKE_COLOR_LIMIT}
      inline
      onSelect={selectColor}
      onEditStart={(index) => {
        editingHighlighted.current = activeIndexes.includes(index)
        strokesBeforeEdit.current = readOutlined().map((object) =>
          strokeText(object)
        )
      }}
      onEdit={editColor}
      onEditEnd={finishEdit}
      onAdd={() => {
        updateFreehandStrokeColor('#000000', colors.length)
      }}
      onDelete={deleteFreehandStrokeColor}
    />
  )
}

export default OutlineStrokeConfig
