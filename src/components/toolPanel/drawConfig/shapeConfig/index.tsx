import useDrawStore from '@/store/draw'
import { shapeSwitch } from '../constant'

const ShapeConfig = () => {
  const { drawShape, updateDrawShape, drawShapeCount, updateDrawShapeCount } =
    useDrawStore()

  return (
    <>
      <div className="mt-3">
        <div className="font-bold text-lg font-fredokaOne">Shape type</div>
        {Object.keys(shapeSwitch).map((lineKey) => (
          <div key={lineKey} className="btn-group mt-1 flex">
            {shapeSwitch[lineKey].map(({ type, icon }) => (
              <button
                key={type}
                className={`btn btn-sm flex-grow ${
                  drawShape === type ? 'btn-active' : ''
                }`}
                onClick={() => {
                  updateDrawShape(type)
                }}
              >
                {icon({})}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3">
        <div className="font-bold text-lg font-fredokaOne">Shape Count</div>
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
    </>
  )
}

export default ShapeConfig
