import { FC, useState } from 'react'
import useFileStore from '@/store/files'
import useBoardStore from '@/store/board'
import { ActionMode } from '@/constants'
import { paintBoard } from '@/utils/paintBoard'

import AddFileIcon from '@/components/icons/fileList/addFile.svg?react'
import RemoveFileIcon from '@/components/icons/fileList/removeFile.svg?react'
import ExportFileIcon from '@/components/icons/fileList/exportFile.svg?react'
import ImportFileIcon from '@/components/icons/fileList/importFile.svg?react'
import Toast from '@/components/toast'

interface IProps {
  updateShow: (show: boolean) => void
}

const FileList: FC<IProps> = ({ updateShow }) => {
  const {
    files,
    currentId,
    updateCurrentFile,
    updateTitle,
    addFile,
    saveJSON,
    uploadFile
  } = useFileStore()
  const { updateMode } = useBoardStore()
  const [showUploadFail, updateShowUploadFail] = useState(false) // upload file toast

  // update current file id
  const updateCurrentFileId = (id: string) => {
    updateCurrentFile(id)
    paintBoard.initCanvasStorage()
    updateMode(ActionMode.DRAW)
  }

  // update file
  const handleUploadFile = (file?: File) => {
    uploadFile(file).then((res: boolean) => {
      if (res) {
        paintBoard.initCanvasStorage()
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
    <div className="drawer drawer-end fixed top-0 z-[1]">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-4"
          className="drawer-overlay"
          onClick={() => updateShow(false)}
        ></label>
        <div className="h-screen bg-white px-5 py-7 overflow-hidden max-w-[80%]">
          <div className="font-fredokaOne text-2xl text-center">
            PAINT-BOARD FILES
          </div>
          <div className="bg-[#eef1ff] rounded-2xl mt-5 py-2 w-max max-w-full">
            <div className="flex justify-end items-center px-4 pb-2">
              <AddFileIcon
                className="hover:bg-slate-200 cursor-pointer p-1 rounded-lg w-9 h-9"
                onClick={addFile}
              />
              <label htmlFor="delete-file-modal">
                <RemoveFileIcon className="hover:bg-slate-200 cursor-pointer p-1 rounded-lg w-9 h-9" />
              </label>
              <ExportFileIcon
                className="hover:bg-slate-200 cursor-pointer p-1 rounded-lg w-9 h-9"
                onClick={saveJSON}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <ImportFileIcon className="hover:bg-slate-200 cursor-pointer p-1 rounded-lg w-9 h-9" />
              </label>
              <input
                type="file"
                accept="application/json"
                id="file-upload"
                className="hidden"
                onChange={(e) => handleUploadFile(e.target.files?.[0])}
              />
            </div>
            <ul className="menu text-base-content my-2 mx-4 py-3 px-2 rounded-xl bg-white max-h-[70vh] xs:max-h-[40vh]  overflow-y-auto noScrollbar flex-nowrap max-w-full">
              {files.map((item) => (
                <li
                  key={item.id}
                  className="my-1 block rounded-lg overflow-hidden"
                  onClick={() => updateCurrentFileId(item.id)}
                >
                  <a className={`${item.id === currentId ? 'active' : ''}`}>
                    <input
                      value={item.title}
                      className="px-2 max-w-full"
                      onChange={(e) =>
                        updateTitle(
                          (e.target as HTMLInputElement).value,
                          item.id
                        )
                      }
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {showUploadFail && <Toast message="toast.uploadFileFail" />}
    </div>
  )
}

export default FileList
