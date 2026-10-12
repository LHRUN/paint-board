import { FC, useEffect, useRef, useState } from 'react'
import Sortable from 'sortablejs'
import { useTranslation } from 'react-i18next'
import { paintBoard } from '@/core/paintBoard'
import {
  objectListRows,
  ObjectListRow,
  ObjectListSource
} from '@/core/element/layer/objectList'
import {
  moveObjectInList,
  objectFromList,
  selectObjectFromList,
  toggleObjectVisible
} from '@/core/element/layer/objectListActions'
import ObjectItem from './objectItem'

interface IProps {
  updateShow: (show: boolean) => void
}

const readRows = (): ObjectListRow[] => {
  const canvas = paintBoard.canvas
  if (!canvas) {
    return []
  }
  return objectListRows(
    canvas.getObjects() as ObjectListSource[],
    canvas.getActiveObjects() as ObjectListSource[]
  )
}

const ObjectList: FC<IProps> = ({ updateShow }) => {
  const { t } = useTranslation()
  const sortableRef = useRef<HTMLUListElement>(null)
  const [rows, setRows] = useState<ObjectListRow[]>(readRows)

  useEffect(() => {
    const refresh = () => {
      setRows(readRows())
    }
    refresh()
    paintBoard.addHookFn(refresh)
    const canvas = paintBoard.canvas
    canvas?.on('object:added', refresh)
    canvas?.on('object:removed', refresh)
    canvas?.on('object:modified', refresh)
    return () => {
      paintBoard.removeHookFn(refresh)
      canvas?.off('object:added', refresh)
      canvas?.off('object:removed', refresh)
      canvas?.off('object:modified', refresh)
    }
  }, [])

  useEffect(() => {
    if (!sortableRef.current) {
      return
    }
    const sortable = new Sortable(sortableRef.current, {
      animation: 150,
      ghostClass: 'opacity-50',
      chosenClass: 'scale-105',
      dragClass: 'rotate-2',
      handle: '.drag-object-list-handle',
      onEnd: (evt) => {
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
          moveObjectInList(evt.oldIndex, evt.newIndex)
        }
      }
    })
    return () => {
      sortable.destroy()
    }
  }, [])

  return (
    <div className="drawer drawer-end fixed top-0 z-[5]">
      <input
        id="object-list-drawer"
        type="checkbox"
        className="drawer-toggle"
        defaultChecked
      />
      <div className="drawer-side">
        <label
          className="drawer-overlay"
          onClick={() => updateShow(false)}
        ></label>
        <div className="h-screen bg-white px-5 py-7 overflow-hidden max-w-[80%] w-96">
          <div className="font-fredokaOne text-2xl text-center">
            {t('objectList.title')}
          </div>
          <div className="bg-[#eef1ff] rounded-2xl mt-5 py-2 w-full max-w-full">
            <ul
              ref={sortableRef}
              className="text-base-content my-2 mx-4 py-3 px-2 rounded-xl bg-white max-h-[70vh] xs:max-h-[40vh] overflow-y-auto noScrollbar flex-nowrap max-w-full"
            >
              {rows.length === 0 ? (
                <li className="px-2 py-6 text-center text-sm text-slate-400">
                  {t('objectList.empty')}
                </li>
              ) : (
                rows.map((row, index) => (
                  <ObjectItem
                    key={row.key}
                    row={row}
                    onSelect={() => {
                      const object = objectFromList(index)
                      if (object) {
                        selectObjectFromList(object)
                      }
                    }}
                    onToggleVisible={() => {
                      const object = objectFromList(index)
                      if (object) {
                        toggleObjectVisible(object)
                      }
                    }}
                  />
                ))
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ObjectList
