import React, { useState } from 'react'
import InfoIcon from '@/components/icons/info'

/**
 * 帮助信息组件
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
      <div
        className={`fixed top-0 left-0 w-full h-full items-center justify-center bg-black bg-opacity-75 ${
          showModal ? 'flex' : 'hidden'
        }`}
        onClick={() => setShowModal(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col bg-white w-6/12 rounded-2xl overflow-hidden"
        >
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
            src="https://s1.ax1x.com/2022/09/18/xpLdFe.png"
          />
        </div>
      </div>
    </>
  )
}

export default Info
