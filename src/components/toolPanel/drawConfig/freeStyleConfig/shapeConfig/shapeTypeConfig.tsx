import useDrawStore from '@/store/draw'
import { shapeSwitch } from './constant'

const shapeTypeConfig = () => {
  const { drawShape, updateDrawShape } = useDrawStore()

  return (
    <div className="mt-3">
      <div className="font-bold text-base font-fredokaOne">Shape type</div>
      {Object.keys(shapeSwitch).map((lineKey) => (
        <div key={lineKey} className="btn-group mt-1 flex">
          {shapeSwitch[lineKey].map(({ type, icon }) => (
            <button
              key={type}
              className={`btn btn-xs flex-grow text-white ${
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
  )
}

export default shapeTypeConfig
