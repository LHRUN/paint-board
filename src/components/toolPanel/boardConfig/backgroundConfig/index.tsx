import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import useBoardStore from '@/store/board'

import { paintBoard } from '@/utils/paintBoard'
import { debounce } from 'lodash'
import { rgbaToHex } from '@/utils/common/color'

import OpacityIcon from '@/components/icons/opacity.svg?react'

const BackgroundConfig = () => {
  const {
    backgroundColor,
    backgroundOpacity,
    updateBackgroundColor,
    updateBackgroundOpacity,
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
    </div>
  )
}

export default BackgroundConfig
