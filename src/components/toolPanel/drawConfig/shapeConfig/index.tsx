import { useMemo } from 'react'
import useShapeStore from '@/store/shape'
import { ShapeStyle } from '@/constants/shape'

import BorderStyleConfig from './borderStyleConfig'
import BorderTypeConfig from './borderTypeConfig'
import FillStyleConfig from './fillStyleConfig'
import PointCountConfig from './linePointCountConfig'
import ShapeStyleConfig from './shapeStyleConfig'

const ShapeDrawConfig = () => {
  const { shapeStyle } = useShapeStore()
  const isLine = useMemo(() => {
    return [ShapeStyle.Line, ShapeStyle.ArrowLine].includes(shapeStyle)
  }, [shapeStyle])

  return (
    <>
      <ShapeStyleConfig />
      {isLine && <PointCountConfig />}

      <BorderTypeConfig />
      <BorderStyleConfig />
      {!isLine && <FillStyleConfig />}
    </>
  )
}

export default ShapeDrawConfig
