import { useState } from 'react'
import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { paintBoard } from '@/core/paintBoard'
import { isPresetActive } from '@/core/element/image/filterCatalog'
import {
  readFilterSnapshots,
  toggleImageFilter
} from '@/core/element/image/filterActions'
import useImageFilterStore from '@/store/imageFilter'
import QuickFilterModal from './quickFilterModal'
import AdjustFilterModal from './adjustFilterModal'

const ImageFilterConfig = () => {
  const { t } = useTranslation()
  const quickFilters = useImageFilterStore((state) => state.quickFilters)
  const [showQuick, setShowQuick] = useState(false)
  const [showAdjust, setShowAdjust] = useState(false)
  const [failed, setFailed] = useState(false)
  const image = paintBoard.canvas?.getActiveObject() as fabric.Image | undefined
  const active = image ? readFilterSnapshots(image) : []

  return (
    <div className="mt-2 flex items-start">
      <div className="flex shrink-0 items-center justify-end gap-1 pt-0.5">
        <span className="whitespace-nowrap text-right font-fredokaOne text-sm font-bold leading-none">
          {t('title.imageFilters')}
        </span>
        <button
          type="button"
          className="inline-flex shrink-0 cursor-pointer tooltip tooltip-right"
          data-tip={t('imageFilter.settings') as string}
          aria-label={t('imageFilter.settings') as string}
          onClick={() => setShowQuick(true)}
        >
          <Settings size={14} />
        </button>
      </div>
      <div className="ml-2 w-44">
        <div className="grid grid-cols-3 gap-x-1 gap-y-1">
          {quickFilters.map((id) => (
            <label
              key={id}
              className="flex items-center gap-1 min-w-0 cursor-pointer"
            >
              <span className="text-xs truncate">{t(`filters.${id}`)}</span>
              <input
                type="checkbox"
                checked={isPresetActive(active, id)}
                onChange={() => {
                  if (!image) {
                    return
                  }
                  setFailed(!toggleImageFilter(image, id))
                }}
                className="checkbox checkbox-xs checkbox-success"
              />
            </label>
          ))}
        </div>
        {failed && (
          <p className="mt-1 text-xs text-error">{t('imageFilter.failed')}</p>
        )}
        <button
          type="button"
          className="btn btn-outline btn-xs w-full mt-2"
          onClick={() => setShowAdjust(true)}
        >
          {t('imageFilter.custom')}
        </button>
      </div>
      <QuickFilterModal open={showQuick} onClose={() => setShowQuick(false)} />
      <AdjustFilterModal
        open={showAdjust}
        onClose={() => setShowAdjust(false)}
      />
    </div>
  )
}

export default ImageFilterConfig
