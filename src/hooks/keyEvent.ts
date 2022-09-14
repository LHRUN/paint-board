import { KeyCode } from '@/utils/constants'
import { useEffect, useState } from 'react'

export function useSpaceEvent(
  el: any,
  keyDownCb?: () => void,
  keyUpCb?: () => void
) {
  const [isPressSpace, setIsPressSpace] = useState<boolean>(false)

  useEffect(() => {
    window.addEventListener('keydown', onKeydown)
    window.addEventListener('keyup', onKeyup)
    return () => {
      window.removeEventListener('keydown', onKeydown)
      window.removeEventListener('keyup', onKeyup)
    }
  }, [el])

  const onKeydown = (e: KeyboardEvent) => {
    e.stopPropagation()
    e.preventDefault()
    if (e.code === KeyCode.SPACE && el) {
      setIsPressSpace(true)
      keyDownCb?.()
    }
  }

  const onKeyup = (e: KeyboardEvent) => {
    if (e.code === KeyCode.SPACE && el) {
      setIsPressSpace(false)
      keyUpCb?.()
    }
  }

  return isPressSpace
}
