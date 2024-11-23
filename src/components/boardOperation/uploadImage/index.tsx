import { useState, FC, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  env,
  AutoModel,
  AutoProcessor,
  RawImage,
  PreTrainedModel,
  Processor
} from '@huggingface/transformers'
import { ImageElement } from '@/utils/element/image'
import { cropTransparent } from '@/utils/common/cropTransparent'

import Mask from '@/components/mask'
import ImageSegmentation from './imageSegmentation'
import InfoOutline from '@/components/icons/info-outline.svg?react'

interface IProps {
  url: string
  showModal: boolean
  setShowModal: (show: boolean) => void
}

const REMOVE_BACKGROUND_STATUS = {
  LOADING: 0,
  NO_SUPPORT_WEBGPU: 1,
  LOAD_ERROR: 2,
  LOAD_SUCCESS: 3,
  PROCESSING: 4,
  PROCESSING_SUCCESS: 5
}

type RemoveBackgroundStatusType =
  (typeof REMOVE_BACKGROUND_STATUS)[keyof typeof REMOVE_BACKGROUND_STATUS]

const UploadImage: FC<IProps> = ({ url, showModal, setShowModal }) => {
  const { t } = useTranslation()
  const [showImageSegmentationModal, setShowImageSegmentationModal] =
    useState(false)

  const [removeBackgroundStatus, setRemoveBackgroundStatus] =
    useState<RemoveBackgroundStatusType>()
  const [processedImage, setProcessedImage] = useState('')
  const [showOriginImage, setShowOriginImage] = useState(true)

  const modelRef = useRef<PreTrainedModel>()
  const processorRef = useRef<Processor>()

  const removeBackgroundBtnTip = useMemo(() => {
    switch (removeBackgroundStatus) {
      case REMOVE_BACKGROUND_STATUS.LOADING:
        return 'uploadImage.removeBackgroundLoading'
      case REMOVE_BACKGROUND_STATUS.NO_SUPPORT_WEBGPU:
        return 'uploadImage.removeBackgroundGpuTip'
      case REMOVE_BACKGROUND_STATUS.LOAD_ERROR:
        return 'uploadImage.removeBackgroundFailed'
      case REMOVE_BACKGROUND_STATUS.LOAD_SUCCESS:
        return 'uploadImage.removeBackgroundSuccess'
      case REMOVE_BACKGROUND_STATUS.PROCESSING:
        return 'uploadImage.removeBackgroundProcessing'
      case REMOVE_BACKGROUND_STATUS.PROCESSING_SUCCESS:
        return 'uploadImage.removeBackgroundProcessingSuccess'
      default:
        return ''
    }
  }, [removeBackgroundStatus])

  useEffect(() => {
    ;(async () => {
      try {
        if (
          !showModal ||
          modelRef.current ||
          processorRef.current ||
          removeBackgroundStatus === REMOVE_BACKGROUND_STATUS.LOADING
        ) {
          return
        }

        setRemoveBackgroundStatus(REMOVE_BACKGROUND_STATUS.LOADING)
        if (!navigator?.gpu) {
          setRemoveBackgroundStatus(REMOVE_BACKGROUND_STATUS.NO_SUPPORT_WEBGPU)
          return
        }
        const model_id = 'Xenova/modnet'
        if (env.backends.onnx.wasm) {
          env.backends.onnx.wasm.proxy = false
        }
        modelRef.current ??= await AutoModel.from_pretrained(model_id, {
          device: 'webgpu'
        })
        processorRef.current ??= await AutoProcessor.from_pretrained(model_id)
        setRemoveBackgroundStatus(REMOVE_BACKGROUND_STATUS.LOAD_SUCCESS)
      } catch (err) {
        console.log('err', err)
        setRemoveBackgroundStatus(REMOVE_BACKGROUND_STATUS.LOAD_ERROR)
      }
    })()
  }, [showModal])

  const handleCancel = () => {
    setShowModal(false)
    setShowImageSegmentationModal(false)
    setShowOriginImage(true)
    setProcessedImage('')
  }

  const processImages = async () => {
    if (processedImage) {
      setShowOriginImage(!showOriginImage)
      return
    }

    const model = modelRef.current
    const processor = processorRef.current

    if (!model || !processor) {
      return
    }

    setRemoveBackgroundStatus(REMOVE_BACKGROUND_STATUS.PROCESSING)

    // Load image
    const img = await RawImage.fromURL(url)

    // Pre-process image
    const { pixel_values } = await processor(img)

    // Predict alpha matte
    const { output } = await model({ input: pixel_values })

    const maskData = (
      await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(
        img.width,
        img.height
      )
    ).data

    // Create new canvas
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    // Draw original image output to canvas
    ctx.drawImage(img.toCanvas(), 0, 0)

    // Update alpha channel
    const pixelData = ctx.getImageData(0, 0, img.width, img.height)
    for (let i = 0; i < maskData.length; ++i) {
      pixelData.data[4 * i + 3] = maskData[i]
    }
    ctx.putImageData(pixelData, 0, 0)

    setProcessedImage(canvas.toDataURL('image/png'))
    setRemoveBackgroundStatus(REMOVE_BACKGROUND_STATUS.PROCESSING_SUCCESS)
    setShowOriginImage(false)
  }

  const uploadImage = () => {
    const image = new ImageElement()
    if (showOriginImage) {
      image.addImage(url)
      handleCancel()
    } else if (processedImage) {
      cropTransparent(processedImage).then((url) => {
        image.addImage(url)
      })
      handleCancel()
    }
  }

  return (
    <Mask
      show={showModal}
      clickMask={() => {
        handleCancel()
      }}
    >
      <div className="p-6 bg-[#eef1ff] card shadow-xl overflow-auto">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 w-[50vw] max-w-[400px]">
          <button
            className="btn btn-ghost btn-outline btn-sm"
            onClick={handleCancel}
          >
            {t('cancel')}
          </button>
          <button className="btn btn-primary btn-sm" onClick={uploadImage}>
            {t('uploadImage.upload')}
          </button>
          <button
            className={`btn btn-primary btn-sm ${
              ![
                REMOVE_BACKGROUND_STATUS.LOAD_SUCCESS,
                REMOVE_BACKGROUND_STATUS.PROCESSING_SUCCESS,
                undefined
              ].includes(removeBackgroundStatus)
                ? 'btn-disabled'
                : ''
            }`}
            onClick={processImages}
          >
            {showOriginImage
              ? t('uploadImage.removeBackground')
              : t('uploadImage.restore')}
          </button>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowImageSegmentationModal(true)}
          >
            {t('uploadImage.imageSegmentation')}
          </button>
        </div>
        <div className="text-xs text-base-content mt-2 w-[50vw] max-w-[400px] flex">
          <InfoOutline className="shrink-0" />
          <span className="ml-1">{t(removeBackgroundBtnTip)}</span>
        </div>
        <div className="relative mt-4 border border-base-content border-dashed rounded-lg overflow-hidden">
          <img
            className={`w-[50vw] max-w-[400px] h-[50vh] max-h-[400px] transition-opacity duration-300 object-contain ${
              showOriginImage ? 'opacity-100' : 'opacity-0'
            }`}
            src={url}
          />
          {processedImage && (
            <img
              className={`w-full h-full absolute top-0 left-0 z-[2] transition-opacity duration-300 object-contain ${
                showOriginImage ? 'opacity-0' : 'opacity-100'
              }`}
              src={processedImage}
            />
          )}
        </div>

        <ImageSegmentation
          url={url}
          showModal={showImageSegmentationModal}
          setShowModal={setShowImageSegmentationModal}
          cancelUploadImageModal={handleCancel}
        />
      </div>
    </Mask>
  )
}

export default UploadImage
