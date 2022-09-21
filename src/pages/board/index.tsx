import React, { useMemo, useState, MouseEvent } from 'react'
import classNames from 'classnames'
import { PaintBoard } from '@/utils/paintBoard'
import { CANVAS_ELE_TYPE } from '@/utils/constants'
import OptionsCard from './components/optionsMenu'
import { useResizeEvent, useSpaceEvent } from '@/hooks/event'
import Info from './components/info'

const Board: React.FC = () => {
  // 初始化画板
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  const board = useMemo(() => {
    if (canvasRef) {
      return new PaintBoard(canvasRef)
    }
  }, [canvasRef])

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

  useResizeEvent(() => {
    if (board) {
      board.initCanvasSize()
      board.context.translate(board.originTranslate.x, board.originTranslate.y)
      board.render()
    }
  })

  // 监听鼠标事件
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
  const mouseDown = () => {
    if (board) {
      setIsMouseDown(true)
      if (!isPressSpace) {
        board.recordCurrent(optionsType)
      }
    }
  }
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
  const mouseUp = () => {
    if (board) {
      setIsMouseDown(false)
      board.initOriginPosition()
    }
  }

  return (
    <div className="flex justify-center items-center flex-col w-screen h-screen">
      <OptionsCard
        board={board}
        optionsType={optionsType}
        setOptionsType={setOptionsType}
      />
      <canvas
        className={classNames({
          'cursor-move': isPressSpace
        })}
        ref={setCanvasRef}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
      ></canvas>
      <Info />
    </div>
  )
}

export default Board
