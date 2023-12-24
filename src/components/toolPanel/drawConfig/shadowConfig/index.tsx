import styles from './index.module.css'
import useDrawStore from '@/store/draw'

const ShadowConfig = () => {
  const { shadowColor, updateShadowColor, shadowWidth, updateShadowWidth } =
    useDrawStore()

  return (
    <div className="mt-3">
      <div className="font-bold text-lg font-fredokaOne">Shadow</div>
      <div className="flex mt-1 items-center">
        <div className="w-8 h-8 mr-2 cursor-pointer">
          <input
            type="color"
            value={shadowColor}
            onChange={(e) => {
              updateShadowColor(e.target.value)
            }}
            className={styles.drawColor}
          />
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
