import { FC } from 'react'
import useShapeStore from '@/store/shape'
import { useTranslation } from 'react-i18next'
import { FillTypeSwitch } from './constant'

interface IProps {
  fillColor?: string
  updateFillColor?: (fillColor: string) => void
  fillType?: string
  updateFillType?: (fillType: string) => void
}

const FillStyleConfig: FC<IProps> = (props) => {
  const { t } = useTranslation()
  const { fillColor, updateFillColor, fillType, updateFillType } =
    useShapeStore()

  return (
    <div className="mt-3">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.fillStyle')}
      </div>
      <div className="flex mt-1 items-center">
        <div className="w-7 h-7 cursor-pointer">
          <input
            type="color"
            value={props?.fillColor || fillColor}
            onChange={(e) => {
              updateFillColor(e.target.value)
              props?.updateFillColor?.(e.target.value)
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
                (props?.fillType || fillType) === type ? 'tab-active' : ''
              }`}
              onClick={() => {
                updateFillType(type)
                props?.updateFillType?.(type)
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
