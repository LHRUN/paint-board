import { ChangeEvent, useState } from 'react'
import useFileStore, { useCurrentFile } from '@/store/files'
import { paintBoard } from '@/core/paintBoard'
import { limitImageDataUrl } from '@/core/utils/imageLimit'
import {
  canWriteFile,
  shouldCommitDeferredCanvasWrite
} from '@/core/session/canvasWrite'

import { ImageUp, GripVertical } from 'lucide-react'
import ClearIcon from '@/components/icons/clear.svg?react'
import UploadSuccessIcon from '@/components/icons/uploadSuccess.svg?react'
import UploadImage from '@/components/uploadImage/lazy'

const BackgroundConfig = () => {
  const { updateBackgroundImage, updateBackgroundImageOpacity } = useFileStore()
  const currentFile = useCurrentFile()
  if (!currentFile) {
    return null
  }

  const [uploadImageURL, setUploadImageURL] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // upload background image file
  const uploadImageFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (fEvent) => {
      const data = fEvent.target?.result
      if (data) {
        if (data && typeof data === 'string') {
          setUploadImageURL(data)
          setShowUploadModal(true)
        }
      }
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  const handleUploadImage = (imageUrl: string) => {
    if (!imageUrl) {
      return
    }
    const canvas = paintBoard.canvas
    const fileId = paintBoard.canvasFileId
    const generation = paintBoard.getLoadGeneration()
    if (
      !shouldCommitDeferredCanvasWrite({
        canvasMatches: !!canvas,
        generationMatches: true,
        canWrite: canWriteFile(fileId, fileId),
        historyApplying: false
      })
    ) {
      return
    }
    limitImageDataUrl(imageUrl).then((limited) => {
      if (
        !canWriteFile(paintBoard.canvasFileId, fileId) ||
        !shouldCommitDeferredCanvasWrite({
          canvasMatches: !!canvas && paintBoard.canvas === canvas,
          generationMatches: paintBoard.getLoadGeneration() === generation,
          canWrite: true,
          historyApplying: false
        })
      ) {
        return
      }
      updateBackgroundImage(limited, fileId)
    })
  }

  return (
    <div className="flex items-center w-full group">
      <label
        htmlFor="background-image-upload"
        className="shrink-0 cursor-pointer rounded relative hover:bg-slate-200"
      >
        {currentFile.backgroundImage ? (
          <>
            <ClearIcon
              onClick={() => updateBackgroundImage('')}
              className="absolute top-[-6px] right-[-6px] rounded-full w-3 h-3 cursor-pointer"
            />
            <UploadSuccessIcon className="w-5 h-5 object-contain" />
          </>
        ) : (
          <ImageUp color="#66CC8A" size={20} />
        )}
      </label>
      <input
        type="file"
        id="background-image-upload"
        accept=".jpeg, .jpg, .png"
        className="hidden"
        onChange={uploadImageFile}
      />
      <div className="divider divider-horizontal mx-1"></div>
      <input
        className="range range-primary range-xs w-32"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={String(currentFile.backgroundImageOpacity)}
        onChange={(e) => {
          updateBackgroundImageOpacity(Number(e.target.value))
        }}
      />
      <GripVertical
        size={20}
        color="#66CC8A"
        className="drag-background-config-handle cursor-pointer ml-auto hidden xs:inline-block group-hover:inline-block"
      />

      <UploadImage
        url={uploadImageURL}
        showModal={showUploadModal}
        setShowModal={setShowUploadModal}
        handleUploadImage={handleUploadImage}
      />
    </div>
  )
}

export default BackgroundConfig
