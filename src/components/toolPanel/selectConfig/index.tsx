import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { debounce } from 'lodash'
import { paintBoard } from '@/utils/paintBoard'
import { fabric } from 'fabric'
import { filtersCheckbox } from './constant'
import { renderImageFilters } from '@/utils/element/image'

import FontFamilyConfg from '../drawConfig/freeStyleConfig/fontFamilyConfig'
import LayerConfig from './layerConfig'

const SelectConfig = () => {
  const { t } = useTranslation()
  const [refreshCount, setRefresh] = useState(0) // refresh data

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

  useEffect(() => {
    const refresh = () => setRefresh((v) => v + 1)
    paintBoard.addHookFn(refresh)
    return () => {
      paintBoard.removeHookFn(refresh)
    }
  }, [setRefresh])

  // update current image filters
  const updateImageFilters = (filter: string) => {
    const image = paintBoard.canvas?.getActiveObject() as fabric.Image
    renderImageFilters(image, filter)
    paintBoard.render()
    setRefresh((v) => v + 1)
  }

  const updateFontFamily = (fontFamily: string) => {
    const text = paintBoard.canvas?.getActiveObject() as fabric.Object
    if (text?._customType === 'itext') {
      ;(text as fabric.IText).set('fontFamily', fontFamily)
    } else if (text?._customType === 'drawText') {
      ;(text as fabric.Group)._objects.forEach((obj) => {
        ;(obj as fabric.Text).set('fontFamily', fontFamily)
      })
    }
    paintBoard.render()
    setRefresh((v) => v + 1)
  }

  const currentTextFontFamily = useMemo(() => {
    const text = paintBoard.canvas?.getActiveObject() as fabric.Object
    if (text?._customType === 'itext') {
      return (text as fabric.IText)?.fontFamily || ''
    } else if (text?._customType === 'drawText') {
      const drawText = text as fabric.Group
      return (drawText._objects?.[0] as fabric.Text)?.fontFamily || ''
    }
    return ''
  }, [refreshCount])

  return (
    <div className="form-control">
      {opacityControl.show && (
        <>
          <div className="font-bold font-fredokaOne mt-3">Opacity</div>
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

      {paintBoard.canvas?.getActiveObject() && <LayerConfig />}

      {paintBoard.canvas?.getActiveObject()?.type === 'image' && (
        <>
          <div className="font-bold font-fredokaOne mt-3">Image Filters</div>
          <div className="flex flex-row flex-wrap w-72 items-center justify-between">
            {filtersCheckbox.map((item, index) => (
              <label
                key={index}
                className="cursor-pointer label inline-flex w-32"
              >
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
      )}

      {['drawText', 'itext'].includes(
        paintBoard.canvas?.getActiveObject()?._customType as string
      ) && (
        <FontFamilyConfg
          fontFamily={currentTextFontFamily}
          updateFontFamily={updateFontFamily}
        />
      )}
    </div>
  )
}

export default SelectConfig
