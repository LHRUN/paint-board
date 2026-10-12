import { useState, useRef, useEffect, useMemo, MouseEvent, FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SamModel,
  AutoProcessor,
  RawImage,
  PreTrainedModel,
  Processor,
  Tensor,
  SamImageProcessorResult
} from '@huggingface/transformers'
import { ImageElement } from '@/core/element/image'
import { cropTransparent } from '@/utils/cropTransparent'
import { releaseModel, whenModelReleased } from './releaseModel'

import { Info, LoaderCircle } from 'lucide-react'
import Mask from '@/components/mask'
import PositiveIcon from '@/components/icons/boardOperation/image-segmentation-positive.svg?react'
import NegativeIcon from '@/components/icons/boardOperation/image-segmentation-negative.svg?react'

interface MarkPoint {
  position: number[]
  label: number
}

interface IProps {
  url: string
  showModal: boolean
  setShowModal: (show: boolean) => void
  cancelUploadImageModal: () => void
}

const SEGMENTATION_STATUS = {
  LOADING: 0,
  NO_SUPPORT_WEBGPU: 1,
  LOAD_ERROR: 2,
  LOAD_SUCCESS: 3,
  PROCESSING: 4,
  PROCESSING_SUCCESS: 5
}

type SegmentationStatusType =
  (typeof SEGMENTATION_STATUS)[keyof typeof SEGMENTATION_STATUS]

// Survives closing the dialog so a new open waits for the cancelled load to release.
let segmentationLoadTask: Promise<void> = Promise.resolve()

const ImageSegmentation: FC<IProps> = ({
  url,
  showModal,
  setShowModal,
  cancelUploadImageModal
}) => {
  const { t } = useTranslation()

  const [markPoints, setMarkPoints] = useState<MarkPoint[]>([])
  const [segmentationStatus, setSegmentationStatus] =
    useState<SegmentationStatusType>()
  const [pointStatus, setPointStatus] = useState<boolean>(true)

  const maskCanvasRef = useRef<HTMLCanvasElement>(null)
  const modelRef = useRef<PreTrainedModel>()
  const processorRef = useRef<Processor>()
  const imageInputRef = useRef<RawImage>()
  const imageProcessed = useRef<SamImageProcessorResult>()
  const imageEmbeddings = useRef<Tensor>()

  const segmentationTip = useMemo(() => {
    switch (segmentationStatus) {
      case SEGMENTATION_STATUS.LOADING:
        return 'uploadImage.imageSegmentationLoading'
      case SEGMENTATION_STATUS.NO_SUPPORT_WEBGPU:
        return 'uploadImage.imageSegmentationGpuTip'
      case SEGMENTATION_STATUS.LOAD_ERROR:
        return 'uploadImage.imageSegmentationFailed'
      case SEGMENTATION_STATUS.LOAD_SUCCESS:
        return 'uploadImage.imageSegmentationSuccess'
      case SEGMENTATION_STATUS.PROCESSING:
        return 'uploadImage.imageSegmentationProcessing'
      case SEGMENTATION_STATUS.PROCESSING_SUCCESS:
        return 'uploadImage.imageSegmentationProcessed'
      default:
        return ''
    }
  }, [segmentationStatus])

  useEffect(() => {
    if (!showModal) {
      return
    }
    let cancelled = false
    setSegmentationStatus(SEGMENTATION_STATUS.LOADING)
    const previousLoad = segmentationLoadTask
    const load = (async () => {
      let model: PreTrainedModel | undefined
      try {
        await previousLoad
        await whenModelReleased()
        if (cancelled || modelRef.current || processorRef.current) {
          return
        }
        if (!navigator?.gpu) {
          setSegmentationStatus(SEGMENTATION_STATUS.NO_SUPPORT_WEBGPU)
          return
        }
        const model_id = 'Xenova/slimsam-77-uniform'
        model = await SamModel.from_pretrained(model_id, {
          dtype: 'fp16', // or "fp32"
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

        setSegmentationStatus(SEGMENTATION_STATUS.LOAD_SUCCESS)
      } catch (err) {
        await releaseModel(model)
        if (!cancelled) {
          console.log('err', err)
          setSegmentationStatus(SEGMENTATION_STATUS.LOAD_ERROR)
        }
      }
    })()
    segmentationLoadTask = load.then(
      () => undefined,
      () => undefined
    )
    return () => {
      cancelled = true
      const currentModel = modelRef.current
      modelRef.current = undefined
      processorRef.current = undefined
      imageInputRef.current = undefined
      imageProcessed.current = undefined
      imageEmbeddings.current = undefined
      void releaseModel(currentModel)
      setSegmentationStatus(undefined)
    }
  }, [showModal])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const model = modelRef.current
      const processor = processorRef.current
      try {
        if (
          cancelled ||
          !showModal ||
          !model ||
          !processor ||
          !url ||
          segmentationStatus === SEGMENTATION_STATUS.PROCESSING
        ) {
          return
        }
        setSegmentationStatus(SEGMENTATION_STATUS.PROCESSING)
        clearPoints()

        imageInputRef.current = await RawImage.fromURL(url)
        if (cancelled) {
          return
        }
        imageProcessed.current = await processor(imageInputRef.current)
        if (cancelled) {
          return
        }
        imageEmbeddings.current = await (model as any).get_image_embeddings(
          imageProcessed.current
        )
        if (cancelled) {
          return
        }

        setSegmentationStatus(SEGMENTATION_STATUS.PROCESSING_SUCCESS)
      } catch (err) {
        if (!cancelled) {
          console.log('err', err)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [url, modelRef.current, processorRef.current, showModal])

  function updateMaskOverlay(mask: RawImage, scores: Float32Array) {
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas) {
      return
    }
    const maskContext = maskCanvas.getContext('2d') as CanvasRenderingContext2D

    // Update canvas dimensions (if different)
    if (maskCanvas.width !== mask.width || maskCanvas.height !== mask.height) {
      maskCanvas.width = mask.width
      maskCanvas.height = mask.height
    }

    // Allocate buffer for pixel data
    const imageData = maskContext.createImageData(
      maskCanvas.width,
      maskCanvas.height
    )

    // Select best mask
    const numMasks = scores.length // 3
    let bestIndex = 0
    for (let i = 1; i < numMasks; ++i) {
      if (scores[i] > scores[bestIndex]) {
        bestIndex = i
      }
    }

    // Fill mask with colour
    const pixelData = imageData.data
    for (let i = 0; i < pixelData.length; ++i) {
      if (mask.data[numMasks * i + bestIndex] === 1) {
        const offset = 4 * i
        pixelData[offset] = 101 // r
        pixelData[offset + 1] = 204 // g
        pixelData[offset + 2] = 138 // b
        pixelData[offset + 3] = 255 // a
      }
    }

    // Draw image data to context
    maskContext.putImageData(imageData, 0, 0)
  }

  const decode = async (markPoints: MarkPoint[]) => {
    const model = modelRef.current
    const processor = processorRef.current
    const embeddings = imageEmbeddings.current
    const processed = imageProcessed.current
    if (!model || !embeddings || !processor || !processed) {
      return
    }

    if (!markPoints.length && maskCanvasRef.current) {
      const maskContext = maskCanvasRef.current.getContext(
        '2d'
      ) as CanvasRenderingContext2D
      maskContext.clearRect(
        0,
        0,
        maskCanvasRef.current.width,
        maskCanvasRef.current.height
      )
      return
    }

    const stillCurrent = () => modelRef.current === model
    try {
      // Prepare inputs for decoding
      const reshaped = processed.reshaped_input_sizes[0]
      const points = markPoints
        .map((x) => [x.position[0] * reshaped[1], x.position[1] * reshaped[0]])
        .flat(Infinity)
      const labels = markPoints.map((x) => BigInt(x.label)).flat(Infinity)

      const num_points = markPoints.length
      const input_points = new Tensor('float32', points, [1, 1, num_points, 2])
      const input_labels = new Tensor('int64', labels, [1, 1, num_points])

      // Generate the mask
      const { pred_masks, iou_scores } = await model({
        ...embeddings,
        input_points,
        input_labels
      })
      if (!stillCurrent()) {
        return
      }

      // Post-process the mask
      const masks = await (processor as any).post_process_masks(
        pred_masks,
        processed.original_sizes,
        processed.reshaped_input_sizes
      )
      if (!stillCurrent()) {
        return
      }

      updateMaskOverlay(RawImage.fromTensor(masks[0][0]), iou_scores.data)
    } catch (err) {
      if (!stillCurrent()) {
        return
      }
      console.log('err', err)
    }
  }

  const clamp = (x: number, min = 0, max = 1) => {
    return Math.max(Math.min(x, max), min)
  }

  const clickImage = (e: MouseEvent) => {
    if (segmentationStatus !== SEGMENTATION_STATUS.PROCESSING_SUCCESS) {
      return
    }

    const { clientX, clientY, currentTarget } = e
    const { left, top } = currentTarget.getBoundingClientRect()

    const x = clamp(
      (clientX - left + currentTarget.scrollLeft) / currentTarget.scrollWidth
    )
    const y = clamp(
      (clientY - top + currentTarget.scrollTop) / currentTarget.scrollHeight
    )

    const existingPointIndex = markPoints.findIndex(
      (point) =>
        Math.abs(point.position[0] - x) < 0.01 &&
        Math.abs(point.position[1] - y) < 0.01 &&
        point.label === (pointStatus ? 1 : 0)
    )

    const newPoints = [...markPoints]
    if (existingPointIndex !== -1) {
      newPoints.splice(existingPointIndex, 1)
    } else {
      newPoints.push({
        position: [x, y],
        label: pointStatus ? 1 : 0
      })
    }

    setMarkPoints(newPoints)
    decode(newPoints)
  }

  const clearPoints = () => {
    setMarkPoints([])
    decode([])
  }

  const handleCancel = () => {
    setShowModal(false)
    clearPoints()
  }

  const uploadImage = async () => {
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas || !imageInputRef.current) {
      return
    }

    const image = new ImageElement()

    if (!markPoints.length) {
      image.addImage(url)
    } else {
      const maskContext = maskCanvas.getContext(
        '2d'
      ) as CanvasRenderingContext2D

      const [w, h] = [maskCanvas.width, maskCanvas.height]

      // Get the mask pixel data (and use this as a buffer)
      const maskImageData = maskContext.getImageData(0, 0, w, h)

      // Create a new canvas to hold the cut-out
      const cutCanvas = new OffscreenCanvas(w, h)
      const cutContext = cutCanvas.getContext(
        '2d'
      ) as OffscreenCanvasRenderingContext2D

      // Copy the image pixel data to the cut canvas
      const maskPixelData = maskImageData.data
      const imagePixelData = imageInputRef.current.data

      for (let i = 0; i < w * h; ++i) {
        const sourceOffset = 3 * i // RGB
        const targetOffset = 4 * i // RGBA

        if (maskPixelData[targetOffset + 3] > 0) {
          // Only copy opaque pixels
          for (let j = 0; j < 3; ++j) {
            maskPixelData[targetOffset + j] = imagePixelData[sourceOffset + j]
          }
        }
      }
      cutContext.putImageData(maskImageData, 0, 0)

      const url = URL.createObjectURL(await cutCanvas.convertToBlob())
      cropTransparent(url).then((url) => {
        image.addImage(url)
      })
    }

    handleCancel()
    cancelUploadImageModal()
  }

  return (
    <Mask
      show={showModal}
      clickMask={() => {
        handleCancel()
      }}
    >
      <div className="p-6 bg-[#eef1ff] card shadow-xl overflow-auto">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 max-w-[60vw]">
          <button
            className="btn btn-ghost btn-outline btn-sm"
            onClick={handleCancel}
          >
            {t('cancel')}
          </button>
          <button
            className={`btn btn-primary btn-sm ${
              segmentationStatus !== SEGMENTATION_STATUS.PROCESSING_SUCCESS
                ? 'btn-disabled'
                : ''
            }`}
            onClick={uploadImage}
          >
            {t('uploadImage.upload')}
          </button>
          <button className="btn btn-primary btn-sm" onClick={clearPoints}>
            {t('uploadImage.clearPoints')}
          </button>

          <div
            className={`flex items-center text-sm h-8 px-3 text-primary-content gap-x-2 rounded-lg transition-all font-semibold bg-[#65CC8A]`}
          >
            <span
              className={`cursor-pointer ${
                pointStatus ? 'text-primary-content' : 'text-[#00000020]'
              }`}
              onClick={() => setPointStatus(true)}
            >
              {t('uploadImage.positivePoint')}
            </span>

            <label className="swap swap-rotate">
              <input readOnly type="checkbox" checked={pointStatus} />
              <PositiveIcon className="swap-on w-6 h-6 fill-[#FFD401]" />
              <NegativeIcon className="swap-off fill-[#F44237] w-6 h-6" />
            </label>

            <span
              className={`cursor-pointer ${
                pointStatus ? 'text-[#00000020]' : 'text-primary-content'
              }`}
              onClick={() => setPointStatus(false)}
            >
              {t('uploadImage.negativePoint')}
            </span>
          </div>
        </div>
        <div className="text-xs text-base-content mt-2 max-w-[60vw] flex">
          <Info size={14} className="shrink-0" />
          <span className="ml-1">{t(segmentationTip)}</span>
        </div>
        <div
          id="test-image-container"
          className={`relative mt-4 border border-base-content border-dashed rounded-lg h-[60vh] max-h-[500px] w-fit max-w-[60vw] overflow-y-hidden ${
            segmentationStatus === SEGMENTATION_STATUS.PROCESSING_SUCCESS
              ? 'overflow-x-auto'
              : 'overflow-x-hidden'
          }`}
          onClick={clickImage}
        >
          {segmentationStatus !== SEGMENTATION_STATUS.PROCESSING_SUCCESS && (
            <div className="absolute z-[3] top-0 left-0 w-full h-full bg-slate-400 bg-opacity-70 flex justify-center items-center">
              <LoaderCircle size={32} className="animate-spin" />
            </div>
          )}
          <div className="h-full w-max relative overflow-hidden">
            <img className="h-full max-w-none" src={url} />

            <canvas
              ref={maskCanvasRef}
              className="absolute top-0 left-0 h-full w-full z-[1] opacity-60"
            ></canvas>

            {markPoints.map((point, index) => {
              switch (point.label) {
                case 1:
                  return (
                    <PositiveIcon
                      key={index}
                      className="w-[24px] h-[24px] absolute z-[2] -ml-[13px] -mt-[14px] fill-[#FFD401]"
                      style={{
                        top: `${point.position[1] * 100}%`,
                        left: `${point.position[0] * 100}%`
                      }}
                    />
                  )
                case 0:
                  return (
                    <NegativeIcon
                      key={index}
                      className="w-[24px] h-[24px] absolute z-[2] -ml-[13px] -mt-[14px] fill-[#F44237]"
                      style={{
                        top: `${point.position[1] * 100}%`,
                        left: `${point.position[0] * 100}%`
                      }}
                    />
                  )
                default:
                  return null
              }
            })}
          </div>
        </div>
      </div>
    </Mask>
  )
}

export default ImageSegmentation
