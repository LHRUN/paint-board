import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { fabric } from 'fabric'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import useDrawStore from '@/store/draw'
import { paintBoard } from '@/core/paintBoard'
import { isCanvasTextObject } from '@/core/element/text/placeholder'
import {
  activeTextColorIndexes,
  TEXT_COLOR_LIMIT
} from '@/core/element/text/textColor'
import { applyTextFill } from '@/core/element/text/applyTextFill'
import { canSnapshotTextChange } from '@/core/element/text/editingSnapshot'
import {
  editedColors,
  paintObjectColor,
  selectionEdit,
  type Editable
} from '@/core/element/selectEdit/paint'
import ColorSwatchList from '@/components/toolPanel/colorSwatchList'

interface IProps {
  refreshCount: number
}

const readTextTargets = () => {
  const objects = paintBoard.canvas?.getActiveObjects() ?? []
  if (selectionEdit(objects as Editable[]).color !== 'text') {
    return []
  }
  return objects
}

const paintTextColor = (object: fabric.Object, color: string) => {
  if (object._customType === ELEMENT_CUSTOM_TYPE.DRAW_TEXT) {
    paintObjectColor(object as Editable, color)
    return
  }
  applyTextFill(object as fabric.IText, color)
}

const recordTextColor = (objects: fabric.Object[]) => {
  const inputTexts = objects.filter((object) =>
    isCanvasTextObject(object)
  ) as fabric.IText[]
  const hasDrawText = objects.some(
    (object) => object._customType === ELEMENT_CUSTOM_TYPE.DRAW_TEXT
  )
  const inputReady =
    inputTexts.length === 0 ||
    (inputTexts.every(
      (text) => text._customType === ELEMENT_CUSTOM_TYPE.I_TEXT
    ) &&
      canSnapshotTextChange(inputTexts))
  if ((inputTexts.length > 0 || hasDrawText) && inputReady) {
    paintBoard.render()
  } else {
    paintBoard.canvas?.requestRenderAll()
  }
  paintBoard.triggerHook()
}

const TextColorConfig = ({ refreshCount }: IProps) => {
  const { t } = useTranslation()
  const {
    textColors,
    updateCurrentTextColor,
    updateTextColor,
    deleteTextColor
  } = useDrawStore()
  const editingHighlighted = useRef(false)
  const fillsBeforeEdit = useRef<string[]>([])

  const targets = useMemo(() => readTextTargets(), [refreshCount])
  const activeIndexes = activeTextColorIndexes(
    textColors,
    targets.flatMap((object) => editedColors(object as Editable))
  )

  if (targets.length === 0) {
    return null
  }

  const paintTargets = (color: string) => {
    readTextTargets().forEach((object) => {
      paintTextColor(object, color)
    })
  }

  const colorChanged = (objects: fabric.Object[], color: string) =>
    objects.some((object) =>
      editedColors(object as Editable).some(
        (fill) => fill.toLowerCase() !== color.toLowerCase()
      )
    )

  const selectColor = (index: number) => {
    const color = useDrawStore.getState().textColors[index]
    if (!color) {
      return
    }
    const texts = readTextTargets()
    const changed = colorChanged(texts, color)
    updateCurrentTextColor(index)
    texts.forEach((object) => {
      paintTextColor(object, color)
    })
    if (changed) {
      recordTextColor(texts)
    } else {
      paintBoard.canvas?.requestRenderAll()
      paintBoard.triggerHook()
    }
  }

  const editColor = (color: string, index: number) => {
    updateTextColor(color, index)
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
    updateTextColor(color, index)
    if (!highlighted) {
      return
    }
    const texts = readTextTargets()
    const changed = previousFills.some(
      (fill) => fill.toLowerCase() !== color.toLowerCase()
    )
    texts.forEach((object) => {
      paintTextColor(object, color)
    })
    if (!changed) {
      paintBoard.canvas?.requestRenderAll()
      return
    }
    updateCurrentTextColor(index)
    recordTextColor(texts)
  }

  return (
    <ColorSwatchList
      label={t('title.textColor')}
      inputId="text-color-input"
      colors={textColors}
      activeIndexes={activeIndexes}
      maxColors={TEXT_COLOR_LIMIT}
      inline
      onSelect={selectColor}
      onEditStart={(index) => {
        editingHighlighted.current = activeIndexes.includes(index)
        fillsBeforeEdit.current = readTextTargets().flatMap((object) =>
          editedColors(object as Editable)
        )
      }}
      onEdit={editColor}
      onEditEnd={finishEdit}
      onAdd={() => {
        updateTextColor('#000000', textColors.length)
      }}
      onDelete={deleteTextColor}
    />
  )
}

export default TextColorConfig
