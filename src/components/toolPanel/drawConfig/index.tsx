import { useTranslation } from 'react-i18next'
import useBoardStore from '@/store/board'
import { DrawTypeSwitch } from './constant'
import { DrawType } from '@/constants/draw'

import FreeDrawConfig from './freeStyleConfig'
import ShapeDrawConfig from './shapeConfig'

const DrawConfig = () => {
  const { t } = useTranslation()
  const { drawType, updateDrawType } = useBoardStore()

  return (
    <>
      <div className="font-bold text-sm font-fredokaOne mt-2">
        {t('title.drawType')}
      </div>
      <div className="btn-group flex mt-1">
        {DrawTypeSwitch.map(({ type, text }) => (
          <button
            key={type}
            className={`btn btn-xs flex-grow font-fredokaOne font-normal ${
              drawType === type ? 'btn-active font-semibold' : ''
            }`}
            onClick={() => {
              updateDrawType(type)
            }}
          >
            {t(text)}
          </button>
        ))}
      </div>
      {drawType === DrawType.FreeStyle && <FreeDrawConfig />}
      {drawType === DrawType.Shape && <ShapeDrawConfig />}
    </>
  )
}

export default DrawConfig
