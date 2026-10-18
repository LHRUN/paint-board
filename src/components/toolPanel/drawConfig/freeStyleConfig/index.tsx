import useDrawStore from '@/store/draw'
import { DrawStyle } from '@/constants/draw'

import ShapeConutConfig from './shapeConfig/shapeConutConfig'
import ShapeTypeConfig from './shapeConfig/shapeTypeConfig'
import ShadowConfig from './shadowConfig'
import DrawTextConfig from './drawTextConfig'
import FontFamilyConfg from './fontFamilyConfig'
import MaterialConfig from './materialConfig'
import MultiColorConfig from './multiColorConfig'
import DrawWidthConfig from './drawWidthConfig'
import DrawColorConfig from './drawColorConfig'
import DrawStyleConfig from './drawStyleConfig'
import FreehandConfig from './freehandConfig'
import OutlinePenConfig from './outlinePenConfig'
import LineTypeConfig from './lineTypeConfig'

const FreeDrawConfig = () => {
  const { drawStyle } = useDrawStore()

  const stylesWithLineAndShadow = [
    DrawStyle.Basic,
    DrawStyle.Material,
    DrawStyle.MultiColor
  ]
  const stylesWithoutWidth = [
    DrawStyle.Text,
    DrawStyle.Wiggle,
    DrawStyle.Thorn,
    DrawStyle.Ink
  ]
  const shapeStyles = [DrawStyle.Shape, DrawStyle.MultiPoint]

  const isShapeStyle = drawStyle === DrawStyle.Shape
  const isShapeOrMultiPoint = shapeStyles.includes(drawStyle)
  const isMaterialStyle = drawStyle === DrawStyle.Material
  const isMultiColorStyle = drawStyle === DrawStyle.MultiColor
  const isTextStyle = drawStyle === DrawStyle.Text
  const isFreehandStyle =
    drawStyle === DrawStyle.Freehand || drawStyle === DrawStyle.FreehandStroke
  const isOutlinePen = drawStyle === DrawStyle.FreehandStroke
  const showWidthConfig = !stylesWithoutWidth.includes(drawStyle)
  const showColorConfig = drawStyle !== DrawStyle.Rainbow
  const showLineAndShadowConfig = stylesWithLineAndShadow.includes(drawStyle)

  return (
    <>
      <DrawStyleConfig />

      {isShapeStyle && <ShapeTypeConfig />}
      {isShapeOrMultiPoint && <ShapeConutConfig />}

      {isMaterialStyle && <MaterialConfig />}
      {isMultiColorStyle && <MultiColorConfig />}

      {showWidthConfig && <DrawWidthConfig />}
      {showColorConfig && <DrawColorConfig />}
      {isOutlinePen && <OutlinePenConfig />}
      {isFreehandStyle && <FreehandConfig />}

      {showLineAndShadowConfig && <LineTypeConfig />}
      {showLineAndShadowConfig && <ShadowConfig />}

      {isTextStyle && (
        <>
          <DrawTextConfig />
          <FontFamilyConfg layoutType="vertical" />
        </>
      )}
    </>
  )
}

export default FreeDrawConfig
