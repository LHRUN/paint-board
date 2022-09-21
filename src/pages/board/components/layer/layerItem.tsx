import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { ILayer } from '@/utils/layer'
import { PaintBoard } from '@/utils/paintBoard'

import HiddenIcon from '@/components/icons/hidden'
import ShowIcon from '@/components/icons/show'

interface IProps {
  board: PaintBoard | undefined // 画板
  data: ILayer // 图层数据
  index: number // 图层下标
  refresh: () => void // 刷新事件
}

/**
 * 图层item
 */
const LayerItem: React.FC<IProps> = ({ board, data, refresh, index }) => {
  // 初始化dnd ref
  const dndRef = useRef<HTMLDivElement>(null)
  const [, drop] = useDrop<{ index: number }>({
    accept: 'layer',
    drop(hoverItem) {
      if (hoverItem.index === index) {
        return
      }
      if (board && dndRef.current) {
        board.layer.swap(index, hoverItem.index)
        board.sortOnLayer()
        board.render()
        refresh()
      }
    }
  })
  const [{ isDragging }, drag] = useDrag({
    type: 'layer',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })
  drop(drag(dndRef))

  /**
   * 更新当前图层
   * @param id 图层id
   */
  const updateCurrentLayer = (id: number) => {
    if (board) {
      board.layer.updateCurrent(id)
      refresh()
    }
  }

  /**
   * 修改图层标题
   * @param id 图层id
   * @param title 图层标题
   */
  const setLayerTitle = (id: number, title: string) => {
    if (board) {
      board.layer.updateTitle(id, title)
      refresh()
    }
  }

  /**
   * 修改图层展示状态
   * @param id 图层id
   * @param show 展示状态
   */
  const setLayerShow = (id: number, show: boolean) => {
    if (board) {
      board.layer.updateShow(id, show)
      refresh()
    }
  }

  return (
    <div ref={dndRef}>
      <div
        className={`flex justify-evenly py-1.5 cursor-pointer ${
          board?.layer.current === data.id ? 'bg-primary' : ''
        } ${isDragging ? 'opacity-50' : ''}`}
        onClick={() => updateCurrentLayer(data.id)}
      >
        <input
          value={data.title}
          className="px-2 w-40"
          onInput={(e) =>
            setLayerTitle(data.id, (e.target as HTMLInputElement).value)
          }
        />
        <div
          onClick={(e) => {
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
