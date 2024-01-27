import useBoardStore from '@/store/board'

const CanvasSizeConfig = () => {
  const { canvasWidth, canvasHeight, updateCanvasWidth, updateCanvasHeight } =
    useBoardStore()

  return (
    <div className="form-control mt-3">
      <div className="font-bold font-fredokaOne">Canvas Size</div>
      <div className="mt-1 flex items-center w-full">
        <div className="text-sm font-fredokaOne w-12 mr-2 shrink-0">Width</div>
        <div className="text-sm font-fredokaOne mr-2 text-primary-focus w-9 shrink-0">
          {(canvasWidth * 100).toFixed(0) + '%'}
        </div>
        <input
          className="range range-primary range-xs"
          type="range"
          min="0.1"
          max="1"
          step="0.01"
          value={String(canvasWidth)}
          onChange={(e) => {
            updateCanvasWidth(Number(e.target.value))
          }}
        />
      </div>
      <div className="mt-1 flex items-center w-full">
        <div className="text-sm font-fredokaOne w-12 mr-2 shrink-0">Height</div>
        <div className="text-sm font-fredokaOne mr-2 text-primary-focus w-9 shrink-0">
          {(canvasHeight * 100).toFixed(0) + '%'}
        </div>
        <input
          className="range range-primary range-xs"
          type="range"
          min="0.1"
          max="1"
          step="0.01"
          value={String(canvasHeight)}
          onChange={(e) => {
            updateCanvasHeight(Number(e.target.value))
          }}
        />
      </div>
    </div>
  )
}

export default CanvasSizeConfig
