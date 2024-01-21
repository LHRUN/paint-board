import useShapeStore from '@/store/shape'
import { borderTypeSwitch } from './constant'

const BorderTypeConfig = () => {
  const { borderType, updateBorderType } = useShapeStore()

  return (
    <div className="mt-3">
      <div className="font-bold text-base font-fredokaOne">Border Type</div>
      {Object.keys(borderTypeSwitch).map((lineKey) => (
        <div key={lineKey} className="btn-group mt-1 flex">
          {borderTypeSwitch[lineKey].map(({ type, icon }) => (
            <button
              key={type}
              className={`btn btn-xs flex-grow ${
                borderType === type ? 'btn-active' : ''
              }`}
              onClick={() => {
                updateBorderType(type)
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

export default BorderTypeConfig
