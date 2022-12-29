import React, { useMemo, useState, MouseEvent } from 'react'
import { PaintBoard } from '@/utils/paintBoard'
import { CANVAS_ELE_TYPE } from '@/utils/constants'
import ToolPanel from '../../components/toolPanel'
import {
  useBackspace,
  useCancelContextMenu,
  useResizeEvent,
  useSpaceEvent
} from '@/hooks/event'
import Info from '../../components/info'
import ContextMenu from '@/components/contextMenu'
import { CURSOR_TYPE } from '@/utils/cursor'

const Board: React.FC = () => {
  // 初始化画板
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  const board = useMemo(() => {
    if (canvasRef) {
      return new PaintBoard(canvasRef)
    }
  }, [canvasRef])

  // 工具类型
  const [toolType, setToolType] = useState<string>(CANVAS_ELE_TYPE.FREE_DRAW)

  const handleToolType = (type: string) => {
    if (board) {
      if (type !== CANVAS_ELE_TYPE.SELECT) {
        board.select.cancelSelectElement()
      }
      setToolType(type)
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
    if (board) {
      board.select.deleteSelectElement()
    }
  })

  const [showContextMenu, setShowContextMenu] = useState(false)
  const [contextMenuPos, setContextMenuPos] = useState({
    x: 0,
    y: 0
  })
  useCancelContextMenu()

  // 监听鼠标事件
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false)
  const mouseDown = (event: MouseEvent) => {
    if (board) {
      const { clientX: x, clientY: y } = event
      const position = {
        x,
        y
      }

      if (event.button === 2) {
        setShowContextMenu(true)
        setContextMenuPos(position)
        return
      }

      setShowContextMenu(false)

      // 如果有文本编辑框，取消编辑
      board.addTextElement(board.textEdit.value, board.textEdit.rect)
      board.textEdit.destroy()

      switch (toolType) {
        case CANVAS_ELE_TYPE.SELECT:
          board.select.clickSelectElement(position)
          break
        case CANVAS_ELE_TYPE.FREE_DRAW:
        case CANVAS_ELE_TYPE.ERASER:
          if (!isPressSpace) {
            board.recordCurrent(toolType)
          }
          break
        default:
          break
      }
      setIsMouseDown(true)
    }
  }
  const showTextEdit = () => {
    if (board) {
      setShowContextMenu(false)
      board.textEdit.showTextInput(contextMenuPos)
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
        switch (toolType) {
          case CANVAS_ELE_TYPE.SELECT:
            board.select.moveSelectElement({
              x,
              y
            })
            break
          case CANVAS_ELE_TYPE.FREE_DRAW:
          case CANVAS_ELE_TYPE.ERASER:
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
      <ToolPanel
        board={board}
        toolType={toolType}
        setToolType={handleToolType}
      />
      <canvas
        ref={setCanvasRef}
        onMouseDown={mouseDown}
        onMouseMove={mouseMove}
        onMouseUp={mouseUp}
      ></canvas>
      <Info />
      {showContextMenu && (
        <ContextMenu
          board={board}
          position={contextMenuPos}
          clickText={showTextEdit}
        />
      )}
    </div>
  )
}

export default Board
