import useDrawStore from '@/store/draw'
import useBoardStore from '@/store/board'
import { ActionMode } from '@/constants'
import { DrawStyle, DrawType } from '@/constants/draw'

import ShapeConutConfig from './shapeConfig/shapeConutConfig'
import ShapeTypeConfig from './shapeConfig/shapeTypeConfig'
import ShadowConfig from './shadowConfig'
import DrawTextConfig from './drawTextConfig'
import MaterialConfig from './materialConfig'
import MultiColorConfig from './multiColorConfig'
import DrawWidthConfig from './drawWidthConfig'
import DrawColorConfig from './drawColorConfig'
import DrawStyleConfig from './drawStyleConfig'
import DrawAIConfig from './drawAIConfig'

const FreeDrawConfig = () => {
  const { drawStyle } = useDrawStore()
  const { mode, drawType } = useBoardStore()

  return (
    <>
      {/* style config */}
      <DrawStyleConfig />
      {drawStyle === DrawStyle.Shape && <ShapeTypeConfig />}
      {(drawStyle === DrawStyle.Shape ||
        drawStyle === DrawStyle.MultiPoint) && <ShapeConutConfig />}
      {drawStyle === DrawStyle.Material && <MaterialConfig />}
      {drawStyle === DrawStyle.MultiColor && <MultiColorConfig />}
      {![DrawStyle.Text, DrawStyle.Wiggle, DrawStyle.Thorn].includes(
        drawStyle
      ) && <DrawWidthConfig />}
      {/* color config */}
      {drawStyle !== DrawStyle.Rainbow && <DrawColorConfig />}
      {[DrawStyle.Basic, DrawStyle.Material, DrawStyle.MultiColor].includes(
        drawStyle
      ) && <ShadowConfig />}
      {drawStyle === DrawStyle.Text && <DrawTextConfig />}
      {mode === ActionMode.DRAW &&
        drawType === DrawType.FreeStyle &&
        drawStyle === DrawStyle.Basic && <DrawAIConfig />}
    </>
  )
}

export default FreeDrawConfig
