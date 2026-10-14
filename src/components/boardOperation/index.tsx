import { ChangeEvent, useState, useCallback, useEffect, useRef } from 'react'
import useBoardStore from '@/store/board'
import useFileStore, {
  DEFAULT_BACKGROUND_SORT,
  useCurrentFile
} from '@/store/files'
import useCameraStore from '@/store/camera'
import { useTranslation } from 'react-i18next'
import { ActionMode } from '@/constants'
import { paintBoard } from '@/core/paintBoard'
import { isMobile as isMobileFn } from '@/utils'
import { ImageElement } from '@/core/element/image'
import { captureCameraFrame } from '@/core/camera/renderer'
import {
  exportCanvasImage,
  ExportImageResult,
  ExportScope
} from '@/core/export/exportCanvasImage'
import { exportErrorMessageKey } from '@/core/export/exportError'

import {
  Undo2,
  Redo2,
  Type,
  Copy,
  Trash2,
  ImageUp,
  BrushCleaning,
  Expand,
  Shrink,
  X,
  Menu,
  BookText,
  Layers
} from 'lucide-react'

import FileList from './fileList'
import ObjectList from './objectList'
import DownloadImage from './downloadImage'
import ExportImageMenu from './exportImageMenu'
import UploadImage from '@/components/uploadImage/lazy'
import Toast from '@/components/toast'

const isMobile = isMobileFn()

const BoardOperation = () => {
  const { t } = useTranslation()
  const { mode } = useBoardStore()
  const { cameraOpacity, openCamera } = useCameraStore()
  const currentFile = useCurrentFile()
  const saveJSON = useFileStore((state) => state.saveJSON)
  const [showFile, updateShowFile] = useState(false) // show file list draw
  const [showObjectList, updateShowObjectList] = useState(false)
  const [showOperation, setShowOperation] = useState(true) // mobile: show all operation
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [exportImage, setExportImage] = useState<ExportImageResult | null>(null)
  const [showDownloadModal, setShowDownloadModal] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [hasSelection, setHasSelection] = useState(false)
  const exportingRef = useRef(false)

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

  useEffect(() => {
    const refreshSelection = () => {
      setHasSelection((paintBoard.canvas?.getActiveObjects().length ?? 0) > 0)
    }
    paintBoard.addHookFn(refreshSelection)
    refreshSelection()
    return () => {
      paintBoard.removeHookFn(refreshSelection)
    }
  }, [])

  // save as image
  const saveImage = async (scope: ExportScope) => {
    const canvas = paintBoard.canvas
    if (!canvas || exportingRef.current) {
      return
    }
    exportingRef.current = true
    const colorIndex = currentFile?.currentBackgroundColor ?? -1
    const colorList = currentFile?.backgroundColorList
    try {
      const result = await exportCanvasImage(canvas, scope, {
        sort: currentFile?.backgroundSort || DEFAULT_BACKGROUND_SORT,
        color:
          colorList?.length && colorIndex >= 0
            ? colorList[colorIndex] || null
            : null,
        imageUrl: currentFile?.backgroundImage || '',
        imageOpacity: currentFile?.backgroundImageOpacity ?? 1,
        cameraFrame: openCamera ? captureCameraFrame() : null,
        cameraOpacity
      })
      setExportImage(result)
      setShowDownloadModal(true)
      setExportError(null)
    } catch (error) {
      console.error('Failed to export canvas', error)
      setExportError(exportErrorMessageKey(error))
    } finally {
      exportingRef.current = false
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
              <ExportImageMenu
                hasSelection={hasSelection}
                onExport={saveImage}
                onExportBoard={saveJSON}
              />
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
              <div
                onClick={() => updateShowObjectList((open) => !open)}
                className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
                data-tip={t('operate.objectList')}
              >
                <Layers strokeWidth={2} color="#66CC8A" />
              </div>
              <div
                className="min-xs:tooltip cursor-pointer py-1.5 pl-2 pr-3 rounded-r-full hover:bg-slate-200 xs:pr-2 xs:rounded-r-none xs:rounded-b-full"
                data-tip={t('operate.fileList')}
                onClick={() => updateShowFile(true)}
              >
                <BookText strokeWidth={2} color="#66CC8A" />
              </div>
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
      {exportError && <Toast message={exportError} type="error" />}
      {showObjectList && <ObjectList updateShow={updateShowObjectList} />}
      {showFile && <FileList updateShow={updateShowFile} />}
      {showDownloadModal && exportImage && (
        <DownloadImage
          url={exportImage.url}
          background={exportImage.background}
          backgroundFrame={exportImage.backgroundFrame}
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
