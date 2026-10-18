import { useTranslation } from 'react-i18next'
import { paintBoard } from '@/core/paintBoard'
import { refreshEditingBox } from '@/core/element/text/editingBox'
import { canSnapshotTextChange } from '@/core/element/text/editingSnapshot'
import { fontStyleCheckbox } from './constant'
import { useMemo, FC } from 'react'
import { FontStyle } from '@/constants/font'
import useDrawStore from '@/store/draw'

interface IProps {
  refreshCount: number
}

const FontStyleConfig: FC<IProps> = ({ refreshCount }) => {
  const { t } = useTranslation()
  const { updateFontStyles } = useDrawStore()

  const currentFontStyle = useMemo(() => {
    const obj = paintBoard.canvas?.getActiveObject() as fabric.IText
    const fontStyles = []
    if (obj.fontWeight === 'bold') {
      fontStyles.push(FontStyle.BOLD)
    }
    if (obj.fontStyle === 'italic') {
      fontStyles.push(FontStyle.ITALIC)
    }
    if (obj.underline) {
      fontStyles.push(FontStyle.UNDER_LINE)
    }
    if (obj.linethrough) {
      fontStyles.push(FontStyle.LINE_THROUGH)
    }
    return fontStyles
  }, [refreshCount])

  const updateFontStyle = (type: string) => {
    updateFontStyles(type)

    const obj = paintBoard.canvas?.getActiveObject() as fabric.IText
    switch (type) {
      case FontStyle.BOLD:
        obj.set({
          fontWeight: obj.fontWeight === 'bold' ? 'normal' : 'bold'
        })
        break
      case FontStyle.ITALIC:
        obj.set({
          fontStyle: obj.fontStyle === 'italic' ? 'normal' : 'italic'
        })
        break
      case FontStyle.UNDER_LINE:
        obj.set({
          underline: !obj.underline
        })
        break
      case FontStyle.LINE_THROUGH:
        obj.set({
          linethrough: !obj.linethrough
        })
        break
      default:
        break
    }
    if (obj?.type === 'i-text') {
      void refreshEditingBox(obj)
    }
    if (canSnapshotTextChange(obj ? [obj] : [])) {
      paintBoard.render()
    } else {
      paintBoard.canvas?.requestRenderAll()
    }
    paintBoard.triggerHook()
  }

  return (
    <div className="flex items-start mt-2">
      <div className="font-bold font-fredokaOne text-sm w-20 shrink-0 text-right">
        {t('title.fontStyle')}
      </div>
      <div className="flex flex-row flex-wrap gap-x-2 items-center w-40 ml-2">
        {fontStyleCheckbox.map((item, index) => (
          <label
            key={index}
            className="cursor-pointer label inline-flex justify-start p-1"
          >
            <span className="label-text mr-2 font-fredokaOne text-xs">
              {t(item.text)}
            </span>
            <input
              type="checkbox"
              checked={currentFontStyle?.includes(item.type)}
              onChange={() => updateFontStyle(item.type)}
              className="checkbox checkbox-success checkbox-xs"
            />
          </label>
        ))}
      </div>
    </div>
  )
}

export default FontStyleConfig
