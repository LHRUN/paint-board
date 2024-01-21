import useShapeStore from '@/store/shape'
import { FillTypeSwitch } from './constant'

const FillStyleConfig = () => {
  const { fillColor, updateFillColor, fillType, updateFillType } =
    useShapeStore()

  return (
    <div className="mt-3">
      <div className="font-bold text-base font-fredokaOne">Fill Style</div>
      <div className="flex mt-1 items-center">
        <div className="w-7 h-7 cursor-pointer">
          <input
            type="color"
            value={fillColor}
            onChange={(e) => {
              updateFillColor(e.target.value)
            }}
            className="colorInput"
          />
        </div>
        <div className="divider divider-horizontal mx-2"></div>
        <div className="tabs tabs-boxed bg-[#333C4D] flex">
          {FillTypeSwitch.map(({ type, icon }) => (
            <button
              key={type}
              className={`tab tab-xs flex-grow text-[#eef1ff] ${
                fillType === type ? 'tab-active' : ''
              }`}
              onClick={() => {
                updateFillType(type)
              }}
            >
              {icon({})}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FillStyleConfig
