import useDrawStore from '@/store/draw'

const DrawWidthConfig = () => {
  const { drawWidth, updateDrawWidth } = useDrawStore()

  return (
    <div className="mt-2">
      <div className="font-bold text-base font-fredokaOne">Draw Width</div>
      <div className="flex items-center">
        <div className="text-lg font-fredokaOne mr-2 text-primary-focus">
          {drawWidth}
        </div>
        <input
          type="range"
          min="5"
          max="30"
          step="1"
          value={drawWidth}
          className="range range-primary range-xs"
          onChange={(e) => updateDrawWidth(Number(e.target.value))}
        />
      </div>
    </div>
  )
}

export default DrawWidthConfig
