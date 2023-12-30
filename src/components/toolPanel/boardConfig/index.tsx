import OpacityIcon from '@/components/icons/opacity.svg?react'
import styles from './index.module.css'
import { rgbaToHex } from '@/utils/common/color'
import useBoardStore from '@/store/board'
import { debounce } from 'lodash'
import { paintBoard } from '@/utils/paintBoard'
import { useCallback, useEffect } from 'react'

const boardConfig = () => {
  const {
    backgroundColor,
    backgroundOpacity,
    updateBackgroundColor,
    updateBackgroundOpacity,
    initBackground
  } = useBoardStore()

  const saveHistory = useCallback(
    debounce(() => {
      paintBoard.render()
    }, 500),
    []
  )

  useEffect(() => {
    if (paintBoard.canvas) {
      initBackground()
    }
  }, [])

  useEffect(() => {
    paintBoard.addHookFn(initBackground)
    return () => {
      paintBoard.removeHookFn(initBackground)
    }
  }, [initBackground])

  return (
    <>
      <div className="form-control mt-3">
        <div className="font-bold font-fredokaOne">Background</div>
        <div className="mt-1 flex items-center w-full">
          <div className="w-8 h-8">
            <input
              type="color"
              value={rgbaToHex(backgroundColor || '')}
              onChange={(e) => {
                updateBackgroundColor(e.target.value)
                saveHistory()
              }}
              className={styles.drawColor}
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
    </>
  )
}

export default boardConfig
