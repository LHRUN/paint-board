import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import InfoIcon from '@/components/icons/info'
import Mask from '@/components/mask'
import ZhIcon from '../icons/zh'
import EnIcon from '../icons/en'

/**
 * 操作指南弹窗
 */
const Info: React.FC = () => {
  const { i18n } = useTranslation()
  const [showModal, setShowModal] = useState<boolean>(false)
  const handleChangLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'zh' : 'en')
  }

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
        <div className="flex flex-col bg-white rounded-2xl overflow-hidden">
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
            {/* <label className="swap">
              <input type="checkbox" />
              <span className="swap-on fill-current w-10 h-10">
                <ZhIcon></ZhIcon>
              </span>
              <span className="swap-off fill-current w-10 h-10">
                <EnIcon></EnIcon>
              </span>
            </label> */}
            <span className="cursor-pointer" onClick={handleChangLang}>
              {i18n.language === 'en' ? <EnIcon /> : <ZhIcon />}
            </span>
            {/* <span>
              <label className="cursor-pointer label">
                <span className="label-text">ZH</span>
                <input
                  type="checkbox"
                  className="toggle"
                  onChange={handleChangLang}
                  checked={i18n.language === 'en'}
                />
                <span className="label-text">EN</span>
              </label>
            </span> */}
          </div>

          <img
            className="mask w-100"
            src="https://s1.ax1x.com/2022/12/17/zHbHJK.png"
          />
        </div>
      </Mask>
    </>
  )
}

export default Info
