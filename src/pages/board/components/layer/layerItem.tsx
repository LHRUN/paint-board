import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { ILayer } from '@/utils/layer'
import { PaintBoard } from '@/utils/paintBoard'

import HiddenIcon from '@/components/icons/hidden'
import ShowIcon from '@/components/icons/show'

interface IProps {
  board: PaintBoard | undefined
  data: ILayer
  index: number
  refresh: () => void
}

const LayerItem: React.FC<IProps> = ({ board, data, refresh, index }) => {
  const ref = useRef<HTMLDivElement>(null)

  const [, drop] = useDrop<{ index: number }>({
    accept: 'Card',
    drop(hoverItem) {
      if (board && ref) {
        board.layers.swap(index, hoverItem.index)
        board.sortOnLayer()
        board.render()
        refresh()
      }
    }
  })

  const [, drag] = useDrag({
    type: 'Card',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })
  drag(drop(ref))

  const updateActiveLayer = (id: number) => {
    if (board) {
      board.layers.updateActive(id)
      refresh()
    }
  }

  const setLayerVal = (id: number, value: string) => {
    if (board) {
      board.layers.updateVal(id, value)
      refresh()
    }
  }

  const setLayerShow = (id: number, show: boolean) => {
    if (board) {
      board.layers.updateShow(id, show)
      refresh()
    }
  }

  return (
    <div ref={ref}>
      <div
        className={`flex justify-evenly py-1.5 cursor-pointer ${
          board?.layers.active === data.id ? 'bg-primary' : ''
        }`}
        onClick={() => updateActiveLayer(data.id)}
      >
        <input
          value={data.value}
          type="text"
          className="px-2 w-40"
          onInput={(e) => {
            console.log(e)
            setLayerVal(data.id, (e.target as HTMLInputElement).value)
          }}
        />
        <div
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setLayerShow(data.id, !data.show)
          }}
          className="cursor-pointer"
        >
          {data.show ? <ShowIcon /> : <HiddenIcon />}
        </div>
      </div>
    </div>
  )
}

export default LayerItem
