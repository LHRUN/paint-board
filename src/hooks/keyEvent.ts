import { KeyCode } from '@/utils/constants'
import { useEffect, useState } from 'react'

/**
 * 判断是否按下空格hook
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
    e.stopPropagation()
    e.preventDefault()
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
