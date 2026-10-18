import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useFileStore, { canAddBoard, MAX_BOARD_COUNT } from '@/store/files'
import useBoardStore from '@/store/board'
import { boardTitleIssue, type BoardTitleIssue } from '@/store/boardRules'
import {
  boardFromTemplate,
  loadTemplates,
  type BoardTemplate
} from '@/core/template/template'

interface IProps {
  mode: 'create' | 'edit'
  fileId?: string
  preset?: BoardTemplate
  ignoreTitleOf?: string
  onCreated?: (id: string) => void
  onClose: () => void
}

const TemplateChoice: FC<{
  label: string
  thumbnailUrl?: string
  selected: boolean
  onSelect: () => void
}> = ({ label, thumbnailUrl, selected, onSelect }) => {
  const [failed, setFailed] = useState(false)
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left ${
        selected ? 'border-primary ring-2 ring-primary' : 'border-slate-200'
      }`}
      onClick={onSelect}
    >
      <span className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-slate-100">
        {thumbnailUrl && !failed ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setFailed(true)}
          />
        ) : null}
      </span>
      <span className="min-w-0 truncate text-sm font-medium">{label}</span>
    </button>
  )
}

const RenameFileModal: FC<IProps> = ({
  mode,
  fileId,
  preset,
  ignoreTitleOf,
  onCreated,
  onClose
}) => {
  const { t } = useTranslation()
  const language = useBoardStore((state) => state.language)
  const file = useFileStore((state) =>
    state.files.find((item) => item.id === fileId)
  )
  const updateFileTitle = useFileStore((state) => state.updateFileTitle)
  const addFile = useFileStore((state) => state.addFile)
  const addBoard = useFileStore((state) => state.addBoard)
  const [title, setTitle] = useState(mode === 'edit' ? file?.title ?? '' : '')
  const [issue, setIssue] = useState<BoardTitleIssue | null>(null)
  const [limit, setLimit] = useState(false)
  const [templates, setTemplates] = useState<BoardTemplate[]>([])
  const [templateId, setTemplateId] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== 'create' || preset) {
      return
    }
    let cancelled = false
    void loadTemplates(language).then((list) => {
      if (!cancelled) {
        setTemplates(list)
      }
    })
    return () => {
      cancelled = true
    }
  }, [language, mode, preset])

  useEffect(() => {
    if (
      templateId &&
      !templates.some((item) => item.templateId === templateId)
    ) {
      setTemplateId(null)
    }
  }, [templateId, templates])

  const confirm = () => {
    const files = useFileStore.getState().files
    const current =
      mode === 'edit' ? files.find((item) => item.id === fileId) : undefined
    const ignored = ignoreTitleOf
      ? files.find((item) => item.id === ignoreTitleOf)
      : undefined
    const nextIssue = boardTitleIssue(
      title,
      files.map((item) => item.title),
      current?.title ?? ignored?.title
    )
    if (nextIssue) {
      setIssue(nextIssue)
      setLimit(false)
      return
    }
    const name = title.trim()
    if (mode === 'create') {
      const source =
        preset ?? templates.find((item) => item.templateId === templateId)
      if (preset || templateId) {
        if (!source) {
          return
        }
        const board = boardFromTemplate(source, name)
        const added = addBoard(board, { ignoreTitleOf })
        if (!added) {
          if (!canAddBoard(useFileStore.getState().files.length)) {
            setLimit(true)
          } else {
            setIssue('duplicate')
          }
          return
        }
        onCreated?.(board.id)
      } else if (!addFile(name)) {
        if (!canAddBoard(useFileStore.getState().files.length)) {
          setLimit(true)
        } else {
          setIssue('duplicate')
        }
        return
      }
    } else if (fileId) {
      updateFileTitle(name, fileId)
    }
    onClose()
  }

  if (mode === 'edit' && !file) {
    return null
  }

  return (
    <div className="modal modal-open z-[90]">
      <div className="modal-box max-h-[calc(100vh-4rem)] max-w-md overflow-y-auto">
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
            setLimit(false)
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
        {limit && (
          <p className="mt-2 text-sm text-error">
            {t('fileBoard.limit', { count: MAX_BOARD_COUNT })}
          </p>
        )}
        {mode === 'create' && !preset && (
          <div className="mt-4 flex max-h-52 flex-col gap-2 overflow-y-auto p-1">
            <TemplateChoice
              label={t('renameFileModal.blank')}
              selected={templateId === null}
              onSelect={() => setTemplateId(null)}
            />
            {templates.map((item) => (
              <TemplateChoice
                key={item.templateId}
                label={item.name}
                thumbnailUrl={item.thumbnailUrl}
                selected={templateId === item.templateId}
                onSelect={() => setTemplateId(item.templateId)}
              />
            ))}
          </div>
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
