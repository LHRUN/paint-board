import React, { useMemo, useState } from 'react'
import classNames from 'classnames'
import { CANVAS_ELE_TYPE, CommonWidth } from '@/utils/constants'
import { PaintBoard } from '@/utils/paintBoard'
import UndoIcon from '@/components/icons/undo'
import RedoIcon from '@/components/icons/redo'
import SaveIcon from '@/components/icons/save'

import styles from './index.module.css'
import CleanIcon from '@/components/icons/clean'

interface IProps {
  board: PaintBoard | undefined
  optionsType: string
  setOptionsType: (type: string) => void
}

const OptionsCard: React.FC<IProps> = ({
  board,
  optionsType,
  setOptionsType
}) => {
  // 刷新操作栏
  const [, setRefresh] = useState(0)
  // scale range
  const [scaleValue, setScaleValue] = useState(100)
  // 颜色输入框(目前是只读数据)
  const colorInput = useMemo(() => {
    if (board?.currentLineColor) {
      return board.currentLineColor.split('#')[1] || ''
    }
    return ''
  }, [board?.currentLineColor])

  // 改变画笔颜色
  const changeLineColor = (color: string) => {
    if (board) {
      board.setLineColor(color)
      setRefresh((v) => v + 1)
    }
  }

  // 改变缩放比例
  const changeScale = (v: number) => {
    if (board) {
      setScaleValue(v)
      board?.changeScale(v / 100)
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

  // 清除画布
  const clean = () => {
    if (board) {
      board.clean()
    }
  }

  // 保存图片
  const saveImage = () => {
    if (board) {
      board.saveImage()
    }
  }

  // 改变宽度
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
      setRefresh((v) => v + 1)
    }
  }

  return (
    <div
      className="fixed top-5 left-5 flex flex-col card shadow-xl px-5 py-10"
      style={{ backgroundColor: '#EEF1FF' }}
    >
      <div className="btn-group">
        <button
          className={classNames({
            btn: true,
            'flex-grow': true,
            'btn-active': optionsType === CANVAS_ELE_TYPE.FREE_LINE
          })}
          onClick={() => setOptionsType(CANVAS_ELE_TYPE.FREE_LINE)}
        >
          自由画笔
        </button>
        <button
          className={classNames({
            btn: true,
            'flex-grow': true,
            'btn-active': optionsType === CANVAS_ELE_TYPE.CLEAN_LINE
          })}
          onClick={() => setOptionsType(CANVAS_ELE_TYPE.CLEAN_LINE)}
        >
          橡皮擦
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
                  'flex-grow': true,
                  'btn-active':
                    optionsType === CANVAS_ELE_TYPE.FREE_LINE
                      ? board?.currentLineWidth === w
                      : board?.cleanWidth === w
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
          <div className="mt-1 flex items-center justify-center w-full">
            <div className="w-8 h-8 mr-2 tooltip" data-tip="画笔颜色">
              <input
                type="color"
                value={board?.currentLineColor}
                onChange={(e) => changeLineColor(e.target.value)}
                className={styles.lineColor}
              />
            </div>

            <label className="input-group">
              <span className="font-bold bg-primary">#</span>
              <input
                value={colorInput}
                className="input input-bordered input-sm w-full max-w-xs focus:outline-none"
                readOnly
              />
            </label>
          </div>
        </div>
      )}
      <div className="mt-3">
        <div className="font-bold">Tool</div>
        <ul className="menu menu-horizontal bg-base-100 rounded-box justify-between mt-1">
          <li>
            <a onClick={undo}>
              <div className="tooltip" data-tip="后退">
                <UndoIcon />
              </div>
            </a>
          </li>
          <li>
            <a onClick={redo}>
              <div className="tooltip" data-tip="前进">
                <RedoIcon />
              </div>
            </a>
          </li>
          <li>
            <a onClick={clean}>
              <div className="tooltip" data-tip="清除画布">
                <CleanIcon />
              </div>
            </a>
          </li>
          <li>
            <a onClick={saveImage}>
              <div className="tooltip" data-tip="导出为图片">
                <SaveIcon />
              </div>
            </a>
          </li>
        </ul>
      </div>
      <div className="mt-3">
        <div className="font-bold">Scale: {scaleValue / 100}</div>
        <input
          type="range"
          min="0"
          max="300"
          value={scaleValue}
          className="range mt-1"
          onInput={(e) => {
            changeScale(Number((e.target as HTMLInputElement).value))
          }}
        />
      </div>
    </div>
  )
}

export default OptionsCard
