import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_BACKGROUND_SORT, useCurrentFile } from '@/store/files'
import {
  hasFileHydrationFailed,
  hasFilePersistFailed,
  subscribeFilePersistFailed
} from '@/store/fileHydration'
import { paintBoard } from '@/core/paintBoard'
import Toast from '@/components/toast'

import ToolPanel from '@/components/toolPanel'
import HelpArea from '@/components/helpArea'
import CleanModal from '@/components/cleanModal'
import BoardOperation from '@/components/boardOperation'
import BackgroundColor from '@/components/background/backgroundColor'
import BackgroundImage from '@/components/background/backgroundImage'
import BackgroundCamera from '@/components/background/backgroundCamera'

const Board: React.FC = () => {
  const canvasEl = useRef<HTMLCanvasElement>(null)
  const [canvasLoaded, setCanvasLoaded] = useState(false)
  const [hydrationFailed, setHydrationFailed] = useState(false)
  const [persistFailed, setPersistFailed] = useState(false)
  const currentFile = useCurrentFile()
  const backgroundSort = useMemo(() => {
    return [
      ...(currentFile?.backgroundSort || DEFAULT_BACKGROUND_SORT)
    ].reverse()
  }, [currentFile])

  useEffect(() => subscribeFilePersistFailed(() => setPersistFailed(true)), [])

  useEffect(() => {
    let cancelled = false
    if (canvasEl.current) {
      paintBoard
        .initCanvas(canvasEl.current as HTMLCanvasElement)
        .then((loaded) => {
          if (cancelled) {
            return
          }
          setHydrationFailed(hasFileHydrationFailed())
          setPersistFailed(hasFilePersistFailed())
          if (loaded) {
            setCanvasLoaded(true)
          }
        })
    }
    return () => {
      cancelled = true
      paintBoard.removeCanvas()
    }
  }, [])

  return (
    <div>
      <div className="w-screen h-screen flex justify-center items-center bg-slate-100 relative z-[0]">
        <canvas
          className="w-full h-full block relative z-[2]"
          ref={canvasEl}
        ></canvas>
        {backgroundSort.map((type) => {
          switch (type) {
            case 'image':
              return <BackgroundImage key={type} />
            case 'color':
              return <BackgroundColor key={type} />
            case 'camera':
              return <BackgroundCamera key={type} />
          }
        })}
      </div>
      {hydrationFailed && (
        <Toast message="tip.fileHydrationFail" type="error" />
      )}
      {persistFailed && <Toast message="tip.filePersistFail" type="error" />}
      {canvasLoaded && (
        <>
          <ToolPanel />
          <HelpArea />
          <CleanModal />
          <BoardOperation />
        </>
      )}
    </div>
  )
}

export default Board
