import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { useTranslation } from 'react-i18next'

const guideInfoList = [
  {
    imageList: [
      'https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/guideInfo/drawMode_freeStyle_1.3.0.png'
    ],
    title: 'FreeStyle',
    textList: ['line1', 'line2', 'line3', 'line4', 'line5']
  },
  {
    imageList: [
      'https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/guideInfo/drawMode_shape_1.3.0.png'
    ],
    title: 'ShapeDraw',
    textList: ['line1']
  },
  {
    imageList: [
      'https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/guideInfo/eraserMode_1.3.0.png'
    ],
    title: 'EraserMode',
    textList: ['line1', 'line2']
  },
  {
    imageList: [
      'https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/guideInfo/selectMode_1.3.0.png'
    ],
    title: 'SelectMode',
    textList: ['line1', 'line2', 'line3', 'line4', 'line5', 'line6']
  },
  {
    imageList: [
      'https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/guideInfo/boardMode_1.3.0.png'
    ],
    title: 'BoardMode',
    textList: ['line1', 'line2', 'line3', 'line4']
  },
  {
    imageList: [
      // 'https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/infoIcon.png'
      'https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/borderConfig.png'
    ],
    title: 'BorderConfig',
    textList: ['line1', 'line2', 'line3', 'line4']
  },
  {
    imageList: [
      'https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/files.png'
    ],
    title: 'FileConfig',
    textList: ['line1']
  }
]

const GuideInfoSwiper = () => {
  const { t } = useTranslation()
  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={20}
      modules={[Pagination]}
      pagination={{
        dynamicBullets: true,
        clickable: true
      }}
      autoHeight={true}
      grabCursor={true}
      className="max-w-[500px] xs:max-w-[80vw]"
    >
      {guideInfoList.map((item, index) => (
        <SwiperSlide key={index}>
          <div className="max-h-[50vh] overflow-y-auto">
            <div className="flex w-full rounded-2xl p-3 bg-[#66CC8920] box-border justify-between">
              <div className="shrink-0 w-[49%] flex flex-col items-center justify-start">
                {item.imageList.map((imageUrl, index) => (
                  <img
                    className="max-w-full max-h-full rounded-2xl mt-5 first:mt-0"
                    src={imageUrl}
                    key={index}
                  />
                ))}
              </div>
              <div className="w-[48%] shrink-0 p-3 rounded-2xl bg-[#eef1ff] box-border h-max">
                <div className="text-lg font-fredokaOne">{item.title}</div>
                {item.textList.map((lineKey, index) => (
                  <div key={index} className="text-sm mt-3">
                    {index + 1}. {t(`info.${item.title}.${lineKey}`)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default GuideInfoSwiper
