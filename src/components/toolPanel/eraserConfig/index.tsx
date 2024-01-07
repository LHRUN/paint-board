import useDrawStore from '@/store/draw'

const EraserConfig = () => {
  const { eraserWidth, updateEraserWidth } = useDrawStore()

  return (
    <>
      <div className="mt-3">
        <div className="font-bold text-lg font-fredokaOne">Eraser Width</div>
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
    </>
  )
}

export default EraserConfig
