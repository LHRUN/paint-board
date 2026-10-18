import debounce from 'lodash-es/debounce'
import { useTranslation } from 'react-i18next'
import ColorSwatchList from '@/components/toolPanel/colorSwatchList'
import useDrawStore from '@/store/draw'
import { FREEHAND_STROKE_COLOR_LIMIT } from '@/store/freehandStrokeColor'

const OutlinePenConfig = () => {
  const { t } = useTranslation()
  const {
    freehandStrokeColors,
    currentFreehandStrokeColor,
    freehandStrokeWidth,
    updateCurrentFreehandStrokeColor,
    updateFreehandStrokeColor,
    deleteFreehandStrokeColor,
    updateFreehandStrokeWidth
  } = useDrawStore()

  const handleStrokeColor = debounce((color: string, colorIndex: number) => {
    updateFreehandStrokeColor(color, colorIndex)
  }, 100)

  return (
    <>
      <ColorSwatchList
        label={t('title.freehandStrokeColor')}
        inputId="freehand-stroke-color-input"
        colors={freehandStrokeColors}
        activeIndexes={[currentFreehandStrokeColor]}
        maxColors={FREEHAND_STROKE_COLOR_LIMIT}
        onSelect={updateCurrentFreehandStrokeColor}
        onEdit={handleStrokeColor}
        onAdd={() => {
          updateFreehandStrokeColor('#000000', freehandStrokeColors.length)
        }}
        onDelete={deleteFreehandStrokeColor}
      />
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
