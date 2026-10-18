import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil } from 'lucide-react'
import { IFile } from '@/store/files'

const finePointerHidden =
  '[@media(hover:hover)_and_(pointer:fine)]:pointer-events-none [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-hover:pointer-events-auto [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-focus-within:pointer-events-auto [@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100'

interface IProps {
  file: IFile
  selected: boolean
  current: boolean
  thumbnailUrl?: string
  pending: boolean
  onOpen: (id: string) => void
  onToggle: (id: string) => void
  onRename: (id: string) => void
}

const FileCard: FC<IProps> = ({
  file,
  selected,
  current,
  thumbnailUrl,
  pending,
  onOpen,
  onToggle,
  onRename
}) => {
  const { t } = useTranslation()

  return (
    <div
      data-board-id={file.id}
      className={`group relative flex h-[220px] min-h-[220px] w-full shrink-0 flex-col overflow-hidden rounded-2xl border bg-white ${
        current || selected
          ? 'border-primary ring-2 ring-primary'
          : 'border-slate-200'
      }`}
    >
      <button
        type="button"
        className="flex h-full min-h-[220px] w-full flex-col text-left"
        onClick={() => onOpen(file.id)}
      >
        <div
          className={`flex h-40 min-h-[10rem] w-full shrink-0 items-center justify-center bg-slate-100 ${
            pending && !thumbnailUrl ? 'animate-pulse' : ''
          }`}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="px-3 text-center text-sm text-slate-400">
              {t('fileBoard.noThumbnail')}
            </span>
          )}
        </div>
        <div className="flex h-14 shrink-0 items-center gap-2 px-3">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {file.title}
          </span>
          {current && (
            <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
              {t('fileBoard.current')}
            </span>
          )}
        </div>
      </button>
      <label
        className={`absolute left-2 top-2 z-10 flex h-7 w-7 cursor-pointer items-center justify-center rounded-md bg-white/90 ${
          selected ? '' : finePointerHidden
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <input
          type="checkbox"
          className="checkbox checkbox-primary checkbox-sm"
          checked={selected}
          aria-label={t('fileBoard.select', { title: file.title }) || undefined}
          onChange={() => onToggle(file.id)}
          onClick={(event) => event.stopPropagation()}
        />
      </label>
      <button
        type="button"
        className={`absolute right-2 top-2 z-10 rounded-md bg-white/90 p-1 text-primary hover:bg-slate-100 ${finePointerHidden}`}
        aria-label={t('fileBoard.rename') || undefined}
        onClick={(event) => {
          event.stopPropagation()
          onRename(file.id)
        }}
      >
        <Pencil size={16} />
      </button>
    </div>
  )
}

export default FileCard
