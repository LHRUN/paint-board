import { useEffect, useState } from 'react'
import { KeyCode } from '@/utils/constants'

/**
 * 判断是否按下空格
 * @param keyDownCb 空格键按下回调
 * @param keyUpCb 空格键松开回调
 * @returns 空格键按下状态
 */
export function useSpaceEvent(keyDownCb?: () => void, keyUpCb?: () => void) {
  const [isPressSpace, setIsPressSpace] = useState<boolean>(false)

  useEffect(() => {
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('keyup', onKeyup)
    return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('keyup', onKeyup)
    }
  }, [])

  const onKeydown = (e: KeyboardEvent) => {
    if (e.code === KeyCode.SPACE) {
      setIsPressSpace(true)
      keyDownCb?.()
    }
  }

  const onKeyup = (e: KeyboardEvent) => {
    if (e.code === KeyCode.SPACE) {
      setIsPressSpace(false)
      keyUpCb?.()
    }
  }

  return isPressSpace
}

/**
 * window resize hook
 * @param cb resize callback
 */
export function useResizeEvent(cb: () => void) {
  useEffect(() => {
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
    }
  })

  const onResize = () => {
    cb()
  }
}
