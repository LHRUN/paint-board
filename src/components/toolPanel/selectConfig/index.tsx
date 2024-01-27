import { useEffect, useMemo, useState } from 'react'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'

import FontFamilyConfg from '../drawConfig/freeStyleConfig/fontFamilyConfig'
import LayerConfig from './layerConfig'
import OpacityConfig from './opacityConfig'
import ImageFilterConfig from './imageFilterConfig'

const SelectConfig = () => {
  const [refreshCount, setRefresh] = useState(0) // refresh data

  useEffect(() => {
    const refresh = () => setRefresh((v) => v + 1)
    paintBoard.addHookFn(refresh)
    return () => {
      paintBoard.removeHookFn(refresh)
    }
  }, [setRefresh])

  const updateFontFamily = (fontFamily: string) => {
    const text = paintBoard.canvas?.getActiveObject() as fabric.Object
    if (text?._customType === 'itext') {
      ;(text as fabric.IText).set('fontFamily', fontFamily)
    } else if (text?._customType === 'drawText') {
      ;(text as fabric.Group)._objects.forEach((obj) => {
        ;(obj as fabric.Text).set('fontFamily', fontFamily)
      })
    }
    paintBoard.render()
    setRefresh((v) => v + 1)
  }

  const currentTextFontFamily = useMemo(() => {
    const text = paintBoard.canvas?.getActiveObject() as fabric.Object
    if (text?._customType === 'itext') {
      return (text as fabric.IText)?.fontFamily || ''
    } else if (text?._customType === 'drawText') {
      const drawText = text as fabric.Group
      return (drawText._objects?.[0] as fabric.Text)?.fontFamily || ''
    }
    return ''
  }, [refreshCount])

  return (
    <div className="form-control">
      <OpacityConfig refreshCount={refreshCount} />

      {paintBoard.canvas?.getActiveObject() && <LayerConfig />}

      {paintBoard.canvas?.getActiveObject()?.type === 'image' && (
        <ImageFilterConfig />
      )}

      {['drawText', 'itext'].includes(
        paintBoard.canvas?.getActiveObject()?._customType as string
      ) && (
        <FontFamilyConfg
          fontFamily={currentTextFontFamily}
          updateFontFamily={updateFontFamily}
        />
      )}
    </div>
  )
}

export default SelectConfig
