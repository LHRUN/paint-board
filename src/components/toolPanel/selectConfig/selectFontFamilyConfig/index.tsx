import { FC, useMemo } from 'react'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import { paintBoard } from '@/utils/paintBoard'

import FontFamilyConfg from '@/components/toolPanel/drawConfig/freeStyleConfig/fontFamilyConfig'

interface IProps {
  refreshCount: number
}

const SelectFontFamilyConfig: FC<IProps> = ({ refreshCount }) => {
  const updateFontFamily = (fontFamily: string) => {
    const text = paintBoard.canvas?.getActiveObject() as fabric.Object
    if (text?._customType === ELEMENT_CUSTOM_TYPE.I_TEXT) {
      ;(text as fabric.IText).set('fontFamily', fontFamily)
    } else if (text?._customType === ELEMENT_CUSTOM_TYPE.DRAW_TEXT) {
      ;(text as fabric.Group)._objects.forEach((obj) => {
        ;(obj as fabric.Text).set('fontFamily', fontFamily)
      })
    }
    paintBoard.render()
    paintBoard.triggerHook()
  }

  const currentTextFontFamily = useMemo(() => {
    const text = paintBoard.canvas?.getActiveObject() as fabric.Object
    if (text?._customType === ELEMENT_CUSTOM_TYPE.I_TEXT) {
      return (text as fabric.IText)?.fontFamily || ''
    } else if (text?._customType === ELEMENT_CUSTOM_TYPE.DRAW_TEXT) {
      const drawText = text as fabric.Group
      return (drawText._objects?.[0] as fabric.Text)?.fontFamily || ''
    }
    return ''
  }, [refreshCount])

  return (
    <FontFamilyConfg
      fontFamily={currentTextFontFamily}
      updateFontFamily={updateFontFamily}
    />
  )
}

export default SelectFontFamilyConfig
