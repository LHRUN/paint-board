import useShapeStore from '@/store/shape'
import { useTranslation } from 'react-i18next'
import { FC } from 'react'

interface IProps {
  borderColor?: string
  updateBorderColor?: (borderColor: string) => void
  borderWidth?: number
  updateBorderWidth?: (borderWidth: number) => void
}

const BorderStyleConfig: FC<IProps> = (props) => {
  const { t } = useTranslation()
  const { borderColor, updateBorderColor, borderWidth, updateBorderWidth } =
    useShapeStore()

  return (
    <div className="mt-3">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.borderStyle')}
      </div>
      <div className="flex mt-1 items-center">
        <div className="w-7 h-7 cursor-pointer">
          <input
            type="color"
            value={props?.borderColor ?? borderColor}
            onChange={(e) => {
              updateBorderColor(e.target.value)
              props?.updateBorderColor?.(e.target.value)
            }}
            className="colorInput"
          />
        </div>
        <div className="divider divider-horizontal mx-2"></div>
        <div className="text-lg font-fredokaOne mr-2 text-primary-focus">
          {props?.borderWidth ?? borderWidth}
        </div>
        <input
          type="range"
          min="1"
          max="20"
          step="1"
          value={props?.borderWidth ?? borderWidth}
          className="range range-primary range-xs cursor-pointer"
          onChange={(e) => {
            updateBorderWidth(Number(e.target.value))
            props?.updateBorderWidth?.(Number(e.target.value))
          }}
        />
      </div>
    </div>
  )
}

export default BorderStyleConfig
