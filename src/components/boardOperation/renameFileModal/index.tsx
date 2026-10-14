import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useFileStore from '@/store/files'
import { boardTitleIssue, type BoardTitleIssue } from '@/store/boardRules'

interface IProps {
  mode: 'create' | 'edit'
  fileId?: string
  onClose: () => void
}

const RenameFileModal: FC<IProps> = ({ mode, fileId, onClose }) => {
  const { t } = useTranslation()
  const file = useFileStore((state) =>
    state.files.find((item) => item.id === fileId)
  )
  const updateFileTitle = useFileStore((state) => state.updateFileTitle)
  const addFile = useFileStore((state) => state.addFile)
  const [title, setTitle] = useState(mode === 'edit' ? file?.title ?? '' : '')
  const [issue, setIssue] = useState<BoardTitleIssue | null>(null)

  const confirm = () => {
    const files = useFileStore.getState().files
    const current =
      mode === 'edit' ? files.find((item) => item.id === fileId) : undefined
    const nextIssue = boardTitleIssue(
      title,
      files.map((item) => item.title),
      current?.title
    )
    if (nextIssue) {
      setIssue(nextIssue)
      return
    }
    const name = title.trim()
    if (mode === 'create') {
      addFile(name)
    } else if (fileId) {
      updateFileTitle(name, fileId)
    }
    onClose()
  }

  if (mode === 'edit' && !file) {
    return null
  }

  return (
    <div className="modal modal-open z-[80]">
      <div className="modal-box max-w-md">
        <h3 className="text-lg font-bold">
          {mode === 'create'
            ? t('renameFileModal.createTitle')
            : t('renameFileModal.title')}
        </h3>
        <input
          autoFocus
          value={title}
          placeholder={t('renameFileModal.placeholder') || undefined}
          className="input input-bordered mt-5 w-full"
          onChange={(event) => {
            setTitle(event.target.value)
            setIssue(null)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              confirm()
            }
            if (event.key === 'Escape') {
              onClose()
            }
          }}
        />
        {issue && (
          <p className="mt-2 text-sm text-error">
            {t(
              issue === 'empty'
                ? 'renameFileModal.empty'
                : 'renameFileModal.duplicate'
            )}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onClose}
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={confirm}
          >
            {t('confirm')}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </div>
  )
}

export default RenameFileModal
