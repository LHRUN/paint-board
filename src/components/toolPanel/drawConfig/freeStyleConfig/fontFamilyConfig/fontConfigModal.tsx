import { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CircleQuestionMark, Trash2 } from 'lucide-react'
import {
  AddFontGate,
  canAddCustomFont,
  DEFAULT_FONTS,
  MAX_CUSTOM_FONTS,
  normalizeFontName,
  cssFontFamily,
  sameFont
} from '@/core/font/fontConfig'
import { FontLoadError, loadGoogleFont } from '@/core/font/googleFont'
import useFontStore from '@/store/font'

interface IProps {
  open: boolean
  onClose: () => void
}

const gateMessage: Record<Exclude<AddFontGate, 'ok'>, string> = {
  invalid: 'fontConfig.invalid',
  duplicate: 'fontConfig.duplicate',
  limit: 'fontConfig.limit'
}

const loadMessage = (error: unknown) => {
  if (error instanceof FontLoadError) {
    if (error.reason === 'not-found') {
      return 'fontConfig.notFound'
    }
    if (error.reason === 'network') {
      return 'fontConfig.network'
    }
    if (error.reason === 'invalid') {
      return 'fontConfig.invalid'
    }
  }
  return 'fontConfig.loadFailed'
}

const FontConfigModal: FC<IProps> = ({ open, onClose }) => {
  const { t } = useTranslation()
  const { customFonts, quickFonts, deleteCustomFont, assignQuickFont } =
    useFontStore()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [draft, setDraft] = useState('')
  const [messageKey, setMessageKey] = useState('')
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }
    if (open && !dialog.open) {
      dialog.showModal()
    }
    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setDraft('')
      setMessageKey('')
      setChecking(false)
    }
  }, [open])

  const addFont = async () => {
    const name = normalizeFontName(draft)
    const gate = canAddCustomFont(name, customFonts)
    if (gate !== 'ok') {
      setMessageKey(gateMessage[gate])
      return
    }
    setChecking(true)
    setMessageKey('fontConfig.loading')
    try {
      await loadGoogleFont(name)
      const added = useFontStore.getState().addCustomFont(name)
      if (!added) {
        setMessageKey('fontConfig.duplicate')
        return
      }
      setDraft('')
      setMessageKey('')
    } catch (error) {
      setMessageKey(loadMessage(error))
    } finally {
      setChecking(false)
    }
  }

  const pinFont = (font: string) => {
    assignQuickFont(font)
  }

  const fonts = [
    ...DEFAULT_FONTS.map((font) => ({ font, isDefault: true })),
    ...customFonts.map((font) => ({ font, isDefault: false }))
  ]
  const reachedLimit = customFonts.length >= MAX_CUSTOM_FONTS

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box w-[28rem] max-w-[92vw] max-h-[85vh] overflow-auto">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            aria-label={t('cancel') as string}
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg font-fredokaOne pr-8">
          {t('fontConfig.title')}
        </h3>
        <div className="mt-3 text-sm font-fredokaOne flex items-center">
          {t('fontConfig.customCount')} {customFonts.length}/{MAX_CUSTOM_FONTS}
          <a
            className="ml-1 tooltip cursor-pointer before:w-32"
            data-tip={t('fontConfig.sourceTip')}
            href="https://fonts.google.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <CircleQuestionMark size={16} />
          </a>
        </div>
        <div className="join mt-2 w-full">
          <input
            type="text"
            value={draft}
            autoComplete="off"
            disabled={checking || reachedLimit}
            placeholder={t('fontConfig.placeholder') as string}
            className="input input-bordered input-sm join-item flex-1 outline-none"
            onChange={(event) => {
              setDraft(event.target.value)
              setMessageKey('')
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void addFont()
              }
            }}
          />
          <button
            type="button"
            className="btn btn-primary btn-sm join-item"
            disabled={checking || reachedLimit}
            onClick={() => {
              void addFont()
            }}
          >
            {t('fontConfig.add')}
          </button>
        </div>
        {messageKey && (
          <p
            className={`mt-2 text-sm ${
              messageKey === 'fontConfig.loading' ? '' : 'text-error'
            }`}
          >
            {t(messageKey)}
          </p>
        )}
        <div className="mt-3 flex flex-col gap-2">
          {fonts.map(({ font, isDefault }) => {
            const isQuick = quickFonts.some((item) => sameFont(item, font))
            return (
              <div key={font} className="flex items-center gap-2">
                <div className="min-w-0 flex-1 flex items-center gap-2">
                  <div
                    className="truncate text-sm"
                    style={{ fontFamily: cssFontFamily(font) }}
                  >
                    {font}
                  </div>
                  {isDefault && (
                    <span className="badge badge-ghost badge-sm shrink-0">
                      {t('fontConfig.defaultBadge')}
                    </span>
                  )}
                </div>
                {isQuick ? (
                  <span className="text-xs shrink-0">
                    {t('fontConfig.alreadyQuick')}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs shrink-0"
                    onClick={() => pinFont(font)}
                  >
                    {t('fontConfig.setQuick')}
                  </button>
                )}
                {!isDefault && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error shrink-0"
                    aria-label={t('fontConfig.delete') as string}
                    onClick={() => deleteCustomFont(font)}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}

export default FontConfigModal
