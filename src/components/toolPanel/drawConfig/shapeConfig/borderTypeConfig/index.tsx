import useShapeStore from '@/store/shape'
import { useTranslation } from 'react-i18next'
import { borderTypeSwitch } from './constant'
import { FC } from 'react'

interface IProps {
  borderType?: string
  updateBorderType?: (borderType: string) => void
}

const BorderTypeConfig: FC<IProps> = (props) => {
  const { borderType, updateBorderType } = useShapeStore()
  const { t } = useTranslation()

  return (
    <div className="mt-3">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.borderType')}
      </div>
      {Object.keys(borderTypeSwitch).map((lineKey) => (
        <div key={lineKey} className="btn-group mt-1 flex">
          {borderTypeSwitch[lineKey].map(({ type, icon }) => (
            <button
              key={type}
              className={`btn btn-xs flex-grow ${
                (props.borderType || borderType) === type ? 'btn-active' : ''
              }`}
              onClick={() => {
                updateBorderType(type)
                props?.updateBorderType?.(type)
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
