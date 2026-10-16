import { useMemo } from 'react'
import useShapeStore from '@/store/shape'
import { SHAPE_ELEMENT_CUSTOM_TYPE } from '@/constants'
import { isFillableGraphIcon } from '@/constants/shape'

import StrokeStyleConfig from './strokeStyleConfig'
import PointCountConfig from './linePointCountConfig'
import ShapeSelectConfig from './shapeSelectConfig'
import StrokeWidthConfig from './strokeWidthConfig'
import StrokeColorConfig from './strokeColorConfig'
import FillColorConfig from './fillColorConfig'
import FillStyleConfig from './fillStyleConfig'

const ShapeDrawConfig = () => {
  const { currentShapeIcon } = useShapeStore()
  const isLine = useMemo(() => {
    return [
      SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_LINE,
      SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_ARROW_LINE
    ].includes(currentShapeIcon)
  }, [currentShapeIcon])

  const isFill = useMemo(() => {
    return (
      [
        SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_RECTANGLE,
        SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_CIRCLE,
        SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_TRIANGLE,
        SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_PENTAGON,
        SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_HEXAGON
      ].includes(currentShapeIcon) || isFillableGraphIcon(currentShapeIcon)
    )
  }, [currentShapeIcon])

  return (
    <>
      <ShapeSelectConfig />
      {isLine && <PointCountConfig />}
      <StrokeWidthConfig />
      <StrokeStyleConfig />
      <StrokeColorConfig />
      {isFill && <FillColorConfig />}
      {isFill && <FillStyleConfig />}
    </>
  )
}

export default ShapeDrawConfig
