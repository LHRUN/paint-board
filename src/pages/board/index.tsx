import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DEFAULT_BACKGROUND_SORT, useCurrentFile } from '@/store/files'
import useBoardStore from '@/store/board'
import {
  hasFileHydrationFailed,
  hasFilePersistFailed,
  subscribeFilePersistFailed
} from '@/store/fileHydration'
import { paintBoard } from '@/core/paintBoard'
import { loadTemplates, type BoardTemplate } from '@/core/template/template'
import {
  hasPersistedBoardList,
  hasSeenTemplatePrompt,
  markTemplatePromptSeen,
  shouldOfferTemplatePrompt
} from '@/core/template/templatePrompt'
import Toast from '@/components/toast'
import TemplatePromptModal from '@/components/boardOperation/templatePromptModal'

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
  const [offerTemplates, setOfferTemplates] = useState<BoardTemplate[] | null>(
    null
  )
  const currentFile = useCurrentFile()
  const backgroundSort = useMemo(() => {
    return [
      ...(currentFile?.backgroundSort || DEFAULT_BACKGROUND_SORT)
    ].reverse()
  }, [currentFile])

  useEffect(() => subscribeFilePersistFailed(() => setPersistFailed(true)), [])

  useEffect(() => {
    if (!canvasLoaded) {
      return
    }
    let cancelled = false
    const offer = async () => {
      if (hasFileHydrationFailed() || hasSeenTemplatePrompt()) {
        return
      }
      const hasPersistedBoards = await hasPersistedBoardList()
      if (cancelled || hasPersistedBoards) {
        return
      }
      const templates = await loadTemplates(useBoardStore.getState().language)
      if (
        cancelled ||
        !shouldOfferTemplatePrompt({
          hydrationFailed: hasFileHydrationFailed(),
          seen: hasSeenTemplatePrompt(),
          hasPersistedBoards,
          templateCount: templates.length
        })
      ) {
        return
      }
      setOfferTemplates(templates)
    }
    void offer()
    return () => {
      cancelled = true
    }
  }, [canvasLoaded])

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
      {offerTemplates && offerTemplates.length > 0 && (
        <TemplatePromptModal
          templates={offerTemplates}
          onClose={() => {
            markTemplatePromptSeen()
            setOfferTemplates(null)
          }}
        />
      )}
    </div>
  )
}

export default Board
