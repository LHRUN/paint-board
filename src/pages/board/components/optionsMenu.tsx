import React, { ChangeEvent } from 'react'
import classNames from 'classnames'
import { PaintBoard } from '@/utils/paintBoard'
import { CANVAS_ELE_TYPE, CommonWidth } from '@/utils/constants'

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
          Link
        </button>
        <button
          className={classNames({
            btn: true,
            'btn-active': optionsType === CANVAS_ELE_TYPE.CLEAN_LINE
          })}
          onClick={() => setOptionsType(CANVAS_ELE_TYPE.CLEAN_LINE)}
        >
          Clean
        </button>
      </div>
      <div className="mt-3">
        <div>Width</div>
        <div className="btn-group">
          {Object.values(CommonWidth).map((w) => {
            return !Number.isNaN(w) ? (
              <button
                className={classNames({
                  btn: true,
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
      <div className="form-control mt-3">
        <div>Color</div>
        <label className="input-group">
          <span>
            <input type="color" onChange={changeLineColor} />
          </span>
          <input
            type="text"
            value={board?.currentLineColor}
            onChange={changeLineColor}
            className="input input-bordered"
          />
        </label>
      </div>
      <div>
        <button
          onClick={() => {
            undo()
          }}
          className="mr-5 btn btn-outline"
        >
          <svg
            style={{ transform: 'scale(-1, 1)' }}
            t="1663165795445"
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="6082"
            width="32"
            height="32"
          >
            <path
              d="M553.510259 201.860177c-312.055513 53.779187-655.249802 337.402216-45.768564 793.695176C283.646139 771.440335 83.62989 414.41051 555.277559 433.448208l1.201715 162.84822 297.307743-261.013025L552.261108 30.273979 553.510259 201.860177 553.510259 201.860177zM553.510259 201.860177"
              p-id="6083"
              fill="#65CC8A"
            ></path>
          </svg>
        </button>
        <button
          onClick={() => {
            redo()
          }}
          className="mr-5 btn btn-outline"
        >
          <svg
            t="1663165795445"
            className="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="6082"
            width="32"
            height="32"
          >
            <path
              d="M553.510259 201.860177c-312.055513 53.779187-655.249802 337.402216-45.768564 793.695176C283.646139 771.440335 83.62989 414.41051 555.277559 433.448208l1.201715 162.84822 297.307743-261.013025L552.261108 30.273979 553.510259 201.860177 553.510259 201.860177zM553.510259 201.860177"
              p-id="6083"
              fill="#65CC8A"
            ></path>
          </svg>
        </button>
        <button onClick={saveImage}>
          <svg
            t="1663166418714"
            className="icon"
            viewBox="0 0 1073 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="8927"
            width="32"
            height="32"
          >
            <path
              d="M190.526479 1023.999744h691.891719a190.782735 190.782735 0 0 0 191.038991-190.526479V190.526479A190.782735 190.782735 0 0 0 882.802582 0h-691.891719A190.782735 190.782735 0 0 0 0 190.526479v642.946786a190.782735 190.782735 0 0 0 190.526479 190.526479z m0-939.563329h25.625619v259.203139a145.809773 145.809773 0 0 0 146.06603 145.681645h350.942855A145.809773 145.809773 0 0 0 858.458244 343.639554V84.436415h24.344338a106.218192 106.218192 0 0 1 106.218192 106.090064v642.946786a106.34632 106.34632 0 0 1-106.218192 106.090063h-691.891719a106.218192 106.218192 0 0 1-106.090063-106.090063V190.526479a106.090064 106.090064 0 0 1 105.705679-106.090064z m110.446419 6.406405h474.073955v252.796734a61.373358 61.373358 0 0 1-61.24523 61.24523H362.218128a61.24523 61.24523 0 0 1-61.24523-61.24523z"
              fill="#65CC8A"
              p-id="8928"
            ></path>
            <path
              d="M693.81364 397.197098a42.154144 42.154144 0 0 0 42.282272-42.154144v-153.753715a42.282272 42.282272 0 0 0-84.436415 0v153.753715A42.154144 42.154144 0 0 0 693.81364 397.197098z"
              fill="#65CC8A"
              p-id="8929"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default OptionsMenu
