import { useMemo, FC } from 'react'
import { paintBoard } from '@/utils/paintBoard'
import { useTranslation } from 'react-i18next'

interface IProps {
  refreshCount: number
}

const EraserConfig: FC<IProps> = ({ refreshCount }) => {
  const { t } = useTranslation()

  const erasableControl = useMemo(() => {
    let show = false
    let erasable = true
    const objects = paintBoard.canvas?.getActiveObjects()

    if (objects?.length) {
      show = true
      erasable = !objects?.every((obj) => obj?.erasable === false)
    }

    return {
      show,
      erasable
    }
  }, [refreshCount])

  const updateObjectErasable = () => {
    const objects = paintBoard.canvas?.getActiveObjects()
    if (objects?.length) {
      objects?.forEach((obj) => {
        obj.erasable = !erasableControl.erasable
      })
      paintBoard.canvas?.fire('selection:updated')
      paintBoard.render()
    }
  }

  return (
    <>
      {erasableControl.show && (
        <>
          <div className="font-bold font-fredokaOne mt-3 text-sm">
            {t('eraserConfig.eraser')}
          </div>
          <div className="mt-1 flex items-center w-full">
            <div className="font-fredokaOne text-xs mr-3">
              {t('eraserConfig.erasable')}
            </div>
            <input
              type="checkbox"
              className="toggle toggle-success"
              checked={erasableControl.erasable}
              onChange={updateObjectErasable}
            />
          </div>
        </>
      )}
    </>
  )
}

export default EraserConfig
