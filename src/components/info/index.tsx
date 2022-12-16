import React, { useState } from 'react'
import InfoIcon from '@/components/icons/info'
import Mask from '@/components/mask'

/**
 * 操作指南弹窗
 */
const Info: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false)

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="fixed bottom-5 left-5 cursor-pointer"
      >
        <InfoIcon />
      </div>
      <Mask
        show={showModal}
        clickMask={() => {
          setShowModal(false)
        }}
      >
        <div className="flex flex-col bg-white w-6/12 rounded-2xl overflow-hidden">
          <div className="font-bold my-4 mx-4">
            repo:
            <a
              className="link link-primary inline-block ml-1 mr-3"
              href="https://github.com/LHRUN/paint-board.git"
              target="_blank"
              rel="noreferrer"
            >
              https://github.com/LHRUN/paint-board.git
            </a>
            欢迎Star⭐️
          </div>
          <img
            className="mask"
            src="https://s1.ax1x.com/2022/12/03/zrDz4S.jpg"
          />
        </div>
      </Mask>
    </>
  )
}

export default Info
