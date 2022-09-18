import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { PaintBoard } from '@/utils/paintBoard'
import LayerItem from './layerItem'

interface IProps {
  board: PaintBoard | undefined
  refresh: () => void
}

const Layer: React.FC<IProps> = ({ board, refresh }) => {
  const addLayer = () => {
    if (board) {
      board.layers.add()
      refresh()
    }
  }

  const deleteLayer = (id: number | undefined) => {
    if (board && id) {
      board.history.delete('layer', id)
      board.layers.delete(id)
      refresh()
    }
  }

  return (
    <div className="mt-3">
      <div className="font-bold flex justify-between items-center">
        <span>Layer</span>
        <div>
          <span onClick={addLayer} className="text-2xl cursor-pointer">
            +
          </span>
          <span
            onClick={() => {
              deleteLayer(board?.layers.active)
            }}
            className="ml-3 mr-3 text-2xl cursor-pointer"
          >
            -
          </span>
        </div>
      </div>
      <div className="mt-1 bg-white rounded-lg overflow-y-auto max-h-32">
        <DndProvider backend={HTML5Backend}>
          {Array.isArray(board?.layers?.queue) &&
            board?.layers?.queue?.map((item, i) => (
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
