import { useState, FC } from 'react'
import { useTranslation } from 'react-i18next'
import useBoardStore from '@/store/board'
import { ActionMode } from '@/constants'
import { modeSwitch } from './constant'

import DrawConfig from './drawConfig'
import EraserConfig from './eraserConfig'
import SelectConfig from './selectConfig'
import BoardConfig from './boardConfig'
import CloseIcon from '@/components/icons/close.svg?react'
import MenuIcon from '@/components/icons/menu.svg?react'

const ToolPanel: FC = () => {
  const { t } = useTranslation()
  const { mode, updateMode } = useBoardStore()
  const [showPanel, setShowPanel] = useState(true) // toggle main panel display

  return (
    <div
      className={`fixed top-8 left-8 flex flex-col card shadow-xl overflow-visible z-3 bg-[#eef1ff] max-h-[80%] max-w-[85%] ${
        showPanel ? 'p-5' : ''
      }`}
    >
      {/* toggle main panel display button */}
      <label className="btn btn-circle swap swap-rotate absolute -top-4 -left-4 h-8 w-8 min-h-0">
        <input type="checkbox" onChange={() => setShowPanel((v) => !v)} />
        <CloseIcon className="swap-on fill-current" />
        <MenuIcon className="swap-off fill-current" />
      </label>
      {showPanel && (
        <div className="max-h-[100%] overflow-y-auto noScrollbar">
          {/* switch mode tabs */}
          <div className="tabs tabs-boxed bg-[#333C4D]">
            {modeSwitch.map(({ type, text }) => (
              <a
                key={type}
                className={`tab tab-sm flex-grow font-fredokaOne text-white font-medium ${
                  mode === type ? 'tab-active' : ''
                }`}
                onClick={() => {
                  updateMode(type)
                }}
              >
                {t(text)}
              </a>
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
