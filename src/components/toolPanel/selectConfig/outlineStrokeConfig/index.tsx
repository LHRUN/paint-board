import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import { paintBoard } from '@/core/paintBoard'
import { paintOutlineStroke } from '@/core/element/selectEdit/paint'

const OutlineStrokeConfig = ({ refreshCount }: { refreshCount: number }) => {
  const { t } = useTranslation()
  const objects = useMemo(() => {
    const active = paintBoard.canvas?.getActiveObjects() ?? []
    const outlined = active.filter(
      (object) =>
        object._customType === ELEMENT_CUSTOM_TYPE.FREEHAND_STROKE &&
        (object.strokeWidth ?? 0) > 0
    )
    return outlined.length === active.length ? outlined : []
  }, [refreshCount])

  if (!objects.length) {
    return null
  }

  const stroke = objects[0].stroke
  const color = typeof stroke === 'string' && stroke ? stroke : '#FF6363'

  return (
    <div className="mt-2">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.freehandStrokeColor')}
      </div>
      <div className="w-6 h-6 cursor-pointer mt-1">
        <input
          type="color"
          value={color}
          className="colorInput"
          onChange={(event) => {
            const next = event.target.value
            const changed = objects.some((object) =>
              paintOutlineStroke(object, next)
            )
            if (changed) {
              paintBoard.render()
            } else {
              paintBoard.canvas?.requestRenderAll()
            }
            paintBoard.triggerHook()
          }}
        />
      </div>
    </div>
  )
}

export default OutlineStrokeConfig
