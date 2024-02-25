import { paintBoard } from '@/utils/paintBoard'
import { filtersCheckbox } from './constant'
import { renderImageFilters } from '@/utils/element/image'
import { useTranslation } from 'react-i18next'

const ImageFilterConfig = () => {
  const { t } = useTranslation()

  // update current image filters
  const updateImageFilters = (filter: string) => {
    const image = paintBoard.canvas?.getActiveObject() as fabric.Image
    renderImageFilters(image, filter)
    paintBoard.render()
    paintBoard.triggerHook()
  }

  return (
    <>
      <div className="font-bold font-fredokaOne mt-3 text-sm">
        {t('title.imageFilters')}
      </div>
      <div className="flex flex-row flex-wrap w-72 items-center justify-between">
        {filtersCheckbox.map((item, index) => (
          <label key={index} className="cursor-pointer label inline-flex w-32">
            <span className="label-text mr-2">{t(item.text)}</span>
            <input
              type="checkbox"
              checked={(
                (
                  paintBoard.canvas?.getActiveObject() as fabric.Image
                )?.filters?.map((item: any) => item?.type ?? '') ?? []
              ).includes(item.type)}
              onChange={() => updateImageFilters(item.type)}
              className="checkbox checkbox-success"
            />
          </label>
        ))}
      </div>
    </>
  )
}

export default ImageFilterConfig
