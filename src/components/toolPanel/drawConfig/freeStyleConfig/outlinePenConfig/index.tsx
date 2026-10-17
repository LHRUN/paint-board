import useDrawStore from '@/store/draw'
import { useTranslation } from 'react-i18next'

const OutlinePenConfig = () => {
  const { t } = useTranslation()
  const {
    freehandStrokeColor,
    freehandStrokeWidth,
    updateFreehandStrokeColor,
    updateFreehandStrokeWidth
  } = useDrawStore()

  return (
    <>
      <div className="mt-2">
        <div className="font-bold text-sm font-fredokaOne">
          {t('title.freehandStrokeColor')}
        </div>
        <div className="w-6 h-6 cursor-pointer mt-1">
          <input
            type="color"
            value={freehandStrokeColor}
            onChange={(event) => updateFreehandStrokeColor(event.target.value)}
            className="colorInput"
          />
        </div>
      </div>
      <div className="mt-2">
        <div className="font-bold text-sm font-fredokaOne">
          {t('title.freehandStrokeWidth')}
        </div>
        <div className="flex items-center mt-0">
          <div className="text-lg font-fredokaOne mr-2 w-12 shrink-0 text-primary-focus">
            {freehandStrokeWidth}
          </div>
          <input
            type="range"
            min={0}
            max={20}
            step={1}
            value={freehandStrokeWidth}
            className="range range-primary range-xs"
            onChange={(event) =>
              updateFreehandStrokeWidth(Number(event.target.value))
            }
          />
        </div>
      </div>
    </>
  )
}

export default OutlinePenConfig
