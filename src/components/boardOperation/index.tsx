import { ChangeEvent, useState } from 'react'
import useBoardStore from '@/store/board'
import { useTranslation } from 'react-i18next'
import { ActionMode } from '@/constants'
import { paintBoard } from '@/utils/paintBoard'
import { ImageElement } from '@/utils/element/image'

import UndoIcon from '@/components/icons/boardOperation/undo.svg?react'
import RedoIcon from '@/components/icons/boardOperation/redo.svg?react'
import SaveIcon from '@/components/icons/boardOperation/save.svg?react'
import CleanIcon from '@/components/icons/boardOperation/clean.svg?react'
import UploadIcon from '@/components/icons/boardOperation/upload.svg?react'
import CopyIcon from '@/components/icons/boardOperation/copy.svg?react'
import TextIcon from '@/components/icons/boardOperation/text.svg?react'
import DeleteIcon from '@/components/icons/boardOperation/delete.svg?react'
import FileListIcon from '@/components/icons/boardOperation/fileList.svg?react'
import CloseIcon from '@/components/icons/close.svg?react'
import MenuIcon from '@/components/icons/menu.svg?react'
import FileList from './fileList'

const BoardOperation = () => {
  const { t } = useTranslation()
  const { mode } = useBoardStore()
  const [showFile, updateShowFile] = useState(false) // show file list draw
  const [showOperation, setShowOperation] = useState(true) // mobile: show all operation

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
    paintBoard.textElement?.loadText()
  }

  // upload image file
  const uploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = (fEvent) => {
      const data = fEvent.target?.result
      if (data) {
        if (data && typeof data === 'string') {
          const image = new ImageElement()
          image.addImage(data)
        }
      }
      e.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  // save as image
  const saveImage = () => {
    paintBoard.saveImage()
  }

  return (
    <>
      <div className="fixed bottom-5 left-2/4 -translate-x-2/4 flex items-center bg-[#eef1ff] rounded-full xs:flex-col xs:right-5 xs:left-auto xs:translate-x-0 xs:justify-normal xs:max-h-[70vh] xs:overflow-y-auto xs:noScrollbar">
        {showOperation && (
          <>
            <div
              onClick={undo}
              className="min-xs:tooltip cursor-pointer py-1.5 pl-3 pr-2 rounded-l-full hover:bg-slate-200 xs:pl-2 xs:rounded-l-none xs:rounded-t-full"
              data-tip={t('operate.undo')}
            >
              <UndoIcon className="transform scale-x-[-1] scale-y-[1]" />
            </div>
            <div
              onClick={redo}
              className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
              data-tip={t('operate.redo')}
            >
              <RedoIcon />
            </div>
            {[ActionMode.SELECT, ActionMode.Board].includes(mode) && (
              <>
                <div
                  onClick={copyObject}
                  className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
                  data-tip={t('operate.copy')}
                >
                  <CopyIcon />
                </div>
                <div
                  onClick={deleteObject}
                  className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
                  data-tip={t('operate.delete')}
                >
                  <DeleteIcon />
                </div>
              </>
            )}
            <div
              data-tip={t('operate.text')}
              className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
              onClick={inputText}
            >
              <TextIcon />
            </div>
            <div
              className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
              data-tip={t('operate.image')}
            >
              <label htmlFor="image-upload" className="cursor-pointer">
                <UploadIcon />
              </label>
              <input
                type="file"
                id="image-upload"
                className="hidden"
                onChange={uploadImage}
              />
            </div>
            <label
              htmlFor="clean-modal"
              className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
              data-tip={t('operate.clean')}
            >
              <CleanIcon />
            </label>
            <div
              onClick={saveImage}
              className="min-xs:tooltip cursor-pointer py-1.5 px-2 hover:bg-slate-200"
              data-tip={t('operate.save')}
            >
              <SaveIcon />
            </div>
            <label
              htmlFor="my-drawer-4"
              className="min-xs:tooltip cursor-pointer py-1.5 pl-2 pr-3 rounded-r-full hover:bg-slate-200 xs:pr-2 xs:rounded-r-none xs:rounded-b-full"
              data-tip={t('operate.fileList')}
              onClick={() => updateShowFile(true)}
            >
              <FileListIcon />
            </label>
          </>
        )}
        <label className="btn btn-circle swap swap-rotate w-7 h-7 min-h-0 my-1.5 mx-2 min-xs:hidden">
          <input type="checkbox" onChange={() => setShowOperation((v) => !v)} />
          <CloseIcon className="swap-on fill-current" />
          <MenuIcon className="swap-off fill-current" />
        </label>
      </div>
      {showFile && <FileList updateShow={updateShowFile} />}
    </>
  )
}

export default BoardOperation
