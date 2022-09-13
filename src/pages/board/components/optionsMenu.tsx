import React, { ChangeEvent } from 'react'
import { PaintBoard } from '@/utils/paintBoard'
import { CANVAS_ELE_TYPE, CleanWidth, LineWidth } from '@/utils/constants'

interface IProps {
  board: PaintBoard | undefined
  optionsType: string
  setOptionsType: (type: string) => void
}

const OptionsMenu: React.FC<IProps> = ({ board, setOptionsType }) => {
  const changeLineColor = (e: ChangeEvent<{ value: string }>) => {
    if (board) {
      board.setLineColor(e.target.value)
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

  const setBackgroundColor = () => {
    if (board) {
      board.setBackgroundColor('orange')
    }
  }

  return (
    <div className="fixed w-30 top-10 left-10 mb-10 flex flex-col">
      <div>
        <button
          className="mr-5"
          onClick={() => setOptionsType(CANVAS_ELE_TYPE.FREE_LINE)}
        >
          Link
        </button>
        {Object.keys(LineWidth).map((w: string) => {
          return !Number.isNaN(Number(w)) ? (
            <div
              style={{
                width: `${w}px`,
                height: `${w}px`,
                borderRadius: '50%',
                backgroundColor: 'black'
              }}
            ></div>
          ) : null
        })}
      </div>

      <div>
        <button
          className="mr-5"
          onClick={() => setOptionsType(CANVAS_ELE_TYPE.CLEAN_LINE)}
        >
          Clean
        </button>
        {Object.keys(CleanWidth).map((w: string) => {
          return !Number.isNaN(Number(w)) ? (
            <div
              style={{
                width: `${w}px`,
                height: `${w}px`,
                borderRadius: '50%',
                backgroundColor: 'black'
              }}
            ></div>
          ) : null
        })}
      </div>
      <button
        onClick={() => {
          undo()
        }}
        className="mr-5"
      >
        后退
      </button>
      <button
        onClick={() => {
          redo()
        }}
        className="mr-5"
      >
        前进
      </button>
      <input type="color" onChange={changeLineColor} />
      <button onClick={saveImage}>保存为图片</button>
      <button onClick={setBackgroundColor}>修改背景颜色</button>
    </div>
  )
}

export default OptionsMenu
