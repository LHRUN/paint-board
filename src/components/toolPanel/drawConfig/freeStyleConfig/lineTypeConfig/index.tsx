import useDrawStore from '@/store/draw'
import { useTranslation } from 'react-i18next'
import { drawLineTypeSwitch } from '@/constants/drawLineType'
import { FC } from 'react'

const LineTypeConfig: FC = () => {
  const { lineType, updateLineType } = useDrawStore()
  const { t } = useTranslation()

  return (
    <div className="mt-3">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.lineType')}
      </div>
      {Object.keys(drawLineTypeSwitch).map((lineKey) => (
        <div key={lineKey} className="btn-group mt-1 flex">
          {drawLineTypeSwitch[lineKey].map(({ type, icon }) => (
            <button
              key={type}
              className={`btn btn-xs flex-grow ${
                lineType === type ? 'btn-active' : ''
              }`}
              onClick={() => {
                updateLineType(type)
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

export default LineTypeConfig
