import BorderStyleConfig from './borderStyleConfig'
import BorderTypeConfig from './borderTypeConfig'
import FillStyleConfig from './fillStyleConfig'
import ShapeStyleConfig from './shapeStyleConfig'

const ShapeDrawConfig = () => {
  return (
    <>
      <ShapeStyleConfig />
      <BorderTypeConfig />
      <BorderStyleConfig />
      <FillStyleConfig />
    </>
  )
}

export default ShapeDrawConfig
