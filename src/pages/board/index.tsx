import React, { useEffect, useRef, useState } from 'react'
import { paintBoard } from '@/utils/paintBoard'

import ToolPanel from '@/components/toolPanel'
import Info from '@/components/info'
import CleanModal from '@/components/cleanModal'
import BoardOperation from '@/components/boardOperation'
import DeleteFileModal from '@/components/boardOperation/deleteFileModal'

const Board: React.FC = () => {
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const [canvasLoaded, setCanvasLoaded] = useState(false)
  useEffect(() => {
    if (canvasEl.current) {
      paintBoard
        .initCanvas(canvasEl.current as HTMLCanvasElement)
        .then((loaded) => {
          setCanvasLoaded(loaded)
        })
    }
    return () => {
      paintBoard.removeCanvas()
    }
  }, [])

  return (
    <div className="flex">
      <canvas
        className="fixed top-0 left-0 w-full h-full block"
        ref={canvasEl}
      ></canvas>
      {canvasLoaded && (
        <>
          <ToolPanel />
          <Info />
          <CleanModal />
          <DeleteFileModal />
          <BoardOperation />
        </>
      )}
    </div>
  )
}

export default Board
