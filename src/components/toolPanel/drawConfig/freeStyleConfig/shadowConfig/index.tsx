import useDrawStore from '@/store/draw'
import { useTranslation } from 'react-i18next'

const ShadowConfig = () => {
  const { t } = useTranslation()
  const {
    shadowColor,
    updateShadowColor,
    shadowBlur,
    updateShadowBlur,
    shadowOffsetX,
    updateShadowOffsetX,
    shadowOffsetY,
    updateShadowOffsetY
  } = useDrawStore()

  return (
    <div className="mt-2">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.shadow')}
        <span className="text-xs font-fredokaOne">
          ({t('shadow.configTip')})
        </span>
      </div>
      <div className="flex mt-1 items-center gap-x-1">
        <div className="w-6 h-6 cursor-pointer">
          <input
            type="color"
            value={shadowColor}
            onChange={(e) => {
              updateShadowColor(e.target.value)
            }}
            className="colorInput"
          />
        </div>
        <div className="divider divider-horizontal mx-0"></div>
        <input
          type="range"
          min="0"
          max="50"
          step="1"
          value={shadowBlur}
          className="range range-success range-xs w-16"
          onChange={(e) => updateShadowBlur(Number(e.target.value))}
        />
        <input
          type="range"
          min="-30"
          max="30"
          step="1"
          value={shadowOffsetX}
          className="range range-success range-xs w-16"
          onChange={(e) => updateShadowOffsetX(Number(e.target.value))}
        />
        <input
          type="range"
          min="-30"
          max="30"
          step="1"
          value={shadowOffsetY}
          className="range range-success range-xs w-16"
          onChange={(e) => updateShadowOffsetY(Number(e.target.value))}
        />
      </div>
    </div>
  )
}

export default ShadowConfig
