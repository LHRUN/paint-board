import BorderStyleConfig from './borderStyleConfig'
import BorderTypeConfig from './borderTypeConfig'
import FillStyleConfig from './fillStyleConfig'
import PointCountConfig from './linePointCountConfig'
import ShapeStyleConfig from './shapeStyleConfig'

const ShapeDrawConfig = () => {
  return (
    <>
      <ShapeStyleConfig />
      <PointCountConfig />
      <BorderTypeConfig />
      <BorderStyleConfig />
      <FillStyleConfig />
    </>
  )
}

export default ShapeDrawConfig
