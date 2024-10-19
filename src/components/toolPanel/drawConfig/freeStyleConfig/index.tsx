import useDrawStore from '@/store/draw'
import { DrawStyle } from '@/constants/draw'

import ShapeConutConfig from './shapeConfig/shapeConutConfig'
import ShapeTypeConfig from './shapeConfig/shapeTypeConfig'
import ShadowConfig from './shadowConfig'
import DrawTextConfig from './drawTextConfig'
import MaterialConfig from './materialConfig'
import MultiColorConfig from './multiColorConfig'
import DrawWidthConfig from './drawWidthConfig'
import DrawColorConfig from './drawColorConfig'
import DrawStyleConfig from './drawStyleConfig'

const FreeDrawConfig = () => {
  const { drawStyle } = useDrawStore()

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
    </>
  )
}

export default FreeDrawConfig
