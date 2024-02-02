import useShapeStore from '@/store/shape'
import { ShapeStyle } from '@/constants/shape'

import BorderStyleConfig from './borderStyleConfig'
import BorderTypeConfig from './borderTypeConfig'
import FillStyleConfig from './fillStyleConfig'
import PointCountConfig from './linePointCountConfig'
import ShapeStyleConfig from './shapeStyleConfig'

const ShapeDrawConfig = () => {
  const { shapeStyle } = useShapeStore()

  return (
    <>
      <ShapeStyleConfig />
      {shapeStyle === ShapeStyle.Line && <PointCountConfig />}

      <BorderTypeConfig />
      <BorderStyleConfig />
      {shapeStyle !== ShapeStyle.Line && <FillStyleConfig />}
    </>
  )
}

export default ShapeDrawConfig
