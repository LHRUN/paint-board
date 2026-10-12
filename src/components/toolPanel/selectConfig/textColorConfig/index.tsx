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
import ColorSwatchList from '@/components/toolPanel/colorSwatchList'

interface IProps {
  refreshCount: number
}

const readTextTargets = () => {
  const objects = paintBoard.canvas?.getActiveObjects() ?? []
  if (
    !objects.length ||
    !objects.every((object) => isCanvasTextObject(object))
  ) {
    return []
  }
  return objects as fabric.IText[]
}

const recordTextColor = (texts: fabric.IText[]) => {
  const committed =
    texts.length > 0 &&
    texts.every((text) => text._customType === ELEMENT_CUSTOM_TYPE.I_TEXT)
  if (committed && canSnapshotTextChange(texts)) {
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
    targets.map((text) => text.fill)
  )

  if (targets.length === 0) {
    return null
  }

  const paintTargets = (color: string) => {
    readTextTargets().forEach((text) => {
      applyTextFill(text, color)
    })
  }

  const selectColor = (index: number) => {
    const color = useDrawStore.getState().textColors[index]
    if (!color) {
      return
    }
    const texts = readTextTargets()
    const changed = texts.some((text) => text.fill !== color)
    updateCurrentTextColor(index)
    texts.forEach((text) => {
      applyTextFill(text, color)
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
    texts.forEach((text) => {
      applyTextFill(text, color)
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
        fillsBeforeEdit.current = readTextTargets().map((text) =>
          String(text.fill)
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
