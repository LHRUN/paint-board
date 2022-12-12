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
      <button className={`btn`} onClick={() => setShowModal(true)}>
        配置
      </button>
      <Mask show={showModal} clickMask={() => setShowModal(false)}>
        <div className="btn-group">
          <button
            className={`btn btn-sm flex-grow ${
              board?.currentFreeDrawStyle === FreeDrawStyle.Basic
                ? 'btn-active'
                : ''
            }`}
            onClick={() => setFreeDrawStyle(FreeDrawStyle.Basic)}
          >
            基础
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
            双色
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
        </div>
      </Mask>
    </>
  )
}

export default FreeDrawConfig
