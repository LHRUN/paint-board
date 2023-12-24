import { useState, FC } from 'react'
import { useTranslation } from 'react-i18next'

import DrawConfig from './drawConfig'
import BoardConfig from './boardConfig'
import SelectConfig from './selectConfig'
import CloseIcon from '@/components/icons/close.svg?react'
import MenuIcon from '@/components/icons/menu.svg?react'

import { ActionMode } from '@/constants'
import { typeSwitch } from './constant'
import useBoardStore from '@/store/board'
import EraserConfig from './eraserConfig'

/**
 * 操作面板
 */
const ToolPanel: FC = () => {
  const { t } = useTranslation()
  const { mode, updateMode } = useBoardStore()
  const [showPanel, setShowPanel] = useState(true) // 面板展示控制

  return (
    <div
      className={`fixed top-8 left-8 flex flex-col card shadow-xl overflow-visible z-3 bg-[#eef1ff] max-h-[80%] max-w-[85%] ${
        showPanel ? 'p-5' : ''
      }`}
    >
      {/* 控制面板显示 */}
      <label className="btn btn-circle swap swap-rotate absolute -top-4 -left-4 h-8 w-8 min-h-0">
        <input type="checkbox" onChange={() => setShowPanel((v) => !v)} />
        <CloseIcon className="swap-on fill-current" />
        <MenuIcon className="swap-off fill-current" />
      </label>
      {showPanel && (
        <div className="max-h-[100%] overflow-y-auto noScrollbar">
          {/* 类型切换 */}
          <div className="btn-group flex">
            {typeSwitch.map(({ type, text }) => (
              <button
                key={type}
                className={`btn btn-sm flex-grow font-fredokaOne ${
                  mode === type ? 'btn-active' : ''
                }`}
                onClick={() => {
                  updateMode(type)
                }}
              >
                {t(text)}
              </button>
            ))}
          </div>
          {mode === ActionMode.DRAW && <DrawConfig />}
          {mode === ActionMode.ERASE && <EraserConfig />}
          {mode === ActionMode.SELECT && <SelectConfig />}
          {mode === ActionMode.Board && <BoardConfig />}
        </div>
      )}
    </div>
  )
}

export default ToolPanel
