import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { PaintBoard } from '@/utils/paintBoard'
import LayerItem from './layerItem'

interface IProps {
  board: PaintBoard | undefined // 画板
  refresh: () => void // 刷新事件
}

/**
 * 图层组件
 */
const Layer: React.FC<IProps> = ({ board, refresh }) => {
  /**
   * 添加图层
   */
  const addLayer = () => {
    if (board) {
      board.layer.add()
      refresh()
    }
  }

  /**
   * 删除图层
   * @param id 图层id
   */
  const deleteLayer = (id: number | undefined) => {
    if (board && id) {
      board.history.delete('layer', id)
      board.layer.delete(id)
      refresh()
    }
  }

  return (
    <div className="mt-3">
      <div className="font-bold flex justify-between items-center">
        <span>Layer</span>
        <div>
          <span
            onClick={addLayer}
            className="text-2xl cursor-pointer tooltip"
            data-tip="添加图层"
          >
            +
          </span>
          <span
            onClick={() => {
              deleteLayer(board?.layer.current)
            }}
            className="ml-3 mr-3 text-2xl cursor-pointer tooltip"
            data-tip="删除图层"
          >
            -
          </span>
        </div>
      </div>
      <div className="mt-1 bg-white rounded-lg overflow-y-auto max-h-32">
        <DndProvider backend={HTML5Backend}>
          {Array.isArray(board?.layer?.stack) &&
            board?.layer?.stack?.map((item, i) => (
              <LayerItem
                index={i}
                key={item.id}
                board={board}
                data={item}
                refresh={refresh}
              />
            ))}
        </DndProvider>
      </div>
    </div>
  )
}

export default Layer
