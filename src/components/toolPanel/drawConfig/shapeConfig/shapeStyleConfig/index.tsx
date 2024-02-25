import useShapeStore from '@/store/shape'
import { shapeStyleSwitch } from './constant'
import { useTranslation } from 'react-i18next'

const ShapeStyleConfig = () => {
  const { shapeStyle, updateShapeStyle } = useShapeStore()
  const { t } = useTranslation()

  return (
    <div className="mt-3">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.shapeType')}
      </div>
      {Object.keys(shapeStyleSwitch).map((lineKey) => (
        <div key={lineKey} className="btn-group mt-1 flex">
          {shapeStyleSwitch[lineKey].map(({ type, icon }) => (
            <button
              key={type}
              className={`btn btn-xs flex-grow text-[#eef1ff] ${
                shapeStyle === type ? 'btn-active' : ''
              }`}
              onClick={() => {
                updateShapeStyle(type)
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

export default ShapeStyleConfig
