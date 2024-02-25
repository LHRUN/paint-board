import { paintBoard } from '@/utils/paintBoard'
import { debounce } from 'lodash'
import { useCallback, useMemo, FC } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  refreshCount: number
}

const OpacityConfig: FC<IProps> = ({ refreshCount }) => {
  const { t } = useTranslation()

  // activity opacity
  const opacityControl = useMemo(() => {
    let show = false
    let opacity = 1
    const objects = paintBoard.canvas?.getActiveObjects()
    if (objects?.length) {
      show = true
      const opacitys = objects?.map((item) => {
        return item.opacity ?? 1
      })
      if (opacitys.length) {
        opacity = Math.max(...opacitys)
      }
    }

    return {
      show,
      opacity
    }
  }, [refreshCount])

  // save steps by debounce
  const saveHistory = useCallback(
    debounce(() => {
      paintBoard.history?.saveState()
    }, 500),
    []
  )

  // update activity object opacity
  const updateObjectOpacity = (opacity: number) => {
    const objects = paintBoard.canvas?.getActiveObjects()
    if (objects?.length) {
      objects?.forEach((obj) => {
        obj.opacity = opacity
      })
      paintBoard.canvas?.fire('selection:updated')
      paintBoard.canvas?.renderAll()
      saveHistory()
    }
  }

  return (
    <>
      {opacityControl.show && (
        <>
          <div className="font-bold font-fredokaOne mt-3 text-sm">
            {t('title.opacity')}
          </div>
          <div className="mt-1 flex items-center w-full">
            <input
              className="range range-primary range-xs"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={opacityControl.opacity}
              onChange={(e) => updateObjectOpacity(Number(e.target.value))}
            />
          </div>
        </>
      )}
    </>
  )
}

export default OpacityConfig
