import useShapeStore from '@/store/shape'

const BorderStyleConfig = () => {
  const { borderColor, updateBorderColor, borderWidth, updateBorderWidth } =
    useShapeStore()

  return (
    <div className="mt-3">
      <div className="font-bold text-base font-fredokaOne">Border Style</div>
      <div className="flex mt-1 items-center">
        <div className="w-7 h-7 cursor-pointer">
          <input
            type="color"
            value={borderColor}
            onChange={(e) => {
              updateBorderColor(e.target.value)
            }}
            className="colorInput"
          />
        </div>
        <div className="divider divider-horizontal mx-2"></div>
        <div className="text-lg font-fredokaOne mr-2 text-primary-focus">
          {borderWidth}
        </div>
        <input
          type="range"
          min="1"
          max="20"
          step="1"
          value={borderWidth}
          className="range range-primary range-xs cursor-pointer"
          onChange={(e) => updateBorderWidth(Number(e.target.value))}
        />
      </div>
    </div>
  )
}

export default BorderStyleConfig
