import React, { useEffect, useRef, useState } from 'react'
import { paintBoard } from '@/utils/paintBoard'

import ToolPanel from '@/components/toolPanel'
import GuideInfo from '@/components/guideInfo'
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
    <div>
      <div className="w-screen h-screen flex justify-center items-center bg-slate-100">
        <canvas className="w-full h-full block" ref={canvasEl}></canvas>
      </div>
      {canvasLoaded && (
        <>
          <ToolPanel />
          <GuideInfo />
          <CleanModal />
          <DeleteFileModal />
          <BoardOperation />
        </>
      )}
    </div>
  )
}

export default Board
