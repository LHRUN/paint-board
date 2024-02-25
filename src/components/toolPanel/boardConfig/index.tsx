import BackgroundConfig from './backgroundConfig'
import CanvasSizeConfig from './canvasSizeConfig'
import CacheConfig from './cacheConfig'
import GuideLineCOnfig from './guideLineConfig'

const boardConfig = () => {
  return (
    <>
      <BackgroundConfig />
      <CanvasSizeConfig />
      <CacheConfig />
      <GuideLineCOnfig />
    </>
  )
}

export default boardConfig
