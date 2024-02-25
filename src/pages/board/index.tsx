import React, { useEffect, useRef, useState } from 'react'
import { paintBoard } from '@/utils/paintBoard'
import useBoardStore from '@/store/board'
import useDrawStore from '@/store/draw'
import { ActionMode } from '@/constants'
import { DrawStyle, DrawType } from '@/constants/draw'

import ToolPanel from '@/components/toolPanel'
import GuideInfo from '@/components/guideInfo'
import CleanModal from '@/components/cleanModal'
import BoardOperation from '@/components/boardOperation'
import DeleteFileModal from '@/components/boardOperation/deleteFileModal'
import AutoDrawPanel from '@/components/autodrawPanel'

const Board: React.FC = () => {
  const { mode, drawType } = useBoardStore()
  const { drawStyle, openAutoDraw } = useDrawStore()
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
          {mode === ActionMode.DRAW &&
            drawType === DrawType.FreeStyle &&
            drawStyle === DrawStyle.Basic &&
            openAutoDraw && <AutoDrawPanel />}
        </>
      )}
    </div>
  )
}

export default Board
