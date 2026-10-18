import useDrawStore from '@/store/draw'
import { useTranslation } from 'react-i18next'

type SliderProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

const Slider = ({ label, value, min, max, step, onChange }: SliderProps) => {
  return (
    <div className="mt-2">
      <div className="font-bold text-sm font-fredokaOne">{label}</div>
      <div className="flex items-center mt-0">
        <div className="text-lg font-fredokaOne mr-2 w-12 shrink-0 text-primary-focus">
          {value}
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          className="range range-primary range-xs"
          onChange={(event) =>
            onChange(Math.round(Number(event.target.value) * 100) / 100)
          }
        />
      </div>
    </div>
  )
}

const FreehandConfig = () => {
  const { t } = useTranslation()
  const {
    freehandThinning,
    freehandSmoothing,
    freehandStreamline,
    freehandStartTaper,
    freehandEndTaper,
    updateFreehandThinning,
    updateFreehandSmoothing,
    updateFreehandStreamline,
    updateFreehandStartTaper,
    updateFreehandEndTaper
  } = useDrawStore()

  return (
    <>
      <Slider
        label={t('title.freehandThinning')}
        value={freehandThinning}
        min={0}
        max={1}
        step={0.05}
        onChange={updateFreehandThinning}
      />
      <Slider
        label={t('title.freehandSmoothing')}
        value={freehandSmoothing}
        min={0}
        max={1}
        step={0.05}
        onChange={updateFreehandSmoothing}
      />
      <Slider
        label={t('title.freehandStreamline')}
        value={freehandStreamline}
        min={0}
        max={1}
        step={0.05}
        onChange={updateFreehandStreamline}
      />
      <Slider
        label={t('title.freehandStartTaper')}
        value={freehandStartTaper}
        min={0}
        max={100}
        step={1}
        onChange={updateFreehandStartTaper}
      />
      <Slider
        label={t('title.freehandEndTaper')}
        value={freehandEndTaper}
        min={0}
        max={100}
        step={1}
        onChange={updateFreehandEndTaper}
      />
    </>
  )
}

export default FreehandConfig
