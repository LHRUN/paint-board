import React, { useMemo, useState, MouseEvent, ChangeEvent } from 'react'
import { PaintBoard } from '@/utils/paintBoard'
import { CANVAS_ELE_TYPE } from '@/utils/constants'
import OptionsMenu from './components/optionsMenu'
import { BOARD_STORAGE_KEY, storage } from '@/utils/storage'

const Board: React.FC = () => {
  // canvas元素
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  // 画板实例
  const board = useMemo(() => {
    if (canvasRef) {
      canvasRef.width = screen.width
      canvasRef.height = screen.height
      const history = storage.get(BOARD_STORAGE_KEY)
      return new PaintBoard(canvasRef, history, 'white')
    }
  }, [canvasRef])
  // 鼠标是否按下
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
  // 当前工具类型
  const [optionsType, setOptionsType] = useState<string>(
    CANVAS_ELE_TYPE.FREE_LINE
  )

  // 鼠标按下
  const mouseDown = () => {
    if (board) {
      setIsMouseDown(true)
      board.recordCurrent(optionsType)
    }
  }

  // 鼠标移动
  const mouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event
    if (board && isMouseDown) {
      const { top, left } = board.position
      board.currentAddPosition({
        x: clientX - left,
        y: clientY - top
      })
    }
  }

  // 鼠标
  const mouseUp = () => {
    if (board) {
      setIsMouseDown(false)
    }
  }

  return (
    <div className="flex justify-center items-center flex-col w-screen h-screen">
      <OptionsMenu
        board={board}
        optionsType={optionsType}
        setOptionsType={setOptionsType}
      />
      <canvas
        className="border-dashed border-4 border-black"
        ref={setCanvasRef}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        width="300"
        height="300"
      ></canvas>
    </div>
  )
}

export default Board
