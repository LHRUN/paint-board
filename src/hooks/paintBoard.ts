import { ELEMENT_INSTANCE, MousePosition } from '@/types'
import { CANVAS_ELE_TYPE, CommonWidth } from '@/utils/constants'
import { useEffect, useMemo, useState, Dispatch, SetStateAction } from 'react'
import { History } from '@/utils/history'
import { FreeLine } from '@/utils/freeLine'
import { CleanLine } from '@/utils/cleanLine'

export interface IBoardOptions {
  setOriginPosition: Dispatch<SetStateAction<MousePosition>>
  currentLineColor: string
  setCurrentLineColor: Dispatch<SetStateAction<string>>
  currentLineWidth: number
  setCurrentLineWidth: Dispatch<SetStateAction<number>>
  cleanWidth: number
  setCleanWidth: Dispatch<SetStateAction<number>>
  recordCurrent: (type: string) => void
  currentAddPosition: (position: MousePosition) => void
  translate: (position: MousePosition) => void
  undo: () => void
  redo: () => void
  saveImage: () => void
  containerPosition: {
    top: number
    left: number
  }
}

export function usePaintBoard(
  canvas: HTMLCanvasElement,
  initHistory?: ELEMENT_INSTANCE[]
): IBoardOptions {
  useEffect(() => {
    canvas.width = screen.availWidth
    canvas.height = screen.availHeight
  }, [canvas])
  const context = useMemo(
    () => canvas.getContext('2d') as CanvasRenderingContext2D,
    [canvas]
  )
  const history = useMemo(() => new History(initHistory || []), [initHistory])
  const [originPosition, setOriginPosition] = useState({
    x: 0,
    y: 0
  })
  const [originTranslate, setOriginTranslate] = useState({
    x: 0,
    y: 0
  })
  const containerPosition = useMemo(() => {
    const { top, left } = canvas.getBoundingClientRect()
    return {
      top,
      left
    }
  }, [canvas])

  const [currentEle, setCurrentEle] = useState<ELEMENT_INSTANCE>(null)
  const [currentLineColor, setCurrentLineColor] = useState<string>('#000000')
  const [currentLineWidth, setCurrentLineWidth] = useState<number>(
    CommonWidth.W5
  )
  const [cleanWidth, setCleanWidth] = useState<number>(CommonWidth.W5)
  const recordCurrent = (type: string) => {
    let ele: ELEMENT_INSTANCE = null
    switch (type) {
      case CANVAS_ELE_TYPE.FREE_LINE:
        ele = new FreeLine(currentLineColor, currentLineWidth)
        break
      case CANVAS_ELE_TYPE.CLEAN_LINE:
        ele = new CleanLine(cleanWidth)
        break
      default:
        break
    }
    history.add(ele)
    setCurrentEle(ele)
  }

  const currentAddPosition = (position: MousePosition) => {
    currentEle?.addPosition({
      x: position.x - containerPosition.left - originTranslate.x,
      y: position.y - containerPosition.top - originTranslate.y
    })
    context.translate(0, 0)
    render()
  }

  const translate = (position: MousePosition) => {
    if (originPosition.x && originPosition.y) {
      const translteX = position.x - originPosition.x
      const translteY = position.y - originPosition.y
      context.translate(translteX, translteY)
      setOriginTranslate({
        x: translteX + originTranslate.x,
        y: translteY + originTranslate.y
      })
      render()
    }
    setOriginPosition(position)
  }

  const render = () => {
    context.clearRect(0, 0, canvas.width, canvas.height)
    history.each((ele) => {
      ele?.render(context, canvas)
    })
    // storage.set(BOARD_STORAGE_KEY, this.history.stack)
  }

  const undo = () => {
    history.undo()
    render()
  }

  const redo = () => {
    history.redo()
    render()
  }

  const saveImage = () => {
    const imageData = canvas.toDataURL('image/png') //返回base64的URL
    const elink = document.createElement('a')
    elink.download = '图片'
    elink.style.display = 'none'
    elink.href = imageData
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href) //释放URL对象
    document.body.removeChild(elink)
  }

  return {
    setOriginPosition,
    currentLineColor,
    setCurrentLineColor,
    currentLineWidth,
    setCurrentLineWidth,
    cleanWidth,
    setCleanWidth,
    recordCurrent,
    currentAddPosition,
    translate,
    undo,
    redo,
    saveImage,
    containerPosition
  }
}
