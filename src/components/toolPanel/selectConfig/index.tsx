import { useEffect, useState } from 'react'
import { paintBoard } from '@/utils/paintBoard'
import { ELEMENT_CUSTOM_TYPE, SHAPE_ELEMENT_CUSTOM_TYPE } from '@/constants'

import LayerConfig from './layerConfig'
import OpacityConfig from './opacityConfig'
import ImageFilterConfig from './imageFilterConfig'
import FontStyleConfig from './fontStyleConfig'
import SelectShapeConfig from './selectShapeConfig'
import SelectFontFamilyConfig from './selectFontFamilyConfig'

const SelectConfig = () => {
  const [refreshCount, setRefresh] = useState(0) // refresh data

  useEffect(() => {
    const refresh = () => setRefresh((v) => v + 1)
    paintBoard.addHookFn(refresh)
    return () => {
      paintBoard.removeHookFn(refresh)
    }
  }, [setRefresh])

  return (
    <div className="form-control">
      <OpacityConfig refreshCount={refreshCount} />

      {paintBoard.canvas?.getActiveObject() && <LayerConfig />}

      {paintBoard.canvas?.getActiveObject()?._customType ===
        ELEMENT_CUSTOM_TYPE.IMAGE && <ImageFilterConfig />}

      {paintBoard.canvas?.getActiveObject()?._customType ===
        ELEMENT_CUSTOM_TYPE.I_TEXT && (
        <FontStyleConfig refreshCount={refreshCount} />
      )}
      {[ELEMENT_CUSTOM_TYPE.DRAW_TEXT, ELEMENT_CUSTOM_TYPE.I_TEXT].includes(
        paintBoard.canvas?.getActiveObject()?._customType as string
      ) && <SelectFontFamilyConfig refreshCount={refreshCount} />}

      {Object.values(SHAPE_ELEMENT_CUSTOM_TYPE).includes(
        paintBoard.canvas?.getActiveObject()?._customType as string
      ) && <SelectShapeConfig refreshCount={refreshCount} />}
    </div>
  )
}

export default SelectConfig
