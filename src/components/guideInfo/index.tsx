import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatPublicUrl } from '@/utils/common/index'
import useBoardStore from '@/store/board'

import InfoIcon from '@/components/icons/info.svg?react'
import Mask from '@/components/mask'
import ZhIcon from '@/components/icons/zh.svg?react'
import EnIcon from '@/components/icons/en.svg?react'
import ZoomInfo from '../zoomInfo'

const GuideInfo: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { language, updateLanguage } = useBoardStore()
  const [showModal, setShowModal] = useState<boolean>(false)
  const handleChangLang = () => {
    const newLanguage = language === 'en' ? 'zh' : 'en'
    i18n.changeLanguage(newLanguage)
    updateLanguage(newLanguage)
  }

  return (
    <>
      <div className="fixed bottom-5 left-5 flex flex-row justify-center items-center px-2.5 py-1.5 rounded-full bg-[#eef1ff]">
        <InfoIcon
          className="bg-white rounded-full cursor-pointer"
          onClick={() => setShowModal(true)}
        />
        <ZoomInfo />
      </div>
      <Mask
        show={showModal}
        clickMask={() => {
          setShowModal(false)
        }}
      >
        <div className="flex flex-col bg-white rounded-2xl overflow-hidden py-1 px-3">
          <div className="flex items-center justify-between font-bold my-4 mx-4">
            <div>
              repo:
              <a
                className="link link-primary inline-block ml-1 mr-3 break-all"
                href="https://github.com/LHRUN/paint-board.git"
                target="_blank"
                rel="noreferrer"
              >
                https://github.com/LHRUN/paint-board.git
              </a>
              {t('info.welecome')}⭐️
            </div>
            <span
              className="box-border ml-5 cursor-pointer border-solid border-4 border-[#7b8fa1] rounded-full hover:border-[#567189]"
              onClick={handleChangLang}
            >
              {language === 'en' ? <EnIcon /> : <ZhIcon />}
            </span>
          </div>

          <img
            className="mask"
            width={600}
            src={formatPublicUrl(t('info.url') || '')}
          />
        </div>
      </Mask>
    </>
  )
}

export default GuideInfo
