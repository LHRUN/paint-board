import React, { useMemo, useState } from 'react'
import classNames from 'classnames'
import { CANVAS_ELE_TYPE, CommonWidth } from '@/utils/constants'
import UndoIcon from '@/components/icons/undo'
import RedoIcon from '@/components/icons/redo'
import SaveIcon from '@/components/icons/save'
import { PaintBoard } from '@/utils/paintBoard'

interface IProps {
  board: PaintBoard | undefined
  optionsType: string
  setOptionsType: (type: string) => void
}

const OptionsMenu: React.FC<IProps> = ({
  board,
  optionsType,
  setOptionsType
}) => {
  const [colorInput, setColorInput] = useState<string>('')
  const currentLineWidth = useMemo(
    () => board?.currentLineWidth,
    [board?.currentLineWidth]
  )
  const cleanWidth = useMemo(() => board?.cleanWidth, [board?.cleanWidth])
  const [scale, setScale] = useState(100)

  const changeLineColor = (color: string) => {
    if (board) {
      setColorInput(color)
      board.setLineColor(color)
    }
  }

  const changeScale = (v: number) => {
    if (board) {
      board?.changeScale(v / 100)
      setScale(v)
    }
  }

  // 点击后退
  const undo = () => {
    if (board) {
      board.undo()
    }
  }

  // 点击前进
  const redo = () => {
    if (board) {
      board.redo()
    }
  }

  // 保存图片
  const saveImage = () => {
    if (board) {
      board.saveImage()
    }
  }

  const setWidth = (w: number) => {
    if (board) {
      switch (optionsType) {
        case CANVAS_ELE_TYPE.FREE_LINE:
          board.setLineWidth(w)
          break
        case CANVAS_ELE_TYPE.CLEAN_LINE:
          board.setCleanWidth(w)
          break
        default:
          break
      }
    }
  }

  return (
    <div
      className="fixed top-10 left-10 flex flex-col card shadow-xl px-5 py-10"
      style={{ backgroundColor: '#EEF1FF' }}
    >
      <div className="btn-group">
        <button
          className={classNames({
            btn: true,
            'btn-active': optionsType === CANVAS_ELE_TYPE.FREE_LINE
          })}
          onClick={() => setOptionsType(CANVAS_ELE_TYPE.FREE_LINE)}
        >
          FreeLine
        </button>
        <button
          className={classNames({
            btn: true,
            'btn-active': optionsType === CANVAS_ELE_TYPE.CLEAN_LINE
          })}
          onClick={() => setOptionsType(CANVAS_ELE_TYPE.CLEAN_LINE)}
        >
          CleanLine
        </button>
      </div>
      <div className="mt-3">
        <div className="font-bold">Width</div>
        <div className="btn-group mt-1">
          {Object.values(CommonWidth).map((w) => {
            return !Number.isNaN(w) ? (
              <button
                key={w}
                className={classNames({
                  btn: true,
                  'btn-active':
                    optionsType === CANVAS_ELE_TYPE.FREE_LINE
                      ? currentLineWidth === w
                      : cleanWidth === w
                })}
                onClick={() => setWidth(w)}
              >
                <div
                  style={{
                    width: `30px`,
                    height: `${w / 2}px`,
                    borderRadius: '20%',
                    backgroundColor: 'black'
                  }}
                  key={w}
                ></div>
              </button>
            ) : null
          })}
        </div>
      </div>
      {optionsType === CANVAS_ELE_TYPE.FREE_LINE && (
        <div className="form-control mt-3">
          <div className="font-bold">Color</div>
          <label className="input-group mt-1">
            <span>
              <input
                type="color"
                value={board?.currentLineColor}
                onChange={(e) => changeLineColor(e.target.value)}
              />
            </span>
            <input
              value={colorInput}
              onInput={(e) => {
                console.log(e)
                setColorInput(e.currentTarget.value)
              }}
              className="input input-bordered input-md w-full max-w-xs"
            />
          </label>
        </div>
      )}
      <div className="mt-3">
        <div className="font-bold">Tool</div>
        <ul
          className="menu menu-horizontal bg-base-100 rounded-box justify-between mt-1"
          style={{ width: '200px' }}
        >
          <li>
            <a onClick={undo}>
              <UndoIcon />
            </a>
          </li>
          <li>
            <a onClick={redo}>
              <RedoIcon />
            </a>
          </li>
          <li>
            <a onClick={saveImage}>
              <SaveIcon />
            </a>
          </li>
        </ul>
      </div>
      <div className="mt-3">
        <div className="font-bold">Scale</div>
        <input
          type="range"
          min="0"
          max="300"
          value={scale}
          className="range mt-1"
          onInput={(v) => changeScale(v.target.value)}
        />
      </div>
    </div>
  )
}

export default OptionsMenu
