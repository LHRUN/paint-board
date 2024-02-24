import useDrawStore from '@/store/draw'
import { useTranslation } from 'react-i18next'

const ShadowConfig = () => {
  const { t } = useTranslation()
  const { shadowColor, updateShadowColor, shadowWidth, updateShadowWidth } =
    useDrawStore()

  return (
    <div className="mt-3">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.shadow')}
      </div>
      <div className="flex mt-1 items-center">
        <div className="w-7 h-7 cursor-pointer">
          <input
            type="color"
            value={shadowColor}
            onChange={(e) => {
              updateShadowColor(e.target.value)
            }}
            className="colorInput"
          />
        </div>
        <div className="divider divider-horizontal mx-1"></div>
        <div className="text-lg font-fredokaOne mr-2 text-primary-focus">
          {shadowWidth}
        </div>
        <input
          type="range"
          min="0"
          max="50"
          step="5"
          value={shadowWidth}
          className="range range-primary range-xs cursor-pointer"
          onChange={(e) => updateShadowWidth(Number(e.target.value))}
        />
      </div>
    </div>
  )
}

export default ShadowConfig
