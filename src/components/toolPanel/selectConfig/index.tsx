import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { paintBoard } from '@/core/paintBoard'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'

import { Info } from 'lucide-react'
import LayerConfig from './layerConfig'
import OpacityConfig from './opacityConfig'
import EraserConfig from './eraserConfig'
import LockConfig from './lockConfig'
import ImageFilterConfig from './imageFilterConfig'
import FontStyleConfig from './fontStyleConfig'
import SelectFontFamilyConfig from './selectFontFamilyConfig'
import TextColorConfig from './textColorConfig'

const SelectConfig = () => {
  const { t } = useTranslation()
  const [refreshCount, setRefresh] = useState(0) // refresh data

  useEffect(() => {
    const refresh = () => setRefresh((v) => v + 1)
    paintBoard.addHookFn(refresh)
    return () => {
      paintBoard.removeHookFn(refresh)
    }
  }, [setRefresh])

  const activeObject = paintBoard.canvas?.getActiveObject()

  if (!activeObject) {
    return (
      <div className="flex mt-3 w-56">
        <Info size={16} className="mr-1 shrink-0" />
        <span className="text-sm">{t('tip.unselectedElementTip')}</span>
      </div>
    )
  }

  return (
    <div className="form-control">
      <OpacityConfig refreshCount={refreshCount} />

      <EraserConfig refreshCount={refreshCount} />

      <LockConfig refreshCount={refreshCount} />

      <LayerConfig />

      {activeObject?._customType === ELEMENT_CUSTOM_TYPE.IMAGE && (
        <ImageFilterConfig />
      )}

      <TextColorConfig refreshCount={refreshCount} />

      {activeObject?._customType === ELEMENT_CUSTOM_TYPE.I_TEXT && (
        <FontStyleConfig refreshCount={refreshCount} />
      )}
      {[ELEMENT_CUSTOM_TYPE.DRAW_TEXT, ELEMENT_CUSTOM_TYPE.I_TEXT].includes(
        activeObject?._customType as string
      ) && <SelectFontFamilyConfig refreshCount={refreshCount} />}
    </div>
  )
}

export default SelectConfig
