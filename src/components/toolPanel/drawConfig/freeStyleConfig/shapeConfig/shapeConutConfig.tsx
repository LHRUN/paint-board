import useDrawStore from '@/store/draw'
import { useTranslation } from 'react-i18next'

const ShapeConfig = () => {
  const { drawShapeCount, updateDrawShapeCount } = useDrawStore()
  const { t } = useTranslation()

  return (
    <div className="mt-3">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.shapeCount')}
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={drawShapeCount}
        className="range range-primary range-xs"
        step="1"
        onChange={(e) => updateDrawShapeCount(Number(e.target.value))}
      />
      <div className="w-full flex justify-between text-xs px-2 font-fredokaOne">
        <span>1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
        <span>5</span>
      </div>
    </div>
  )
}

export default ShapeConfig
