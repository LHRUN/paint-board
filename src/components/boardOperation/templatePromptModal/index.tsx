import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { paintBoard } from '@/core/paintBoard'
import { type BoardTemplate } from '@/core/template/template'
import { isUntouchedDefaultBoard } from '@/core/template/templatePrompt'
import useFileStore from '@/store/files'
import RenameFileModal from '@/components/boardOperation/renameFileModal'

interface IProps {
  templates: BoardTemplate[]
  onClose: () => void
}

const TemplateCard: FC<{
  template: BoardTemplate
  selected: boolean
  onSelect: () => void
}> = ({ template, selected, onSelect }) => {
  const { t } = useTranslation()
  const [failed, setFailed] = useState(false)

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`flex h-full flex-col overflow-hidden rounded-2xl border bg-white text-left ${
        selected ? 'border-primary ring-2 ring-primary' : 'border-slate-200'
      }`}
      onClick={onSelect}
    >
      <span className="flex h-36 items-center justify-center overflow-hidden bg-slate-100">
        {template.thumbnailUrl && !failed ? (
          <img
            src={template.thumbnailUrl}
            alt=""
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="px-3 text-sm text-slate-400">
            {t('fileBoard.noThumbnail')}
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col p-3">
        <span className="font-bold">{template.name}</span>
      </span>
    </button>
  )
}

const TemplatePromptModal: FC<IProps> = ({ templates, onClose }) => {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState('')
  const [naming, setNaming] = useState(false)
  const selected = templates.find((item) => item.templateId === selectedId)

  useEffect(() => {
    if (naming) {
      return
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [naming, onClose])

  return (
    <>
      <div className="modal modal-open z-[85]">
        <div className="modal-box flex max-h-[min(88vh,760px)] w-[94vw] max-w-4xl flex-col overflow-hidden p-0">
          <div className="shrink-0 border-b border-slate-100 px-5 py-4">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="font-fredokaOne text-2xl">
                {t('templatePrompt.title')}
              </h3>
              <p className="text-sm text-slate-500">
                {t('templatePrompt.tagline')}
              </p>
            </div>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-sm text-slate-500">
              <a
                href="https://github.com/LHRUN/paint-board"
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-2"
              >
                github.com/LHRUN/paint-board
              </a>
              <span>{t('templatePrompt.star')}</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {t('templatePrompt.description')}
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="grid items-stretch gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))]">
              {templates.map((template) => (
                <TemplateCard
                  key={template.templateId}
                  template={template}
                  selected={template.templateId === selectedId}
                  onSelect={() => setSelectedId(template.templateId)}
                />
              ))}
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
            {!selected && (
              <p className="mr-auto text-sm text-slate-500">
                {t('templatePrompt.selectFirst')}
              </p>
            )}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onClose}
            >
              {t('templatePrompt.close')}
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!selected}
              onClick={() => setNaming(true)}
            >
              {t('templatePrompt.create')}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button" onClick={onClose}>
            close
          </button>
        </form>
      </div>
      {naming && selected && (
        <RenameFileModal
          mode="create"
          preset={selected}
          ignoreTitleOf={
            useFileStore
              .getState()
              .files.find((file) => isUntouchedDefaultBoard(file))?.id
          }
          onClose={() => setNaming(false)}
          onCreated={(id) => {
            const untouched = useFileStore
              .getState()
              .files.find((file) => isUntouchedDefaultBoard(file))
            if (untouched && untouched.id !== id) {
              useFileStore.getState().deleteFiles([untouched.id])
            }
            if (useFileStore.getState().currentId !== id) {
              void paintBoard.switchFile(id)
            }
            onClose()
          }}
        />
      )}
    </>
  )
}

export default TemplatePromptModal
