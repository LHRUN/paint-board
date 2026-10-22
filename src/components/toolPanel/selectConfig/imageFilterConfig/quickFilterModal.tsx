import { FC, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react'
import Sortable from 'sortablejs'
import { useTranslation } from 'react-i18next'
import {
  FILTER_LIBRARY,
  FilterId,
  moveQuickFilter,
  QUICK_FILTER_LIMIT
} from '@/core/element/image/filterCatalog'
import useImageFilterStore from '@/store/imageFilter'

interface IProps {
  open: boolean
  onClose: () => void
}

const toggleChecked = (checked: FilterId[], id: FilterId) => {
  return checked.includes(id)
    ? checked.filter((item) => item !== id)
    : [...checked, id]
}

const QuickFilterModal: FC<IProps> = ({ open, onClose }) => {
  const { t } = useTranslation()
  const quickFilters = useImageFilterStore((state) => state.quickFilters)
  const setQuickFilters = useImageFilterStore((state) => state.setQuickFilters)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const selectedRef = useRef<HTMLDivElement>(null)
  const [leftChecked, setLeftChecked] = useState<FilterId[]>([])
  const [rightChecked, setRightChecked] = useState<FilterId[]>([])
  const [limited, setLimited] = useState(false)
  const available = FILTER_LIBRARY.filter((id) => !quickFilters.includes(id))
  const allTargetChecked =
    quickFilters.length > 0 &&
    quickFilters.every((id) => rightChecked.includes(id))

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
    if (open) {
      return
    }
    setLeftChecked([])
    setRightChecked([])
    setLimited(false)
  }, [open])

  useEffect(() => {
    if (!open || !selectedRef.current) {
      return
    }
    const sortable = new Sortable(selectedRef.current, {
      animation: 150,
      handle: '.transfer-handle',
      onEnd: (event) => {
        const { oldIndex, newIndex } = event
        if (oldIndex === undefined || newIndex === undefined) {
          return
        }
        const current = useImageFilterStore.getState().quickFilters
        setQuickFilters(moveQuickFilter(current, oldIndex, newIndex))
      }
    })
    return () => {
      sortable.destroy()
    }
  }, [open, quickFilters, setQuickFilters])

  const moveRight = () => {
    const adding = available.filter((id) => leftChecked.includes(id))
    const room = QUICK_FILTER_LIMIT - quickFilters.length
    const accepted = adding.slice(0, Math.max(room, 0))
    setLimited(accepted.length < adding.length)
    if (accepted.length) {
      setQuickFilters([...quickFilters, ...accepted])
    }
    setLeftChecked((current) => current.filter((id) => !accepted.includes(id)))
  }

  const moveLeft = () => {
    setQuickFilters(quickFilters.filter((id) => !rightChecked.includes(id)))
    setRightChecked([])
    setLimited(false)
  }

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box w-[40rem] max-w-[94vw]">
        <form method="dialog">
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            aria-label={t('cancel') as string}
          >
            ✕
          </button>
        </form>
        <h3 className="pr-8 font-fredokaOne text-lg font-bold">
          {t('imageFilter.manageTitle')}
        </h3>
        <div className="mt-4 flex items-stretch gap-2">
          <section className="min-w-0 flex-1 overflow-hidden rounded-lg border border-base-300">
            <div className="border-b border-base-300 px-3 py-2 text-center text-sm font-fredokaOne">
              {t('imageFilter.source')}
            </div>
            <div className="h-72 overflow-auto px-2 py-1">
              {available.map((id) => (
                <label
                  key={id}
                  className="flex cursor-pointer items-center gap-2 px-1 py-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs checkbox-primary"
                    checked={leftChecked.includes(id)}
                    onChange={() =>
                      setLeftChecked((current) => toggleChecked(current, id))
                    }
                  />
                  <span className="truncate">{t(`filters.${id}`)}</span>
                </label>
              ))}
            </div>
          </section>
          <div className="flex flex-col items-center justify-center gap-2">
            <button
              type="button"
              className={`btn btn-sm btn-square ${
                leftChecked.length ? 'btn-primary' : 'btn-disabled'
              }`}
              aria-label={t('imageFilter.add') as string}
              disabled={!leftChecked.length}
              onClick={moveRight}
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className={`btn btn-sm btn-square ${
                rightChecked.length ? 'btn-primary' : 'btn-disabled'
              }`}
              aria-label={t('imageFilter.remove') as string}
              disabled={!rightChecked.length}
              onClick={moveLeft}
            >
              <ChevronLeft size={16} />
            </button>
          </div>
          <section className="min-w-0 flex-1 overflow-hidden rounded-lg border border-base-300">
            <div className="flex items-center gap-2 border-b border-base-300 px-3 py-2 text-sm">
              <input
                type="checkbox"
                className="checkbox checkbox-xs checkbox-primary"
                checked={allTargetChecked}
                disabled={!quickFilters.length}
                onChange={() =>
                  setRightChecked(allTargetChecked ? [] : [...quickFilters])
                }
              />
              <span>
                {quickFilters.length} {t('imageFilter.items')}
              </span>
              <span className="ml-auto font-fredokaOne">
                {t('imageFilter.target')}
              </span>
            </div>
            <div ref={selectedRef} className="h-72 overflow-auto px-2 py-1">
              {quickFilters.length === 0 && (
                <p className="px-1 py-2 text-xs opacity-60">
                  {t('imageFilter.empty')}
                </p>
              )}
              {quickFilters.map((id) => (
                <div key={id} className="flex items-center gap-2 px-1 py-1.5">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-primary"
                      checked={rightChecked.includes(id)}
                      onChange={() =>
                        setRightChecked((current) => toggleChecked(current, id))
                      }
                    />
                    <span className="truncate">{t(`filters.${id}`)}</span>
                  </label>
                  <GripVertical
                    size={14}
                    className="transfer-handle shrink-0 cursor-grab opacity-60"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
        {limited && (
          <p className="mt-2 text-sm text-error">{t('imageFilter.limit')}</p>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  )
}

export default QuickFilterModal
