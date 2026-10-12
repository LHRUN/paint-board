import { ChangeEvent, useState, useCallback, useEffect } from 'react'
import useBoardStore from '@/store/board'
import { DEFAULT_BACKGROUND_SORT, useCurrentFile } from '@/store/files'
import useCameraStore from '@/store/camera'
import { useTranslation } from 'react-i18next'
import { ActionMode } from '@/constants'
import { paintBoard } from '@/core/paintBoard'
import { isMobile as isMobileFn } from '@/utils'
import { ImageElement } from '@/core/element/image'
import { captureCameraFrame } from '@/core/camera/renderer'

import { drawBackground } from '../background/backgroundColor/utils'
import { drawBackgroundImage } from '../background/backgroundImage/utils'

import {
  Undo2,
  Redo2,
  Type,
  Copy,
  Trash2,
  ImageUp,
  BrushCleaning,
  Save,
  Expand,
  Shrink,
  X,
  Menu,
  BookText
} from 'lucide-react'

import FileList from './fileList'
import DownloadImage from './downloadImage'
import UploadImage from '@/components/uploadImage'

const isMobile = isMobileFn()

const BoardOperation = () => {
  const { t } = useTranslation()
  const { mode } = useBoardStore()
  const { cameraOpacity, openCamera } = useCameraStore()
  const currentFile = useCurrentFile()
  const [showFile, updateShowFile] = useState(false) // show file list draw
  const [showOperation, setShowOperation] = useState(true) // mobile: show all operation
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [downloadImageURL, setDownloadImageURL] = useState('')
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  const [uploadImageURL, setUploadImageURL] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // toggle fullscreen mode
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error('fullscreen error:', err)
    }
  }, [])

  /**
   * listen fullscreen event
   * 1. browser behavior
   * 2. toggleFullscreen trigger
   */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // copy activity object
  const copyObject = () => {
    paintBoard.copyObject()
  }

  // delete activity object
  const deleteObject = () => {
    paintBoard.deleteObject()
  }

  // click undo
  const undo = () => {
    paintBoard.history?.undo()
  }

  // click redo
  const redo = () => {
    paintBoard.history?.redo()
  }

  // load IText object
  const inputText = () => {
    paintBoard.textElement?.loadText({})
  }

  // upload image file
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
    if (imageUrl) {
      const image = new ImageElement()
      image.addImage(imageUrl)
    }
  }

  // save as image
  const saveImage = async () => {
    if (paintBoard.canvas) {
      // Get the original canvas dimensions
      const originalCanvas = paintBoard.canvas.getElement()
      const width = originalCanvas.width
      const height = originalCanvas.height

      // Create off-screen canvas
      const offscreenCanvas = document.createElement('canvas')
      offscreenCanvas.width = width
      offscreenCanvas.height = height
      const ctx = offscreenCanvas.getContext('2d')

      if (!ctx) {
        return
      }

      const backgroundSort =
        currentFile?.backgroundSort || DEFAULT_BACKGROUND_SORT
      const reverseBackgroundSort = [...backgroundSort].reverse()
      for (let i = 0; i < reverseBackgroundSort.length; i++) {
        const type = reverseBackgroundSort[i]
        switch (type) {
          case 'image':
            if (currentFile?.backgroundImage) {
              await drawBackgroundImage(
                ctx,
                currentFile.backgroundImage,
                currentFile.backgroundImageOpacity,
                width,
                height
              )
            }
            break
          case 'color':
            if (
              currentFile?.backgroundColorList?.length &&
              currentFile?.currentBackgroundColor !== -1
            ) {
              drawBackground(
                ctx,
                currentFile.backgroundColorList[
                  currentFile.currentBackgroundColor
                ],
                width,
                height
              )
            }
            break
          case 'camera': {
            const cameraFrame = openCamera ? captureCameraFrame() : null
            if (cameraFrame) {
              await drawBackgroundImage(
                ctx,
                cameraFrame,
                cameraOpacity,
                width,
                height
              )
            }
            break
          }
          default:
            break
        }
      }

      // Draw the original canvas content
      ctx.drawImage(originalCanvas, 0, 0)

      // Get the merged URL
      const url = offscreenCanvas.toDataURL()
      setDownloadImageURL(url)
      setShowDownloadModal(true)
    }
  }

  return (
    <>
      <div className="fixed bottom-5 left-2/4 -translate-x-2/4 xs:right-5 xs:left-auto xs:translate-x-0">
        <div className="flex items-center bg-[#eef1ff] rounded-full xs:flex-col xs:justify-normal xs:max-h-[70vh] xs:overflow-y-auto xs:noScrollbar">
          {showOperation && (
            <>
              <div
                onClick={undo}
                className="min-xs:tooltip cursor-pointer py-1.5 pl-3 pr-2 rounded-l-full hover:bg-slate-200 xs:pl-2 xs:rounded-l-none xs:rounded-t-full"
                data-tip={t('operate.undo')}
              >
                <Undo2 strokeWidth={2} color="#66CC8A" />
              </div>
              <div
                onClick={redo}
                className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
                data-tip={t('operate.redo')}
              >
                <Redo2 strokeWidth={2} color="#66CC8A" />
              </div>
              {[ActionMode.SELECT, ActionMode.Board].includes(mode) && (
                <>
                  <div
                    onClick={copyObject}
                    className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
                    data-tip={t('operate.copy')}
                  >
                    <Copy strokeWidth={2} color="#66CC8A" />
                  </div>
                  <div
                    onClick={deleteObject}
                    className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
                    data-tip={t('operate.delete')}
                  >
                    <Trash2 strokeWidth={2} color="#66CC8A" />
                  </div>
                </>
              )}
              <div
                data-tip={t('operate.text')}
                className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
                onClick={inputText}
              >
                <Type strokeWidth={2} color="#66CC8A" />
              </div>
              <div
                className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
                data-tip={t('operate.image')}
              >
                <label htmlFor="image-upload" className="cursor-pointer">
                  <ImageUp strokeWidth={2} color="#66CC8A" />
                </label>
                <input
                  type="file"
                  id="image-upload"
                  accept=".jpeg, .jpg, .png"
                  className="hidden"
                  onChange={uploadImageFile}
                />
              </div>
              <label
                htmlFor="clean-modal"
                className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
                data-tip={t('operate.clean')}
              >
                <BrushCleaning strokeWidth={2} color="#66CC8A" />
              </label>
              <div
                onClick={saveImage}
                className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
                data-tip={t('operate.save')}
              >
                <Save strokeWidth={2} color="#66CC8A" />
              </div>
              {!isMobile && (
                <div
                  onClick={toggleFullscreen}
                  className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
                  data-tip={t(
                    isFullscreen
                      ? 'operate.exitFullscreen'
                      : 'operate.fullscreen'
                  )}
                >
                  {isFullscreen ? (
                    <Shrink strokeWidth={2} color="#66CC8A" />
                  ) : (
                    <Expand strokeWidth={2} color="#66CC8A" />
                  )}
                </div>
              )}
              <label
                htmlFor="my-drawer-4"
                className="min-xs:tooltip cursor-pointer py-1.5 pl-2 pr-3 rounded-r-full hover:bg-slate-200 xs:pr-2 xs:rounded-r-none xs:rounded-b-full"
                data-tip={t('operate.fileList')}
                onClick={() => updateShowFile(true)}
              >
                <BookText strokeWidth={2} color="#66CC8A" />
              </label>
            </>
          )}
          <label className="btn btn-neutral btn-circle swap swap-rotate w-7 h-7 min-h-0 my-1.5 mx-2 min-xs:hidden">
            <input
              type="checkbox"
              onChange={() => setShowOperation((v) => !v)}
            />
            <X strokeWidth={2.5} color="#fff" size={20} className="swap-on" />
            <Menu
              strokeWidth={2.5}
              color="#fff"
              size={20}
              className="swap-off"
            />
          </label>
        </div>
      </div>
      {showFile && <FileList updateShow={updateShowFile} />}
      {showDownloadModal && downloadImageURL && (
        <DownloadImage
          url={downloadImageURL}
          showModal={showDownloadModal}
          setShowModal={setShowDownloadModal}
        />
      )}
      <UploadImage
        url={uploadImageURL}
        showModal={showUploadModal}
        setShowModal={setShowUploadModal}
        handleUploadImage={handleUploadImage}
      />
    </>
  )
}

export default BoardOperation
