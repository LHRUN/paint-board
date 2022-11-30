import React, { useMemo, useState, MouseEvent } from 'react'
import { PaintBoard } from '@/utils/paintBoard'
import { CANVAS_ELE_TYPE } from '@/utils/constants'
import OptionsCard from './components/optionsMenu'
import { useBackspace, useResizeEvent, useSpaceEvent } from '@/hooks/event'
import Info from './components/info'
import { CURSOR_TYPE } from '@/utils/cursor'
import { showTextInput } from '@/utils/element/text'

let inputElement: HTMLInputElement | null = null

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

  const handleOptionsType = (type: string) => {
    if (board) {
      if (type !== CANVAS_ELE_TYPE.SELECT) {
        board.cancelSelectElement()
      }
      setOptionsType(type)
      board.render()
    }
  }

  // 是否按下空格
  const isPressSpace = useSpaceEvent(
    () => {
      if (board) {
        board.cursor.change(CURSOR_TYPE.POINTER)
        board.initOriginPosition()
      }
    },
    () => {
      if (board) {
        board.cursor.reset()
      }
    }
  )

  useResizeEvent(() => {
    if (board) {
      board.initCanvasSize()
      board.context.translate(board.originTranslate.x, board.originTranslate.y)
      board.render()
    }
  })

  useBackspace(() => {
    console.log('useBackspace', board)
    if (board) {
      console.log('useBackspace board')

      board.deleteSelectElement()
    }
  })

  // 监听鼠标事件
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
  const mouseDown = (event: MouseEvent) => {
    if (board) {
      const { clientX: x, clientY: y } = event
      const position = {
        x,
        y
      }
      if (inputElement !== null) {
        const value = inputElement.value
        const rect = inputElement.getBoundingClientRect()
        board.addTextElement(value, rect)
        document.body.removeChild(inputElement)
        inputElement = null
      }
      switch (optionsType) {
        case CANVAS_ELE_TYPE.SELECT:
          board.clickSelectElement(position)
          break
        case CANVAS_ELE_TYPE.FREE_LINE:
        case CANVAS_ELE_TYPE.CLEAN_LINE:
          if (!isPressSpace) {
            board.recordCurrent(optionsType)
          }
          break
        default:
          break
      }
      setIsMouseDown(true)
    }
  }

  const dbClick = (event: MouseEvent) => {
    if (board) {
      const { clientX: x, clientY: y } = event
      const position = {
        x,
        y
      }
      inputElement = showTextInput(position)
    }
  }

  const mouseMove = (event: MouseEvent) => {
    if (board) {
      const { clientX: x, clientY: y } = event
      if (isPressSpace && isMouseDown) {
        board.dragCanvas({
          x,
          y
        })
      } else {
        switch (optionsType) {
          case CANVAS_ELE_TYPE.SELECT:
            board.moveSelectElement({
              x,
              y
            })
            break
          case CANVAS_ELE_TYPE.FREE_LINE:
          case CANVAS_ELE_TYPE.CLEAN_LINE:
            if (isMouseDown) {
              board.currentAddPosition({
                x,
                y
              })
            }
            break
          default:
            break
        }
      }
    }
  }
  const mouseUp = () => {
    if (board) {
      setIsMouseDown(false)
      board.canvasMouseUp()
    }
  }

  return (
    <div className="flex justify-center items-center flex-col w-screen h-screen">
      <OptionsCard
        board={board}
        optionsType={optionsType}
        setOptionsType={handleOptionsType}
      />
      <canvas
        ref={setCanvasRef}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        onDoubleClick={dbClick}
      ></canvas>
      <Info />
    </div>
  )
}

export default Board
