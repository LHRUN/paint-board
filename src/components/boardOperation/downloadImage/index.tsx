import { useState, FC, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDebounceEffect } from '@/hooks/useDebounceEffect'
import { canvasToPngBlob } from '@/core/utils/canvasBlob'
import {
  applyExportBackground,
  type ExportBackground,
  type ExportBackgroundFrame
} from '@/core/export/exportCanvasImage'

import ReactCrop, { Crop } from 'react-image-crop'
import { canvasPreview } from './canvasPreview'
import Toast from '@/components/toast'

import { Scaling, RotateCw, Proportions, Image } from 'lucide-react'
import Mask from '@/components/mask'

import 'react-image-crop/dist/ReactCrop.css'

interface IProps {
  url: string
  showModal: boolean
  setShowModal: (show: boolean) => void
  background: ExportBackground | null
  backgroundFrame: ExportBackgroundFrame | null
}

const DownloadImage: FC<IProps> = ({
  url,
  showModal,
  setShowModal,
  background,
  backgroundFrame
}) => {
  const { t } = useTranslation()
  const [saveImageRotate, updateSaveImageRotate] = useState(0)
  const [saveImageScale, updateSaveImageScale] = useState(1)
  const [saveImageSize, updateSaveImageSize] = useState(1)
  const [includeBackground, setIncludeBackground] = useState(
    Boolean(backgroundFrame)
  )
  const [displayUrl, setDisplayUrl] = useState(url)
  const [imageVersion, setImageVersion] = useState(0)
  const [backgroundPending, setBackgroundPending] = useState(
    Boolean(backgroundFrame)
  )
  const previewUrl = useRef<string | null>(backgroundFrame ? null : url)

  const [completedCrop, setCompletedCrop] = useState<Crop | undefined>()
  const [crop, setCrop] = useState<Crop | undefined>()

  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null)
  const blobUrlRef = useRef('')
  const cropInitialized = useRef(false)
  const [downloadFailed, setDownloadFailed] = useState(false)

  useEffect(() => {
    cropInitialized.current = false
    setIncludeBackground(Boolean(backgroundFrame))
    setDisplayUrl(url)
    if (backgroundFrame) {
      previewUrl.current = null
      setBackgroundPending(true)
    } else {
      previewUrl.current = url
      setBackgroundPending(false)
    }
  }, [url, backgroundFrame])

  useEffect(() => {
    if (!includeBackground || !background || !backgroundFrame) {
      previewUrl.current = url
      setDisplayUrl(url)
      const showingTarget = imgRef.current?.getAttribute('src') === url
      setBackgroundPending(Boolean(backgroundFrame) && !showingTarget)
      return
    }
    let cancelled = false
    previewUrl.current = null
    setBackgroundPending(true)
    applyExportBackground(url, background, backgroundFrame)
      .then((next) => {
        if (cancelled) {
          return
        }
        previewUrl.current = next
        setDisplayUrl(next)
      })
      .catch((error) => {
        console.error('Failed to composite export background', error)
        if (cancelled) {
          return
        }
        previewUrl.current = url
        setDisplayUrl(url)
        if (imgRef.current?.getAttribute('src') === url) {
          setBackgroundPending(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [url, includeBackground, background, backgroundFrame])

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!cropInitialized.current) {
      const { width, height } = e.currentTarget
      const nextCrop: Crop = {
        unit: 'px',
        x: 0.1 * width,
        y: 0.1 * height,
        width: 0.8 * width,
        height: 0.8 * height
      }
      cropInitialized.current = true
      setCrop({ ...nextCrop })
      setCompletedCrop({ ...nextCrop })
    }
    setImageVersion((version) => version + 1)
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
    if (backgroundPending) {
      return
    }
    if (!image || !previewCanvas || !completedCrop) {
      setDownloadFailed(true)
      return
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    try {
      const blob = await canvasToPngBlob(
        previewCanvas,
        previewCanvas.width,
        previewCanvas.height,
        completedCrop.width * scaleX * saveImageSize,
        completedCrop.height * scaleY * saveImageSize
      )

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
      blobUrlRef.current = URL.createObjectURL(blob)

      if (!hiddenAnchorRef.current) {
        setDownloadFailed(true)
        return
      }
      hiddenAnchorRef.current.href = blobUrlRef.current
      hiddenAnchorRef.current.click()
      setDownloadFailed(false)
      setShowModal(false)
    } catch (error) {
      console.error('Failed to download image', error)
      setDownloadFailed(true)
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
        const target = previewUrl.current
        if (target && imgRef.current.getAttribute('src') === target) {
          setBackgroundPending(false)
        }
      }
    },
    100,
    [completedCrop, saveImageScale, saveImageRotate, imageVersion]
  )

  return (
    <Mask
      show={showModal}
      clickMask={() => {
        setShowModal(false)
      }}
    >
      {downloadFailed && <Toast message="tip.exportFail" type="error" />}
      <div className="p-6 bg-[#eef1ff] card shadow-xl overflow-auto max-w-[800px] w-[80vw] h-fit max-h-[60vh]">
        {completedCrop && (
          <div className="w-full flex justify-between">
            <div className="w-[48%]">
              <div className="flex items-center flex-wrap gap-y-2">
                <div
                  className="mr-[12px] shrink-0 min-xs:tooltip"
                  data-tip={t('downloadImage.size')}
                >
                  <Proportions color="#66CC8A" />
                </div>
                <div className="tabs tabs-sm tabs-boxed bg-[#333C4D] shrink-0">
                  {[1, 2, 3].map((value) => (
                    <a
                      key={value}
                      className={`tab flex-grow font-fredokaOne font-normal text-white ${
                        saveImageSize === value
                          ? 'tab-active'
                          : 'hover:text-base-300'
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
                  className="mr-[6px] shrink-0 min-xs:tooltip"
                  data-tip={t('downloadImage.rotate')}
                >
                  <RotateCw color="#66CC8A" />
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
                  className="mr-[12px] shrink-0 min-xs:tooltip"
                  data-tip={t('downloadImage.scale')}
                >
                  <Scaling color="#66CC8A" />
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

              {backgroundFrame && (
                <div className="flex items-center mt-3">
                  <div
                    className="mr-[12px] shrink-0 min-xs:tooltip"
                    data-tip={t('downloadImage.background')}
                  >
                    <Image color="#66CC8A" />
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-success toggle-sm"
                    checked={includeBackground}
                    aria-label={t('downloadImage.background') || undefined}
                    onChange={(e) => {
                      setIncludeBackground(e.target.checked)
                    }}
                  />
                </div>
              )}
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
                disabled={backgroundPending}
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
                    src={displayUrl}
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
