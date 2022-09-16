import React, { useMemo, useState, MouseEvent } from 'react'
import { PaintBoard } from '@/utils/paintBoard'
import { CANVAS_ELE_TYPE } from '@/utils/constants'
import OptionsCard from './components/optionsMenu'
import { useSpaceEvent } from '@/hooks/keyEvent'

const Board: React.FC = () => {
  // canvas元素
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  // 画板
  const board = useMemo(() => {
    if (canvasRef) {
      return new PaintBoard(canvasRef)
    }
  }, [canvasRef])
  // 鼠标是否按下
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
  // 当前工具选择
  const [optionsType, setOptionsType] = useState<string>(
    CANVAS_ELE_TYPE.FREE_LINE
  )

  // 是否按下空格
  const isPressSpace = useSpaceEvent(() => {
    if (board) {
      board.initOriginPosition()
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
    if (board && isMouseDown) {
      const { clientX: x, clientY: y } = event
      if (isPressSpace) {
        board.drag({
          x,
          y
        })
      } else {
        board.currentAddPosition({
          x,
          y
        })
      }
    }
  }

  // 鼠标
  const mouseUp = () => {
    if (board) {
      setIsMouseDown(false)
      board.initOriginPosition()
    }
  }

  return (
    <div
      className={`flex justify-center items-center flex-col w-screen h-screen ${
        isPressSpace ? 'cursor-move' : ''
      }`}
    >
      <OptionsCard
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
