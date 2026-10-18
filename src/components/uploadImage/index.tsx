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
import { cropTransparent } from '@/utils/cropTransparent'
import { releaseModel, whenModelReleased } from './releaseModel'

import { Info } from 'lucide-react'
import Mask from '@/components/mask'
import ImageSegmentation from './imageSegmentation'

interface IProps {
  url: string
  showModal: boolean
  setShowModal: (show: boolean) => void
  handleUploadImage: (image: string) => void
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

// Survives closing the dialog so a new open waits for the cancelled load to release.
let backgroundLoadTask: Promise<void> = Promise.resolve()

const UploadImage: FC<IProps> = ({
  url,
  showModal,
  setShowModal,
  handleUploadImage
}) => {
  const { t } = useTranslation()
  const [showImageSegmentationModal, setShowImageSegmentationModal] =
    useState(false)

  const [removeBackgroundStatus, setRemoveBackgroundStatus] =
    useState<RemoveBackgroundStatusType>()
  const [processedImage, setProcessedImage] = useState('')
  const [showOriginImage, setShowOriginImage] = useState(true)

  const modelRef = useRef<PreTrainedModel>()
  const processorRef = useRef<Processor>()
  const sessionRef = useRef(0)

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
    if (!showModal) {
      return
    }
    let cancelled = false
    setRemoveBackgroundStatus(REMOVE_BACKGROUND_STATUS.LOADING)
    const previousLoad = backgroundLoadTask
    const load = (async () => {
      let model: PreTrainedModel | undefined
      try {
        await previousLoad
        await whenModelReleased()
        if (cancelled || modelRef.current || processorRef.current) {
          return
        }
        if (!navigator?.gpu) {
          setRemoveBackgroundStatus(REMOVE_BACKGROUND_STATUS.NO_SUPPORT_WEBGPU)
          return
        }
        const model_id = 'Xenova/modnet'
        if (env.backends.onnx.wasm) {
          env.backends.onnx.wasm.proxy = false
        }
        model = await AutoModel.from_pretrained(model_id, {
          device: 'webgpu'
        })
        const processor = await AutoProcessor.from_pretrained(model_id)
        if (cancelled) {
          await releaseModel(model)
          model = undefined
          return
        }
        modelRef.current = model
        processorRef.current = processor
        model = undefined
        setRemoveBackgroundStatus(REMOVE_BACKGROUND_STATUS.LOAD_SUCCESS)
      } catch (err) {
        await releaseModel(model)
        if (!cancelled) {
          console.log('err', err)
          setRemoveBackgroundStatus(REMOVE_BACKGROUND_STATUS.LOAD_ERROR)
        }
      }
    })()
    backgroundLoadTask = load.then(
      () => undefined,
      () => undefined
    )
    return () => {
      cancelled = true
      sessionRef.current += 1
      const currentModel = modelRef.current
      modelRef.current = undefined
      processorRef.current = undefined
      void releaseModel(currentModel)
      setRemoveBackgroundStatus(undefined)
    }
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

    const session = sessionRef.current
    const model = modelRef.current
    const processor = processorRef.current

    if (!model || !processor) {
      return
    }

    setRemoveBackgroundStatus(REMOVE_BACKGROUND_STATUS.PROCESSING)

    try {
      const stillCurrent = () => session === sessionRef.current
      // Load image
      const img = await RawImage.fromURL(url)
      if (!stillCurrent()) {
        return
      }

      // Pre-process image
      const { pixel_values } = await processor(img)
      if (!stillCurrent()) {
        return
      }

      // Predict alpha matte
      const { output } = await model({ input: pixel_values })
      if (!stillCurrent()) {
        return
      }

      const maskData = (
        await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(
          img.width,
          img.height
        )
      ).data
      if (!stillCurrent()) {
        return
      }

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
    } catch (err) {
      if (session !== sessionRef.current) {
        return
      }
      console.log('err', err)
      setRemoveBackgroundStatus(REMOVE_BACKGROUND_STATUS.LOAD_SUCCESS)
    }
  }

  const clickUploadImage = () => {
    if (showOriginImage) {
      handleUploadImage(url)
      handleCancel()
    } else if (processedImage) {
      cropTransparent(processedImage).then((url) => {
        handleUploadImage(url)
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
          <button className="btn btn-primary btn-sm" onClick={clickUploadImage}>
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
          <Info size={14} className="shrink-0" />
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
