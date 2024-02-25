import { useTranslation } from 'react-i18next'
import useBoardStore from '@/store/board'

const CacheConfig = () => {
  const { t } = useTranslation()
  const { isObjectCaching, updateCacheState } = useBoardStore()

  return (
    <div className="form-control mt-3">
      <div className="font-bold font-fredokaOne text-sm">
        {t('title.drawCache')}
      </div>
      <div className="mt-1 flex items-start w-full">
        <input
          type="checkbox"
          className="toggle toggle-success"
          checked={isObjectCaching}
          onChange={updateCacheState}
        />
        <div className="text-xs w-40 ml-3">{t('boardConfig.cacheTip')}</div>
      </div>
    </div>
  )
}

export default CacheConfig
