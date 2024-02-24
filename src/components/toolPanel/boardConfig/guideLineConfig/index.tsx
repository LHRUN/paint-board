import useBoardStore from '@/store/board'
import { useTranslation } from 'react-i18next'

const GuideLineCOnfig = () => {
  const { openGuideLine, updateOpenGuideLine } = useBoardStore()
  const { t } = useTranslation()

  return (
    <div className="form-control mt-3">
      <div className="font-bold font-fredokaOne text-sm">
        {t('title.guideLine')}
      </div>
      <div className="mt-1 flex items-start w-full">
        <input
          type="checkbox"
          className="toggle toggle-success"
          checked={openGuideLine}
          onChange={updateOpenGuideLine}
        />
      </div>
    </div>
  )
}

export default GuideLineCOnfig
