import { FC, useState, useRef, useEffect } from 'react'
import Sortable from 'sortablejs'
import useFileStore from '@/store/files'
import useBoardStore from '@/store/board'
import { useTranslation } from 'react-i18next'
import { ActionMode } from '@/constants'
import { paintBoard } from '@/core/paintBoard'

import { FilePlus, FileUp, FileDown } from 'lucide-react'
import DeleteFileModal from '@/components/boardOperation/deleteFileModal'
import Toast from '@/components/toast'
import FileItem from '@/components/boardOperation/fileList/fileItem'

interface IProps {
  updateShow: (show: boolean) => void
}

const FileList: FC<IProps> = ({ updateShow }) => {
  const { t } = useTranslation()
  const { files, addFile, saveJSON, uploadFile, orderFileList } = useFileStore()
  const { updateMode } = useBoardStore()
  const [showUploadFail, updateShowUploadFail] = useState(false) // upload file toast
  const [deleteFileId, setDeleteFileId] = useState('')
  const sortableRef = useRef<HTMLUListElement>(null)

  // Initialize sortablejs
  useEffect(() => {
    if (sortableRef.current) {
      const sortable = new Sortable(sortableRef.current, {
        animation: 150,
        ghostClass: 'opacity-50',
        chosenClass: 'scale-105',
        dragClass: 'rotate-2',
        handle: '.drag-file-list-handle',
        onEnd: (evt) => {
          if (evt.oldIndex !== undefined && evt.newIndex !== undefined) {
            orderFileList(evt.oldIndex, evt.newIndex)
          }
        }
      })

      return () => {
        sortable.destroy()
      }
    }
  }, [orderFileList])

  // update file
  const handleUploadFile = (file?: File) => {
    uploadFile(file).then((res: boolean) => {
      if (res) {
        paintBoard.loadFile(useFileStore.getState().currentId)
        updateMode(ActionMode.DRAW)
      } else {
        updateShowUploadFail(true)
        setTimeout(() => {
          updateShowUploadFail(false)
        }, 1500)
      }
    })
  }

  return (
    <div className="drawer drawer-end fixed top-0 z-[5]">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-4"
          className="drawer-overlay"
          onClick={() => updateShow(false)}
        ></label>
        <div className="h-screen bg-white px-5 py-7 overflow-hidden max-w-[80%] w-96">
          <div className="font-fredokaOne text-2xl text-center">
            PAINT-BOARD FILES
          </div>
          <div className="bg-[#eef1ff] rounded-2xl mt-5 py-2 w-ful max-w-full">
            <div className="flex justify-end items-center px-4 pb-2">
              <div className="min-xs:tooltip" data-tip={t('operate.addFile')}>
                <FilePlus
                  color="#66CC8A"
                  className="hover:bg-slate-200 cursor-pointer p-1 rounded-lg w-8 h-8"
                  onClick={addFile}
                />
              </div>
              <div className="min-xs:tooltip" data-tip={t('operate.saveFile')}>
                <FileDown
                  color="#66CC8A"
                  className="hover:bg-slate-200 cursor-pointer p-1 rounded-lg w-8 h-8"
                  onClick={saveJSON}
                />
              </div>
              <label
                htmlFor="file-upload"
                className="min-xs:tooltip cursor-pointer"
                data-tip={t('operate.uploadFile')}
              >
                <FileUp
                  color="#66CC8A"
                  className="hover:bg-slate-200 cursor-pointer p-1 rounded-lg w-8 h-8"
                />
              </label>
              <input
                type="file"
                accept="application/json"
                id="file-upload"
                className="hidden"
                onChange={(e) => handleUploadFile(e.target.files?.[0])}
              />
            </div>
            <ul
              ref={sortableRef}
              className="text-base-content my-2 mx-4 py-3 px-2 rounded-xl bg-white max-h-[70vh] xs:max-h-[40vh]  overflow-y-auto noScrollbar flex-nowrap max-w-full"
            >
              {files.map((file) => (
                <FileItem
                  key={file.id}
                  file={file}
                  handleDelete={setDeleteFileId}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
      {showUploadFail && <Toast message="tip.uploadFileFail" type="error" />}
      <DeleteFileModal fileId={deleteFileId} />
    </div>
  )
}

export default FileList
