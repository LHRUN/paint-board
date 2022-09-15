import React, { useMemo, useState, MouseEvent } from 'react'
import { PaintBoard } from '@/utils/paintBoard'
import { CANVAS_ELE_TYPE } from '@/utils/constants'
import OptionsMenu from './components/optionsMenu'
import { BOARD_STORAGE_KEY, storage } from '@/utils/storage'
import { useSpaceEvent } from '@/hooks/keyEvent'

const Board: React.FC = () => {
  // canvas元素
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  // 画板实例
  const board = useMemo(() => {
    if (canvasRef) {
      const history = storage.get(BOARD_STORAGE_KEY)
      return new PaintBoard(canvasRef, history)
    }
  }, [canvasRef])
  // 鼠标是否按下
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
  // 当前工具类型
  const [optionsType, setOptionsType] = useState<string>(
    CANVAS_ELE_TYPE.FREE_LINE
  )

  // 是否按下空格
  const isPressSpace = useSpaceEvent(board, () => {
    if (board) {
      board.originPosition = {
        x: 0,
        y: 0
      }
    }
  })

  // 鼠标按下
  const mouseDown = () => {
    if (board) {
      setIsMouseDown(true)
      if (!isPressSpace) {
        board.recordCurrent(optionsType)
      }
    }
  }

  // 鼠标移动
  const mouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event
    if (board && isMouseDown) {
      const { top, left } = board.position
      if (isPressSpace) {
        board.translate({
          x: clientX - left,
          y: clientY - top
        })
      } else {
        board.currentAddPosition({
          x: clientX,
          y: clientY
        })
      }
    }
  }

  // 鼠标
  const mouseUp = () => {
    if (board) {
      setIsMouseDown(false)
      board.originPosition = {
        x: 0,
        y: 0
      }
    }
  }

  return (
    <div
      className={`flex justify-center items-center flex-col w-screen h-screen ${
        isPressSpace ? 'cursor-pointer' : ''
      }`}
    >
      <OptionsMenu
        board={board}
        optionsType={optionsType}
        setOptionsType={setOptionsType}
      />
      <canvas
        ref={setCanvasRef}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
      ></canvas>
    </div>
  )
}

export default Board
