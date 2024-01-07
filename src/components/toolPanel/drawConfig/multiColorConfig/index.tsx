import useDrawStore from '@/store/draw'
import { MultiColorType } from '@/utils/element/draw/multiColor'

const MultiColorSwitch = [
  MultiColorType.COL,
  MultiColorType.ROW,
  MultiColorType.CIRCLE
]

const MultiColorConfig = () => {
  const { multiColorType, updateMultiColorType, drawColors } = useDrawStore()

  return (
    <>
      <div className="mt-3">
        <div className="font-bold text-lg font-fredokaOne">MultiColor Type</div>
        <div className="btn-group mt-1 flex">
          {MultiColorSwitch.map((item, index) => (
            <button
              key={index}
              className={`btn btn-sm flex-grow ${
                multiColorType === item ? 'btn-active' : ''
              }`}
              onClick={() => {
                updateMultiColorType(item)
              }}
            >
              {item === MultiColorType.COL && (
                <div className="flex w-4/6 h-5/6 rounded-lg overflow-hidden ">
                  {drawColors.map((color, index) => (
                    <div
                      className="h-full flex-1"
                      style={{
                        backgroundColor: color
                      }}
                      key={index}
                    ></div>
                  ))}
                </div>
              )}
              {item === MultiColorType.ROW && (
                <div className="flex flex-col w-4/6 h-5/6 rounded-lg overflow-hidden ">
                  {drawColors.map((color, index) => (
                    <div
                      className="h-full flex-1"
                      style={{
                        backgroundColor: color
                      }}
                      key={index}
                    ></div>
                  ))}
                </div>
              )}
              {item === MultiColorType.CIRCLE && (
                <div className="w-4/6 h-5/6 relative">
                  {drawColors.map((color, index) => (
                    <div
                      className="h-6 w-6 rounded-full absolute top-0"
                      style={{
                        backgroundColor: color,
                        left: `${index * 5}px`
                      }}
                      key={index}
                    ></div>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default MultiColorConfig
