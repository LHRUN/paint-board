import React, { useMemo, useRef, useState, MouseEvent } from 'react'
import { MousePosition } from '@/types/mouse'
import { PaintBoard } from '@/utils/paintBoard'
import { ToolType } from './constants'

const Board: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const board = useMemo(() => {
    console.log(canvasRef.current)
    if (canvasRef.current) {
      return new PaintBoard(canvasRef.current)
    }
  }, [canvasRef.current])
  const [lastMousePos, setLastMousePos] = useState<MousePosition>({
    x: 0,
    y: 0
  })
  const [isMouse, setIsMouse] = useState<boolean>(false)
  const [toolType, setToolType] = useState<string>(ToolType.Line)

  const mouseDown = (event: MouseEvent) => {
    if (board) {
      console.log('bb')
      const { clientX, clientY } = event
      const { top, left } = board.position
      console.log(clientX, clientY)
      setIsMouse(true)
      setLastMousePos({
        x: clientX - left,
        y: clientY - top
      })
    }
    console.log('aa', board)
  }

  const mouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event
    // console.log(clientX, clientY, lastMousePos)
    if (lastMousePos?.x && lastMousePos?.y && board && isMouse) {
      const { top, left } = board.position
      console.log(toolType)
      switch (toolType) {
        case ToolType.Line:
          board.drawLine(
            { x: lastMousePos.x, y: lastMousePos.y },
            { x: clientX - left, y: clientY - top }
          )
          break
        case ToolType.Clean:
          board.cleanLine(
            { x: lastMousePos.x, y: lastMousePos.y },
            { x: clientX - left, y: clientY - top }
          )
          break
        default:
          break
      }
      setLastMousePos({
        x: clientX - left,
        y: clientY - top
      })
    }
  }

  const mouseUp = () => {
    if (board) {
      setLastMousePos({
        x: 0,
        y: 0
      })
      setIsMouse(false)
      board.record()
    }
  }

  const undo = () => {
    if (board) {
      board.undo()
    }
  }

  const redo = () => {
    if (board) {
      board.redo()
    }
  }

  return (
    <div className="flex justify-center items-center flex-col">
      <div>
        <button onClick={() => setToolType(ToolType.Line)}>Line</button>
        <button onClick={() => setToolType(ToolType.Clean)}>Clean</button>
        <button
          onClick={() => {
            undo()
          }}
        >
          后退
        </button>
        <button
          onClick={() => {
            redo()
          }}
        >
          前进
        </button>
      </div>
      <canvas
        className="border-dashed border-4 border-black"
        ref={canvasRef}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
        width="500"
        height="500"
      ></canvas>
    </div>
  )
}

export default Board
