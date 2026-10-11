import { FC, useState } from 'react'
import useFileStore, { IFile } from '@/store/files'
import useBoardStore from '@/store/board'
import { ActionMode } from '@/constants'
import { paintBoard } from '@/core/paintBoard'

import { Pencil, Trash2, GripVertical } from 'lucide-react'
import useCameraStore from '@/store/camera'

interface IProps {
  file: IFile
  handleDelete: (id: string) => void
}

const FileItem: FC<IProps> = ({ file, handleDelete }) => {
  const { files, currentId, updateFileTitle } = useFileStore()
  const { updateMode } = useBoardStore()
  const { updateOpenCamera } = useCameraStore()
  const [showNameInput, setShowNameInput] = useState(false)

  // update current file id
  const updateCurrentFileId = (id: string) => {
    if (id === currentId) {
      return
    }
    updateOpenCamera(false)
    paintBoard.switchFile(id)
    updateMode(ActionMode.DRAW)
  }

  return (
    <li
      data-id={file.id}
      className={`flex items-center justify-between flex-row my-1 px-2 rounded-lg overflow-hidden group cursor-pointer h-12 transition-all duration-200 ${
        file.id === currentId ? 'bg-primary' : 'hover:bg-slate-100'
      }`}
      onClick={() => updateCurrentFileId(file.id)}
    >
      {showNameInput ? (
        <input
          value={file.title}
          className="input input-bordered input-sm w-full"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) =>
            updateFileTitle((e.target as HTMLInputElement).value, file.id)
          }
          onBlur={() => setShowNameInput(false)}
        />
      ) : (
        <span
          className={`w-full truncate ${
            file.id === currentId ? 'text-white font-semibold' : ''
          }`}
        >
          {file.title}
        </span>
      )}
      <span className="ml-5 flex items-center gap-x-2 shrink-0">
        <Pencil
          color={file.id === currentId ? '#fff' : '#66CC8A'}
          className={`hidden group-hover:block ${
            file.id === currentId ? 'xs:block' : ''
          }`}
          size={16}
          onClick={(e) => {
            e.stopPropagation()
            setShowNameInput(true)
          }}
        />
        {files.length > 0 && (
          <label
            htmlFor="delete-file-modal"
            className={`cursor-pointer hidden group-hover:block ${
              file.id === currentId ? 'xs:block' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation()
              handleDelete(file.id)
            }}
          >
            <Trash2
              color={file.id === currentId ? '#fff' : '#66CC8A'}
              size={16}
            />
          </label>
        )}
        <GripVertical
          className={`drag-file-list-handle hidden group-hover:block ${
            file.id === currentId ? 'xs:block' : ''
          }`}
          color={file.id === currentId ? '#fff' : '#66CC8A'}
          size={16}
          onClick={(e) => {
            e.stopPropagation()
          }}
        />
      </span>
    </li>
  )
}

export default FileItem
