import React, { useMemo, useState, MouseEvent, ChangeEvent } from 'react'
import { MousePosition } from '@/types/mouse'
import { PaintBoard } from '@/utils/paintBoard'
import { ToolType } from './constants'

const Board: React.FC = () => {
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  const board = useMemo(() => {
    console.log('canvasRef', screen)
    if (canvasRef) {
      canvasRef.width = Math.floor(screen.width * 0.8)
      canvasRef.height = Math.floor(screen.height * 0.5)
      return new PaintBoard(canvasRef)
    }
  }, [canvasRef])
  const [lastMousePos, setLastMousePos] = useState<MousePosition>({
    x: 0,
    y: 0
  })
  const [isMouse, setIsMouse] = useState<boolean>(false)
  const [toolType, setToolType] = useState<string>(ToolType.Line)

  const mouseDown = (event: MouseEvent) => {
    if (board) {
      const { clientX, clientY } = event
      const { top, left } = board.position
      setIsMouse(true)
      setLastMousePos({
        x: clientX - left,
        y: clientY - top
      })
    }
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

  const changeLineColor = (e: ChangeEvent<{ value: string }>) => {
    if (board) {
      board.setLineColor(e.target.value)
    }
  }

  const saveImage = () => {
    if (board) {
      board.saveImage()
    }
  }

  return (
    <div className="flex justify-center items-center flex-col w-screen h-screen">
      <div className="mb-10">
        <button className="mr-5" onClick={() => setToolType(ToolType.Line)}>
          Link
        </button>
        <button className="mr-5" onClick={() => setToolType(ToolType.Clean)}>
          Clean
        </button>
        <button
          onClick={() => {
            undo()
          }}
          className="mr-5"
        >
          后退
        </button>
        <button
          onClick={() => {
            redo()
          }}
          className="mr-5"
        >
          前进
        </button>
        <input type="color" onChange={changeLineColor} />
        <button onClick={saveImage}>保存为图片</button>
      </div>
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
