import React, { useMemo, useRef, useState, TouchEvent } from 'react'
import { MousePosition } from '@/types/mouse'
import { drawLine } from './common'
import { CleanWidth, LineWidth } from './constants'

const Board: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const context = useMemo(() => {
    if (canvasRef.current) {
      return canvasRef.current.getContext('2d')
    }
  }, [canvasRef.current])
  const [lastMousePos, setLastMousePos] = useState<MousePosition>({
    x: 0,
    y: 0
  })
  const [lineConfig, setLineConfig] = useState({
    width: LineWidth.W5,
    color: 'black'
  })
  const [cleanConfig, setCleanConfig] = useState({
    width: CleanWidth.W5,
    color: 'black'
  })

  const touchmove = (event: TouchEvent) => {
    console.log(event)
    if (event.touches.length === 1) {
      const { clientX, clientY } = event.touches[0]
      if (lastMousePos?.x && lastMousePos?.y && context) {
        drawLine(
          context,
          { x: lastMousePos.x, y: lastMousePos.y },
          { x: clientX, y: clientY },
          lineConfig.width,
          lineConfig.color
        )
      }
      setLastMousePos({
        x: clientX,
        y: clientY
      })
    }
  }

  const touchEnd = () => {
    setLastMousePos({
      x: 0,
      y: 0
    })
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        onTouchMove={touchmove}
        onTouchEnd={touchEnd}
        width="500"
        height="500"
      ></canvas>
    </>
  )
}

export default Board
