import { useState, FC, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounceEffect } from '@/hooks/useDebounceEffect'

import ReactCrop, { Crop } from 'react-image-crop'
import { canvasPreview } from './canvasPreview'

import Mask from '@/components/mask'
import ImageRotate from '@/components/icons/boardOperation/image-rotate.svg?react'
import ImageScale from '@/components/icons/boardOperation/image-scale.svg?react'
import ImageSize from '@/components/icons/boardOperation/image-size.svg?react'

import 'react-image-crop/dist/ReactCrop.css'

interface IProps {
  url: string
  showModal: boolean
  setShowModal: (show: boolean) => void
}

const DownloadImage: FC<IProps> = ({ url, showModal, setShowModal }) => {
  const { t } = useTranslation()
  const [saveImageRotate, updateSaveImageRotate] = useState(0)
  const [saveImageScale, updateSaveImageScale] = useState(1)
  const [saveImageSize, updateSaveImageSize] = useState(1)

  const [completedCrop, setCompletedCrop] = useState<Crop | undefined>()
  const [crop, setCrop] = useState<Crop | undefined>()

  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null)
  const blobUrlRef = useRef('')

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const crop: Crop = {
      unit: 'px',
      x: 0.1 * width,
      y: 0.1 * height,
      width: 0.8 * width,
      height: 0.8 * height
    }
    setCrop({ ...crop })
    setCompletedCrop({ ...crop })
  }

  const handleReset = () => {
    if (imgRef.current) {
      const { width, height } = imgRef.current
      const crop: Crop = {
        unit: 'px',
        x: 0.1 * width,
        y: 0.1 * height,
        width: 0.8 * width,
        height: 0.8 * height
      }
      setCrop({ ...crop })
      setCompletedCrop({ ...crop })
    }
    updateSaveImageRotate(0)
    updateSaveImageScale(1)
  }

  const onDownloadCropClick = async () => {
    const image = imgRef.current
    const previewCanvas = previewCanvasRef.current
    if (!image || !previewCanvas || !completedCrop) {
      throw new Error('Crop canvas does not exist')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const offscreen = new OffscreenCanvas(
      completedCrop.width * scaleX * saveImageSize,
      completedCrop.height * scaleY * saveImageSize
    )
    const ctx = offscreen.getContext('2d')
    if (!ctx) {
      throw new Error('No 2d context')
    }

    ctx.drawImage(
      previewCanvas,
      0,
      0,
      previewCanvas.width,
      previewCanvas.height,
      0,
      0,
      offscreen.width,
      offscreen.height
    )

    // or { type: "image/jpeg", quality: <0 to 1> }
    const blob = await offscreen.convertToBlob({
      type: 'image/png'
    })

    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
    }
    blobUrlRef.current = URL.createObjectURL(blob)

    if (hiddenAnchorRef.current) {
      hiddenAnchorRef.current.href = blobUrlRef.current
      hiddenAnchorRef.current.click()

      setShowModal(false)
    }
  }

  useDebounceEffect(
    async () => {
      if (
        completedCrop?.width &&
        completedCrop?.height &&
        imgRef.current &&
        previewCanvasRef.current
      ) {
        canvasPreview(
          imgRef.current,
          previewCanvasRef.current,
          completedCrop,
          saveImageScale,
          saveImageRotate
        )
      }
    },
    100,
    [completedCrop, saveImageScale, saveImageRotate]
  )

  return (
    <Mask
      show={showModal}
      clickMask={() => {
        setShowModal(false)
      }}
    >
      <div className="p-6 bg-[#eef1ff] card shadow-xl overflow-auto max-w-[800px] w-[80vw] h-fit max-h-[60vh]">
        {completedCrop && (
          <div className="w-full flex justify-between">
            <div className="w-[48%]">
              <div className="flex items-center flex-wrap gap-y-2">
                <div
                  className="mr-[12px] shrink-0 tooltip"
                  data-tip={t('downloadImage.size')}
                >
                  <ImageSize />
                </div>
                <div className="tabs tabs-boxed bg-[#333C4D] shrink-0">
                  {[1, 2, 3].map((value) => (
                    <a
                      key={value}
                      className={`tab tab-sm flex-grow font-fredokaOne font-normal text-white ${
                        saveImageSize === value ? 'tab-active' : ''
                      }`}
                      onClick={() => {
                        updateSaveImageSize(value)
                      }}
                    >
                      {`${value}x`}
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex items-center mt-3">
                <div
                  className="mr-[6px] shrink-0 tooltip"
                  data-tip={t('downloadImage.rotate')}
                >
                  <ImageRotate />
                </div>
                <input
                  className="range range-primary range-xs"
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={String(saveImageRotate)}
                  onChange={(e) => {
                    updateSaveImageRotate(Number(e.target.value))
                  }}
                />
              </div>

              <div className="flex items-center mt-3">
                <div
                  className="mr-[12px] shrink-0 tooltip"
                  data-tip={t('downloadImage.scale')}
                >
                  <ImageScale />
                </div>
                <input
                  className="range range-primary range-xs"
                  type="range"
                  min="0.2"
                  max="1.5"
                  step="0.1"
                  value={String(saveImageScale)}
                  onChange={(e) => {
                    updateSaveImageScale(Number(e.target.value))
                  }}
                />
              </div>
            </div>

            <div className="w-[48%] flex flex-wrap gap-x-4 gap-y-2 h-fit">
              <button
                className="btn btn-ghost btn-outline btn-sm"
                onClick={() => setShowModal(false)}
              >
                {t('cancel')}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleReset}
              >
                {t('reset')}
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={onDownloadCropClick}
              >
                {t('download')}
              </button>

              <a
                href="#hidden"
                ref={hiddenAnchorRef}
                download="paint-board"
                style={{
                  position: 'absolute',
                  top: '-200vh',
                  visibility: 'hidden'
                }}
              >
                Hidden download
              </a>
            </div>
          </div>
        )}
        <div className="w-full flex justify-between mt-3">
          {url && (
            <div className="w-[48%] shrink-0">
              <div className="w-fit bg-transparent bg-[length:13px_13px] bg-white flex">
                <ReactCrop
                  crop={crop}
                  onChange={setCrop}
                  onComplete={setCompletedCrop}
                  minHeight={100}
                  minWidth={100}
                >
                  <img
                    ref={imgRef}
                    src={url}
                    style={{
                      transform: `scale(${saveImageScale}) rotate(${saveImageRotate}deg)`
                    }}
                    onLoad={onImageLoad}
                  />
                </ReactCrop>
              </div>
            </div>
          )}
          {completedCrop && (
            <div className="w-[48%] shrink-0">
              <canvas
                ref={previewCanvasRef}
                className="object-contain border border-base-content border-dashed"
                style={{
                  width: completedCrop.width,
                  height: completedCrop.height
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Mask>
  )
}

export default DownloadImage
