import React, { useMemo, useState } from 'react'
import classNames from 'classnames'
import { CANVAS_ELE_TYPE, CommonWidth } from '@/utils/constants'
import { PaintBoard } from '@/utils/paintBoard'
import UndoIcon from '@/components/icons/undo'
import RedoIcon from '@/components/icons/redo'
import SaveIcon from '@/components/icons/save'
import CleanIcon from '@/components/icons/clean'

import styles from './index.module.css'
import Layer from '../layer'

interface IProps {
  board: PaintBoard | undefined // 画板
  optionsType: string // 操作类型
  setOptionsType: (type: string) => void // 修改操作类型
}

/**
 * 操作面板
 */
const OptionsCard: React.FC<IProps> = ({
  board,
  optionsType,
  setOptionsType
}) => {
  // 刷新操作栏
  const [, setRefresh] = useState(0)
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
      className="fixed top-5 left-5 flex flex-col card shadow-xl py-5 px-5"
      style={{ backgroundColor: '#EEF1FF' }}
    >
      {/* 类型切换 */}
      <div className="btn-group">
        <button
          className={classNames({
            btn: true,
            'flex-grow': true,
            'btn-active': optionsType === CANVAS_ELE_TYPE.FREE_LINE
          })}
          onClick={() => setOptionsType(CANVAS_ELE_TYPE.FREE_LINE)}
        >
          画笔
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
      {/* 宽度设置 */}
      <div className="mt-3">
        <div className="font-bold">Width</div>
        <div className="btn-group mt-1">
          {Object.values(CommonWidth).map((w) => (
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
                className="rounded-2xl bg-black"
                style={{
                  height: `${w / 2}px`,
                  width: '30px'
                }}
                key={w}
              ></div>
            </button>
          ))}
        </div>
      </div>
      {/* 颜色设置 */}
      {optionsType === CANVAS_ELE_TYPE.FREE_LINE && (
        <div className="form-control mt-3">
          <div className="font-bold">Color</div>
          <div className="mt-1 flex items-center justify-center w-full">
            <div className="w-8 h-8 mr-2 tooltip" data-tip="画笔颜色">
              <input
                type="color"
                value={`#${colorInput}`}
                onChange={(e) => {
                  changeLineColor(e.target.value)
                }}
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
      {/* 操作画板 */}
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
      {/* 图层设置 */}
      <Layer board={board} refresh={() => setRefresh((v) => v + 1)} />
    </div>
  )
}

export default OptionsCard
