import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import ImageDataJson from './data/stencils.json'
import { autoDrawData } from '@/utils/autodraw'
import { IInk, autoDrawPost } from '@/services/autodraw'
import { paintBoard } from '@/utils/paintBoard'

import ArrowLeftIcon from '@/components/icons/autodraw/arrowLeft.svg?react'
import ArrowRightIcon from '@/components/icons/autodraw/arrowRight.svg?react'

import styles from './index.module.css'

const AutoDrawPanel = () => {
  const { t } = useTranslation()
  const [ink, updateInk] = useState<IInk[]>([])
  const [svgImages, updateSVGImages] = useState<string[]>([])
  const [loading, updateLoading] = useState(false)
  const [error, updateError] = useState(false)

  useEffect(() => {
    paintBoard.evnet?.clickEvent.changeInkHookFn(updateInk)
  }, [updateInk])

  useEffect(() => {
    if (ink?.[0]?.[0]?.length > 3) {
      autoDrawRequest()
    }
  }, [ink])

  const autoDrawRequest = async () => {
    try {
      updateLoading(true)
      const data = await autoDrawPost({
        drawWidth: Number.MAX_SAFE_INTEGER,
        drawHeight: Number.MAX_SAFE_INTEGER,
        ink
      })

      const isSuccess = data?.[0] === 'SUCCESS'
      if (isSuccess) {
        const newSVGImages = JSON.parse(
          data[1][0][3].debug_info.match(
            /SCORESINKS: (.*) Service_Recognize:/
          )[1]
        ).reduce((acc: string[], result: any[]) => {
          const cur = (
            ImageDataJson as Record<string, Array<{ src: string }>>
          )?.[result?.[0]]?.map((collection: { src: string }) => collection.src)
          return acc.concat(cur || [])
        }, [])
        updateSVGImages(newSVGImages)
      } else {
        updateError(true)
      }
    } catch (error) {
      updateError(true)
    }
    updateLoading(false)
  }

  const clickLeft = () => {
    const scrollContainer = document.getElementById('autodraw-scroll-container')
    scrollContainer?.scrollBy({
      left: -300,
      behavior: 'smooth'
    })
  }

  const clickRight = () => {
    const scrollContainer = document.getElementById('autodraw-scroll-container')
    scrollContainer?.scrollBy({
      left: 300,
      behavior: 'smooth'
    })
  }

  const clickImage = (src: string) => {
    autoDrawData.replaceSVGImg(src)
  }

  return (
    <div className="fixed top-3 right-3 flex">
      <div
        className={`absolute top-0 bottom-0 left-0 z-10 flex items-center w-16 h-full pl-[15px] cursor-pointer rounded-2xl ${styles.arrowLeft}`}
      >
        <ArrowLeftIcon onClick={clickLeft} />
      </div>
      <div
        className="flex items-center text-center w-[50vw] overflow-x-auto py-2 px-16 h-14 noScrollbar box-border rounded-2xl border border-solid border-[rgb(238 241 255)] bg-[#EEF1FF80]"
        id="autodraw-scroll-container"
      >
        {error
          ? t('request.error')
          : loading
          ? t('request.loading')
          : !svgImages.length
          ? t('request.tip')
          : svgImages.map((src, index) => (
              <img
                key={index}
                src={src}
                className="w-12 h-12 p-1 mr-4 hover:cursor-pointer hover:bg-[rgba(203,213,225,0.3)] rounded-lg"
                onClick={() => clickImage(src)}
              ></img>
            ))}
      </div>
      <div
        className={`absolute top-0 bottom-0 right-0 z-10 flex items-center justify-end w-16 h-full pr-[15px] cursor-pointer rounded-2xl ${styles.arrowRight}`}
      >
        <ArrowRightIcon onClick={clickRight} />
      </div>
    </div>
  )
}

export default AutoDrawPanel
