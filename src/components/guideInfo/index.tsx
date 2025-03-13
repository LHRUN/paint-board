import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import useBoardStore from '@/store/board'

import InfoIcon from '@/components/icons/info.svg?react'
import TranslateIcon from '@/components/icons/translate.svg?react'
import ZoomInfo from '../zoomInfo'
import Mask from '@/components/mask'
import GuideInfoSwiper from './guideInfoSwiper'

const languageList = [
  {
    value: 'en',
    name: 'English'
  },
  {
    value: 'zh',
    name: '中文(简体)'
  },
  {
    value: 'zh-tw',
    name: '中文(繁體)'
  },
  {
    value: 'ja',
    name: '日本語'
  },
  {
    value: 'ko',
    name: '한국어'
  }
]

const GuideInfo: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { language, updateLanguage } = useBoardStore()
  const [showModal, setShowModal] = useState<boolean>(false)
  const handleChangLang = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage)
    updateLanguage(newLanguage)
  }

  return (
    <>
      <div className="fixed bottom-5 left-5 flex flex-row justify-center items-center px-2.5 py-1.5 rounded-full bg-[#eef1ff]">
        <InfoIcon
          className="bg-white rounded-full cursor-pointer hover:opacity-70"
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
        <div className="flex flex-col bg-white rounded-2xl overflow-hidden p-3 max-h-[80vh]">
          <div className="flex items-center justify-between font-bold mb-4 ">
            <div className="text-sm">
              repo:
              <a
                className="link link-primary inline-block ml-1 mr-3 break-all"
                href="https://github.com/LHRUN/paint-board"
                target="_blank"
                rel="noreferrer"
              >
                github.com/LHRUN/paint-board
              </a>
              {t('info.welecome')}⭐️
            </div>

            <div className="dropdown dropdown-bottom dropdown-end">
              <label tabIndex={0}>
                <TranslateIcon className="w-8 h-8 p-1 bg-[#66CC8960] rounded-md hover:bg-[#66CC8980] cursor-pointer" />
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu menu-compact shadow bg-base-100 rounded-box w-40"
              >
                {languageList.map((item) => (
                  <li
                    key={item.value}
                    onClick={() => handleChangLang(item.value)}
                  >
                    <a className={`${item.value === language ? 'active' : ''}`}>
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <GuideInfoSwiper />
        </div>
      </Mask>
    </>
  )
}

export default GuideInfo
