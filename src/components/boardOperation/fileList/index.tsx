import { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FileDown, FilePlus, FileUp, Trash2, X } from 'lucide-react'
import useFileStore, { canAddBoard, MAX_BOARD_COUNT } from '@/store/files'
import { idsToDelete } from '@/store/boardRules'
import useBoardStore from '@/store/board'
import useCameraStore from '@/store/camera'
import { ActionMode } from '@/constants'
import { paintBoard } from '@/core/paintBoard'
import {
  cachedThumbnail,
  hydrateThumbnail,
  subscribeThumbnails
} from '@/core/thumbnail/thumbnailCache'
import { needsThumbnail } from '@/core/thumbnail/frame'
import {
  isThumbnailPending,
  scheduleBoardThumbnail
} from '@/core/thumbnail/scheduleBoardThumbnail'
import Toast from '@/components/toast'
import DeleteFileModal from '@/components/boardOperation/deleteFileModal'
import FileCard from './fileCard'
import RenameFileModal from '@/components/boardOperation/renameFileModal'
import DownloadFilesModal from '@/components/boardOperation/downloadFilesModal'

interface IProps {
  updateShow: (show: boolean) => void
}

const FileList: FC<IProps> = ({ updateShow }) => {
  const { t } = useTranslation()
  const { files, currentId, uploadFile, deleteFiles } = useFileStore()
  const updateMode = useBoardStore((state) => state.updateMode)
  const updateOpenCamera = useCameraStore((state) => state.updateOpenCamera)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [renameId, setRenameId] = useState('')
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [downloadIds, setDownloadIds] = useState<string[]>([])
  const [showUploadFail, setShowUploadFail] = useState(false)
  const [showLimit, setShowLimit] = useState(false)
  const [thumbVersion, setThumbVersion] = useState(0)
  const uploadRef = useRef<HTMLInputElement>(null)
  const selectAllRef = useRef<HTMLInputElement>(null)
  const atLimit = !canAddBoard(files.length)
  const allSelected = files.length > 0 && selected.size === files.length
  const deleteTargets = idsToDelete(files, [...selected], currentId)

  useEffect(
    () => subscribeThumbnails(() => setThumbVersion((value) => value + 1)),
    []
  )

  useEffect(() => {
    setSelected((current) => {
      const alive = new Set(files.map((file) => file.id))
      let changed = false
      const next = new Set<string>()
      current.forEach((id) => {
        if (alive.has(id)) {
          next.add(id)
        } else {
          changed = true
        }
      })
      return changed ? next : current
    })
  }, [files])

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selected.size > 0 && selected.size < files.length
    }
  }, [files.length, selected])

  useEffect(() => {
    let cancelled = false
    const syncThumbnails = async () => {
      const list = useFileStore.getState().files
      await Promise.all(list.map((file) => hydrateThumbnail(file.id)))
      if (cancelled) {
        return
      }
      list.forEach((file) => {
        const cached = cachedThumbnail(file.id)
        if (
          needsThumbnail(file.contentRevision, cached ? cached.revision : null)
        ) {
          scheduleBoardThumbnail(file.id)
        }
      })
    }
    void syncThumbnails()
    return () => {
      cancelled = true
    }
  }, [files])

  const showLimitMessage = () => {
    setShowLimit(true)
    window.setTimeout(() => setShowLimit(false), 1800)
  }

  const toggleSelected = (id: string) => {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(files.map((file) => file.id)))
  }

  const openBoard = (id: string) => {
    if (id !== currentId) {
      updateOpenCamera(false)
      void paintBoard.switchFile(id)
      updateMode(ActionMode.DRAW)
    }
    updateShow(false)
  }

  const confirmBatchDelete = () => {
    deleteFiles(deleteTargets)
    setSelected(new Set())
    setConfirmDelete(false)
  }

  const handleUpload = (file?: File) => {
    if (!file) {
      return
    }
    if (atLimit) {
      showLimitMessage()
      return
    }
    void uploadFile(file).then((loaded) => {
      if (loaded) {
        scheduleBoardThumbnail(useFileStore.getState().currentId)
        void paintBoard.loadFile(useFileStore.getState().currentId)
        updateMode(ActionMode.DRAW)
        updateShow(false)
        return
      }
      if (!canAddBoard(useFileStore.getState().files.length)) {
        showLimitMessage()
        return
      }
      setShowUploadFail(true)
      window.setTimeout(() => setShowUploadFail(false), 1500)
    })
  }

  return (
    <>
      <div className="modal modal-open z-[70]">
        <div className="modal-box flex h-[min(88vh,920px)] w-[94vw] max-w-5xl flex-col overflow-hidden p-0">
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="font-fredokaOne text-2xl">
                {t('fileBoard.title')}
              </h3>
              <div className="mt-1 text-sm text-slate-500">
                {t('fileBoard.selected', { count: selected.size })}
                <span className="mx-2">·</span>
                {files.length}/{MAX_BOARD_COUNT}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle"
              aria-label={t('fileBoard.close') || undefined}
              onClick={() => updateShow(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 px-5 py-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                ref={selectAllRef}
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={allSelected}
                onChange={toggleAll}
              />
              {allSelected
                ? t('fileBoard.clearSelection')
                : t('fileBoard.selectAll')}
            </label>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                className="btn btn-ghost btn-sm min-xs:tooltip"
                data-tip={t('fileBoard.create')}
                aria-label={t('fileBoard.create') || undefined}
                onClick={() => {
                  if (atLimit) {
                    showLimitMessage()
                    return
                  }
                  setCreating(true)
                }}
              >
                <FilePlus size={18} color="#66CC8A" />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm min-xs:tooltip"
                data-tip={t('operate.uploadFile')}
                aria-label={t('operate.uploadFile') || undefined}
                onClick={() => {
                  if (atLimit) {
                    showLimitMessage()
                    return
                  }
                  uploadRef.current?.click()
                }}
              >
                <FileUp size={18} color="#66CC8A" />
              </button>
              {selected.size > 0 && (
                <>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm min-xs:tooltip"
                    data-tip={t('fileBoard.batchDelete')}
                    aria-label={t('fileBoard.batchDelete') || undefined}
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Trash2 size={18} color="#66CC8A" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm min-xs:tooltip"
                    data-tip={t('fileBoard.batchDownload')}
                    aria-label={t('fileBoard.batchDownload') || undefined}
                    onClick={() => setDownloadIds([...selected])}
                  >
                    <FileDown size={18} color="#66CC8A" />
                  </button>
                </>
              )}
              <input
                ref={uploadRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => {
                  handleUpload(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </div>
          </div>
          {showLimit && (
            <div className="mx-5 mb-3 shrink-0 rounded-lg bg-warning/20 px-3 py-2 text-sm">
              {t('fileBoard.limit', { count: MAX_BOARD_COUNT })}
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-1">
            <div className="grid content-start items-start gap-4 [grid-auto-rows:220px] [grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr))]">
              {files.map((file) => {
                void thumbVersion
                return (
                  <FileCard
                    key={file.id}
                    file={file}
                    selected={selected.has(file.id)}
                    current={file.id === currentId}
                    thumbnailUrl={cachedThumbnail(file.id)?.url}
                    pending={isThumbnailPending(file.id, file.contentRevision)}
                    onOpen={openBoard}
                    onToggle={toggleSelected}
                    onRename={setRenameId}
                  />
                )
              })}
            </div>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={() => updateShow(false)}>
            close
          </button>
        </form>
      </div>
      {showUploadFail && <Toast message="tip.uploadFileFail" type="error" />}
      {confirmDelete && (
        <DeleteFileModal
          count={deleteTargets.length}
          keepCurrent={deleteTargets.length < selected.size}
          onConfirm={confirmBatchDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
      {creating && (
        <RenameFileModal mode="create" onClose={() => setCreating(false)} />
      )}
      {renameId && (
        <RenameFileModal
          mode="edit"
          fileId={renameId}
          onClose={() => setRenameId('')}
        />
      )}
      {downloadIds.length > 0 && (
        <DownloadFilesModal
          ids={downloadIds}
          onClose={() => setDownloadIds([])}
        />
      )}
    </>
  )
}

export default FileList
