import useDrawStore from '@/store/draw'

const EraserConfig = () => {
  const { eraserWidth, updateEraserWidth } = useDrawStore()

  return (
    <>
      <div className="mt-3">
        <div className="font-bold text-lg font-fredokaOne">Eraser Width</div>
        <div className="flex items-center">
          <div className="text-lg font-fredokaOne mr-2 text-primary-focus">
            {eraserWidth}
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="1"
            value={eraserWidth}
            className="range range-primary range-xs"
            onChange={(e) => updateEraserWidth(Number(e.target.value))}
          />
        </div>
      </div>
    </>
  )
}

export default EraserConfig
