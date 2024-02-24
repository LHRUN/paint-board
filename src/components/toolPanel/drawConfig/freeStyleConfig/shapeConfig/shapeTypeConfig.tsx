import useDrawStore from '@/store/draw'
import { shapeSwitch } from './constant'
import { useTranslation } from 'react-i18next'

const shapeTypeConfig = () => {
  const { drawShape, updateDrawShape } = useDrawStore()
  const { t } = useTranslation()

  return (
    <div className="mt-3">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.shapeType')}
      </div>
      {Object.keys(shapeSwitch).map((lineKey) => (
        <div key={lineKey} className="btn-group mt-1 flex">
          {shapeSwitch[lineKey].map(({ type, icon }) => (
            <button
              key={type}
              className={`btn btn-xs flex-grow text-white ${
                drawShape === type ? 'btn-active' : ''
              }`}
              onClick={() => {
                updateDrawShape(type)
              }}
            >
              {icon({})}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export default shapeTypeConfig
