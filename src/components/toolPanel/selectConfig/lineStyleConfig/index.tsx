import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import useDrawStore from '@/store/draw'
import useShapeStore from '@/store/shape'
import { paintBoard } from '@/core/paintBoard'
import { drawLineTypeSwitch } from '@/components/toolPanel/drawConfig/freeStyleConfig/lineTypeConfig/constants'
import {
  paintLineStyle,
  selectionEdit,
  sharedLineStyle,
  type Editable
} from '@/core/element/selectEdit/paint'

interface IProps {
  refreshCount: number
}

const readTargets = () => {
  const objects = (paintBoard.canvas?.getActiveObjects() ?? []) as Editable[]
  if (!selectionEdit(objects).line) {
    return []
  }
  return objects
}

const LineStyleConfig = ({ refreshCount }: IProps) => {
  const { t } = useTranslation()
  const targets = useMemo(() => readTargets(), [refreshCount])
  const currentStyle = sharedLineStyle(targets)
  const lineKind = selectionEdit(targets).line

  if (!lineKind) {
    return null
  }

  const applyStyle = (style: string) => {
    const objects = readTargets()
    const kind = selectionEdit(objects).line
    const changed = objects.some((object) => paintLineStyle(object, style))
    if (kind === 'brush') {
      useDrawStore.getState().updateLineType(style)
    }
    if (kind === 'shape') {
      useShapeStore.getState().updateStrokeStyle(style)
    }
    if (changed) {
      paintBoard.render()
    } else {
      paintBoard.canvas?.requestRenderAll()
    }
    paintBoard.triggerHook()
  }

  return (
    <div className="mt-2 flex items-center">
      <div className="font-bold font-fredokaOne text-sm w-20 shrink-0 text-right">
        {t(lineKind === 'brush' ? 'title.lineType' : 'title.strokeStyle')}
      </div>
      <div className="ml-2 flex items-center gap-2">
        {drawLineTypeSwitch.map(({ type, icon }) => (
          <div
            key={type}
            className={`w-7 h-7 rounded-lg cursor-pointer bg-white flex items-center justify-center ${
              currentStyle === type
                ? 'ring-2 ring-primary'
                : 'hover:ring-2 ring-base-200'
            }`}
            onClick={() => {
              applyStyle(type)
            }}
          >
            {icon({})}
          </div>
        ))}
      </div>
    </div>
  )
}

export default LineStyleConfig
