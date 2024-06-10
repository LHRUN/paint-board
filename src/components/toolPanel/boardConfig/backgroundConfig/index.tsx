import { useCallback, useEffect, ChangeEvent, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import useBoardStore from '@/store/board'

import { paintBoard } from '@/utils/paintBoard'
import { debounce } from 'lodash'
import { rgbaToHex } from '@/utils/common/color'

import OpacityIcon from '@/components/icons/opacity.svg?react'
import UploadIcon from '@/components/icons/boardOperation/upload.svg?react'
import ClearIcon from '@/components/icons/clear.svg?react'
import UploadSuccessIcon from '@/components/icons/uploadSuccess.svg?react'

const BackgroundConfig = () => {
  const {
    backgroundColor,
    backgroundOpacity,
    hasBackgroundImage,
    backgroundImageOpacity,
    updateBackgroundColor,
    updateBackgroundOpacity,
    updateBackgroundImage,
    updateBackgroundImageOpacity,
    cleanBackgroundImage,
    initBackground
  } = useBoardStore()
  const { t } = useTranslation()

  // save steps by debounce
  const saveHistory = useCallback(
    debounce(() => {
      paintBoard.render()
    }, 500),
    []
  )

  useEffect(() => {
    paintBoard.addHookFn(initBackground)
    return () => {
      paintBoard.removeHookFn(initBackground)
    }
  }, [initBackground])

  // upload background image file
  const uploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (fEvent) => {
      const data = fEvent.target?.result
      if (data) {
        if (data && typeof data === 'string') {
          updateBackgroundImage(data)
        }
      }
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  const clickCleanBackgroundImage = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    cleanBackgroundImage()
  }

  return (
    <div className="form-control mt-3">
      <div className="font-bold font-fredokaOne text-sm">
        {t('title.canvasBackground')}
      </div>
      <div className="mt-1 flex items-center w-full">
        <div className="w-7 h-7">
          <input
            type="color"
            value={rgbaToHex(backgroundColor || '')}
            onChange={(e) => {
              updateBackgroundColor(e.target.value)
              saveHistory()
            }}
            className="colorInput"
          />
        </div>
        <div className="divider divider-horizontal mx-3"></div>
        <OpacityIcon className="mr-2" />
        <input
          className="range range-primary range-xs"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={String(backgroundOpacity)}
          onChange={(e) => {
            updateBackgroundOpacity(Number(e.target.value))
            saveHistory()
          }}
        />
      </div>
      <div className="mt-3 flex items-center w-full">
        <label
          htmlFor="image-upload"
          className="shrink-0 cursor-pointer rounded relative hover:bg-slate-200"
        >
          {hasBackgroundImage ? (
            <>
              <ClearIcon
                onClick={clickCleanBackgroundImage}
                className="absolute top-[-6px] right-[-6px] rounded-full w-3 h-3 cursor-pointer"
              />
              <UploadSuccessIcon className="w-7 h-7 object-contain" />
            </>
          ) : (
            <UploadIcon />
          )}
        </label>
        <input
          type="file"
          id="image-upload"
          className="hidden"
          onChange={uploadImage}
        />
        <div className="divider divider-horizontal mx-3"></div>
        <OpacityIcon className="mr-2" />
        <input
          className="range range-primary range-xs"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={String(backgroundImageOpacity)}
          onChange={(e) => {
            updateBackgroundImageOpacity(Number(e.target.value))
            saveHistory()
          }}
        />
      </div>
    </div>
  )
}

export default BackgroundConfig
