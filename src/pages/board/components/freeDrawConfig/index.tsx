import Mask from '@/components/mask'
import { FreeDrawStyle } from '@/utils/element/freeDraw'
import { PaintBoard } from '@/utils/paintBoard'
import { FC, useState } from 'react'

interface IProps {
  board: PaintBoard | undefined
}

const FreeDrawConfig: FC<IProps> = ({ board }) => {
  const [showModal, setShowModal] = useState<boolean>(false)
  const [, setRefresh] = useState(0)
  const setFreeDrawStyle = (mode: FreeDrawStyle) => {
    if (board) {
      board.setFreeDrawStyle(mode)
      setRefresh((v) => v + 1)
    }
  }

  return (
    <>
      <button className="btn min-h-0 h-8" onClick={() => setShowModal(true)}>
        高级配置
      </button>
      <Mask show={showModal} clickMask={() => setShowModal(false)}>
        <div className="bg-white rounded-lg p-3">
          <div className="btn-group">
            <button
              className={`btn btn-sm flex-grow ${
                board?.currentFreeDrawStyle === FreeDrawStyle.Basic
                  ? 'btn-active'
                  : ''
              }`}
              onClick={() => setFreeDrawStyle(FreeDrawStyle.Basic)}
            >
              单色
            </button>
            <button
              className={`btn btn-sm flex-grow ${
                board?.currentFreeDrawStyle === FreeDrawStyle.Shadow
                  ? 'btn-active'
                  : ''
              }`}
              onClick={() => setFreeDrawStyle(FreeDrawStyle.Shadow)}
            >
              荧光
            </button>
            <button
              className={`btn btn-sm flex-grow ${
                board?.currentFreeDrawStyle === FreeDrawStyle.DoubleColor
                  ? 'btn-active'
                  : ''
              }`}
              onClick={() => setFreeDrawStyle(FreeDrawStyle.DoubleColor)}
            >
              多色
            </button>
            <button
              className={`btn btn-sm flex-grow ${
                board?.currentFreeDrawStyle === FreeDrawStyle.Spray
                  ? 'btn-active'
                  : ''
              }`}
              onClick={() => setFreeDrawStyle(FreeDrawStyle.Spray)}
            >
              喷雾
            </button>
            <button
              className={`btn btn-sm ${
                board?.currentFreeDrawStyle === FreeDrawStyle.Bubble
                  ? 'btn-active'
                  : ''
              }`}
              onClick={() => setFreeDrawStyle(FreeDrawStyle.Bubble)}
            >
              泡泡
            </button>
          </div>
          <div className="flex justify-between">
            <div className="mr-3">
              <div>透明度</div>
              <input
                type="range"
                min="0"
                max="100"
                value="25"
                className="range range-primary"
                step="25"
              />
            </div>
            <div>
              <canvas width={200} height={100}></canvas>
            </div>
          </div>
        </div>
      </Mask>
    </>
  )
}

export default FreeDrawConfig
