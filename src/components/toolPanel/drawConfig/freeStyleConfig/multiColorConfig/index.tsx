import useDrawStore from '@/store/draw'
import { MultiColorType } from '@/utils/element/draw/multiColor'
import { useTranslation } from 'react-i18next'

const MultiColorSwitch = [
  MultiColorType.COL,
  MultiColorType.ROW,
  MultiColorType.CIRCLE
]

const MultiColorConfig = () => {
  const { multiColorType, updateMultiColorType, drawColors } = useDrawStore()
  const { t } = useTranslation()

  return (
    <>
      <div className="mt-3">
        <div className="font-bold text-sm font-fredokaOne">
          {t('title.multiColorType')}
        </div>
        <div className="btn-group mt-1 flex">
          {MultiColorSwitch.map((item, index) => (
            <button
              key={index}
              className={`btn btn-xs flex-grow ${
                multiColorType === item ? 'btn-active' : ''
              }`}
              onClick={() => {
                updateMultiColorType(item)
              }}
            >
              {item === MultiColorType.COL && (
                <div className="flex w-4/6 h-4/6 rounded-lg overflow-hidden ">
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
                <div className="flex flex-col w-4/6 h-4/6 rounded-lg overflow-hidden ">
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
                <div className="w-4/6 h-4/6 relative">
                  {drawColors.map((color, index) => (
                    <div
                      className="h-4 w-4 rounded-full absolute top-0"
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
