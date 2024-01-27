import useDrawStore from '@/store/draw'
import { useTranslation } from 'react-i18next'
import { styleSwitch } from './constant'

const DrawStyleConfig = () => {
  const { t } = useTranslation()
  const { drawStyle, updateDrawStyle } = useDrawStore()

  return (
    <div className="mt-2">
      <div className="font-bold text-base font-fredokaOne">Draw Style</div>
      {Object.keys(styleSwitch).map((lineKey) => (
        <div key={lineKey} className="btn-group mt-1 flex">
          {styleSwitch[lineKey].map(({ type, text }) => (
            <button
              key={type}
              className={`btn btn-xs flex-grow font-fredokaOne text-xs ${
                drawStyle === type ? 'btn-active' : ''
              }`}
              onClick={() => updateDrawStyle(type)}
            >
              {t(text)}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

export default DrawStyleConfig
