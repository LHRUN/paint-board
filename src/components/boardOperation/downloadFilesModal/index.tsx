import { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { paintBoard } from '@/core/paintBoard'
import {
  boardArchiveOutcome,
  triggerBlobDownload,
  uniqueBoardFileName,
  type BoardArchiveOutcome
} from '@/core/export/boardArchive'
import { buildStoredZip } from '@/core/export/storedZip'
import useFileStore from '@/store/files'

interface IProps {
  ids: string[]
  onClose: () => void
}

type ItemStatus = 'waiting' | 'writing' | 'done' | 'failed'

interface DownloadItem {
  id: string
  title: string
  status: ItemStatus
  message: string
}

const pause = () => new Promise((resolve) => window.setTimeout(resolve, 16))

const DownloadFilesModal: FC<IProps> = ({ ids, onClose }) => {
  const { t } = useTranslation()
  const mounted = useRef(true)
  const started = useRef(false)
  const [items, setItems] = useState<DownloadItem[]>(() => {
    const files = useFileStore.getState().files
    return ids.map((id) => ({
      id,
      title: files.find((file) => file.id === id)?.title || id,
      status: 'waiting',
      message: ''
    }))
  })
  const [finishedCount, setFinishedCount] = useState(0)
  const [activeIndex, setActiveIndex] = useState(0)
  const [phase, setPhase] = useState<'files' | 'zip' | 'download' | 'done'>(
    'files'
  )
  const [outcome, setOutcome] = useState<BoardArchiveOutcome | null>(null)
  const [zipError, setZipError] = useState('')

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (started.current) {
      return
    }
    started.current = true

    const updateItem = (id: string, patch: Partial<DownloadItem>) => {
      if (!mounted.current) {
        return
      }
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, ...patch } : item))
      )
    }

    const run = async () => {
      if (ids.includes(useFileStore.getState().currentId)) {
        paintBoard.flushCurrentFile()
      }

      const entries: { name: string; data: Uint8Array }[] = []
      const usedNames = new Set<string>()
      let generated = 0

      for (let index = 0; index < ids.length; index += 1) {
        const id = ids[index]
        if (mounted.current) {
          setActiveIndex(index)
          setPhase('files')
        }
        updateItem(id, { status: 'writing', message: '' })
        await pause()

        const file = useFileStore
          .getState()
          .files.find((item) => item.id === id)
        if (!file) {
          updateItem(id, {
            status: 'failed',
            message: t('downloadFiles.missing') || ''
          })
        } else {
          try {
            const json = JSON.stringify(file)
            entries.push({
              name: uniqueBoardFileName(file.title, file.id, usedNames),
              data: new TextEncoder().encode(json)
            })
            generated += 1
            updateItem(id, {
              status: 'done',
              title: file.title,
              message: t('downloadFiles.done') || ''
            })
          } catch (error) {
            const reason =
              error instanceof Error && error.message
                ? error.message
                : t('downloadFiles.stringifyFailed') || ''
            updateItem(id, { status: 'failed', message: reason })
          }
        }
        if (mounted.current) {
          setFinishedCount(index + 1)
        }
        await pause()
      }

      if (generated === 0) {
        if (mounted.current) {
          setPhase('done')
          setOutcome('all-failed')
        }
        return
      }

      if (mounted.current) {
        setPhase('zip')
      }
      await pause()

      try {
        const archive = buildStoredZip(entries)
        const blob = new Blob([archive], { type: 'application/zip' })
        if (mounted.current) {
          setPhase('download')
        }
        triggerBlobDownload(blob, 'paint-board.zip')
        if (mounted.current) {
          setPhase('done')
          setOutcome(
            boardArchiveOutcome({
              total: ids.length,
              generated,
              zipFailed: false
            })
          )
        }
      } catch (error) {
        if (!mounted.current) {
          return
        }
        setZipError(
          error instanceof Error && error.message
            ? error.message
            : t('downloadFiles.zipFailed') || ''
        )
        setPhase('done')
        setOutcome(
          boardArchiveOutcome({
            total: ids.length,
            generated,
            zipFailed: true
          })
        )
      }
    }

    void run()
  }, [ids, t])

  const active = items[activeIndex]
  const outcomeText = () => {
    if (outcome === 'all-started') {
      return t('downloadFiles.allStarted')
    }
    if (outcome === 'partial') {
      return t('downloadFiles.partial')
    }
    if (outcome === 'all-failed') {
      return t('downloadFiles.allFailed')
    }
    if (outcome === 'zip-failed') {
      return zipError
        ? `${t('downloadFiles.zipFailed')}: ${zipError}`
        : t('downloadFiles.zipFailed')
    }
    return ''
  }

  const phaseText = () => {
    if (phase === 'zip') {
      return t('downloadFiles.zipping')
    }
    if (
      phase === 'download' ||
      outcome === 'all-started' ||
      outcome === 'partial'
    ) {
      return t('downloadFiles.downloadStarted')
    }
    if (active) {
      return `${active.title} · ${t(`downloadFiles.${active.status}`)}`
    }
    return ''
  }

  return (
    <div className="modal modal-open z-[80]">
      <div className="modal-box max-w-lg">
        <h3 className="text-lg font-bold">{t('downloadFiles.title')}</h3>
        <div className="mt-4 text-sm">
          {t('downloadFiles.overall', {
            current: finishedCount,
            total: ids.length
          })}
        </div>
        <progress
          className="progress progress-primary mt-2 w-full"
          value={finishedCount}
          max={Math.max(ids.length, 1)}
        />
        <div className="mt-2 text-sm text-slate-500">{phaseText()}</div>
        <ul className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate">{item.title}</span>
              <span
                className={`shrink-0 text-right ${
                  item.status === 'failed' ? 'text-error' : 'text-slate-500'
                }`}
              >
                {t(`downloadFiles.${item.status}`)}
                {item.status === 'failed' && item.message
                  ? ` · ${item.message}`
                  : ''}
              </span>
            </li>
          ))}
        </ul>
        {outcome && (
          <div
            className={`alert mt-4 text-sm ${
              outcome === 'all-started'
                ? 'alert-success'
                : outcome === 'partial'
                ? 'alert-warning'
                : 'alert-error'
            }`}
          >
            <span>{outcomeText()}</span>
          </div>
        )}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={onClose}
          >
            {t('downloadFiles.close')}
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

export default DownloadFilesModal
