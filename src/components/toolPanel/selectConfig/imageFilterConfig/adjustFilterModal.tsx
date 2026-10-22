import { FC, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { paintBoard } from '@/core/paintBoard'
import {
  applyFilterSnapshots,
  commitFilterSnapshots,
  getActiveImage,
  originalImageSrc,
  readFilterSnapshots,
  renderFilteredPreview
} from '@/core/element/image/filterActions'
import {
  BLEND_MODES,
  cloneSnapshots,
  convoluteChoice,
  ConvoluteChoice,
  FilterGroupId,
  FilterSnapshot,
  findFilter,
  GRAYSCALE_MODES,
  presetSnapshot,
  snapshotGamma,
  snapshotNumber,
  updateTypedFilter
} from '@/core/element/image/filterCatalog'

interface IProps {
  open: boolean
  onClose: () => void
}

const TONE_FILTERS = [
  'Sepia',
  'BlackWhite',
  'Vintage',
  'Brownie',
  'Kodachrome',
  'Polaroid',
  'Technicolor'
] as const

const CATEGORIES: FilterGroupId[] = ['adjust', 'effect', 'texture', 'color']

const nearlyZero = (value: number) => Math.abs(value) < 0.0001

const colorValue = (value: unknown) => {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)
    ? value
    : '#66CC89'
}

const AdjustFilterModal: FC<IProps> = ({ open, onClose }) => {
  const { t } = useTranslation()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const imageRef = useRef<fabric.Image | null>(null)
  const baselineRef = useRef<FilterSnapshot[]>([])
  const draftRef = useRef<FilterSnapshot[]>([])
  const appliedRef = useRef(false)
  const frameRef = useRef(0)
  const [draft, setDraft] = useState<FilterSnapshot[]>([])
  const [category, setCategory] = useState<FilterGroupId>('adjust')
  const [failed, setFailed] = useState(false)
  const [compare, setCompare] = useState<{
    original: string
    current: string
  } | null>(null)
  const compareRef = useRef<HTMLDialogElement>(null)

  const remember = (next: FilterSnapshot[]) => {
    const cloned = cloneSnapshots(next)
    draftRef.current = cloned
    setDraft(cloned)
    return cloned
  }

  const paint = (snapshots: FilterSnapshot[], notify: boolean) => {
    const image = imageRef.current
    if (!image || image.canvas !== paintBoard.canvas) {
      return false
    }
    return applyFilterSnapshots(image, snapshots, false, notify)
  }

  const preview = (next: FilterSnapshot[]) => {
    const cloned = remember(next)
    cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(() => {
      if (!paint(cloned, false)) {
        setFailed(true)
      }
    })
  }

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
      return
    }
    const image = getActiveImage()
    imageRef.current = image
    const baseline = image ? readFilterSnapshots(image) : []
    baselineRef.current = cloneSnapshots(baseline)
    remember(baseline)
    setCategory('adjust')
    setFailed(false)
    appliedRef.current = false
  }, [open])

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  useEffect(() => {
    const dialog = compareRef.current
    if (!dialog) {
      return
    }
    if (compare && !dialog.open) {
      dialog.showModal()
    }
    if (!compare && dialog.open) {
      dialog.close()
    }
  }, [compare])

  const revert = () => {
    cancelAnimationFrame(frameRef.current)
    paint(baselineRef.current, true)
  }

  const setNumber = (type: string, key: string, value: number) => {
    preview(
      updateTypedFilter(
        draftRef.current,
        type,
        nearlyZero(value) ? null : { type, [key]: value }
      )
    )
  }

  const setGamma = (channel: number, value: number) => {
    const gamma = snapshotGamma(draftRef.current)
    gamma[channel] = value
    const neutral = gamma.every((item) => Math.abs(item - 1) < 0.0001)
    preview(
      updateTypedFilter(
        draftRef.current,
        'Gamma',
        neutral ? null : { type: 'Gamma', gamma }
      )
    )
  }

  const setChoice = (choice: Exclude<ConvoluteChoice, 'custom'>) => {
    if (choice === 'off') {
      preview(updateTypedFilter(draftRef.current, 'Convolute', null))
      return
    }
    preview(
      updateTypedFilter(
        draftRef.current,
        'Convolute',
        presetSnapshot(choice === 'emboss' ? 'Emboss' : 'Sharpen')
      )
    )
  }

  const openCompare = () => {
    const image = imageRef.current
    if (!image || image.canvas !== paintBoard.canvas) {
      return
    }
    const original = originalImageSrc(image)
    const current = renderFilteredPreview(image, draftRef.current) || original
    setCompare({ original, current })
  }

  const apply = () => {
    const image = imageRef.current
    if (!image || image.canvas !== paintBoard.canvas) {
      appliedRef.current = true
      dialogRef.current?.close()
      return
    }
    if (!commitFilterSnapshots(image, draftRef.current)) {
      setFailed(true)
      return
    }
    appliedRef.current = true
    dialogRef.current?.close()
  }

  const grayscale = findFilter(draft, 'Grayscale')
  const grayscaleMode =
    grayscale?.mode === 'lightness' || grayscale?.mode === 'luminosity'
      ? grayscale.mode
      : grayscale
      ? 'average'
      : 'off'
  const blend = findFilter(draft, 'BlendColor')
  const convolution = convoluteChoice(draft)
  const gamma = snapshotGamma(draft)

  return (
    <>
      <dialog
        ref={dialogRef}
        className="modal"
        onClose={() => {
          setCompare(null)
          if (!appliedRef.current) {
            revert()
          }
          appliedRef.current = false
          onClose()
        }}
      >
        <div className="modal-box flex w-[42rem] max-h-[88vh] max-w-[94vw] flex-col overflow-hidden">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              aria-label={t('cancel') as string}
            >
              ✕
            </button>
          </form>
          <h3 className="pr-8 font-fredokaOne text-lg font-bold">
            {t('imageFilter.adjustTitle')}
          </h3>
          <div className="mt-3 flex min-h-0 flex-1 flex-col gap-3 sm:flex-row">
            <div className="flex shrink-0 gap-1 sm:w-28 sm:flex-col">
              {CATEGORIES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`btn btn-xs ${
                    category === item ? 'btn-primary' : 'btn-ghost'
                  }`}
                  onClick={() => setCategory(item)}
                >
                  {t(`imageFilter.${item}`)}
                </button>
              ))}
            </div>
            <div className="min-w-0 flex-1 overflow-auto pr-1">
              {category === 'adjust' && (
                <div>
                  <RangeField
                    label={t('filters.Brightness')}
                    min={-1}
                    max={1}
                    step={0.01}
                    value={snapshotNumber(draft, 'Brightness', 'brightness')}
                    onChange={(value) =>
                      setNumber('Brightness', 'brightness', value)
                    }
                  />
                  <RangeField
                    label={t('filters.Contrast')}
                    min={-1}
                    max={1}
                    step={0.01}
                    value={snapshotNumber(draft, 'Contrast', 'contrast')}
                    onChange={(value) =>
                      setNumber('Contrast', 'contrast', value)
                    }
                  />
                  <RangeField
                    label={t('filters.Saturation')}
                    min={-1}
                    max={1}
                    step={0.01}
                    value={snapshotNumber(draft, 'Saturation', 'saturation')}
                    onChange={(value) =>
                      setNumber('Saturation', 'saturation', value)
                    }
                  />
                  <RangeField
                    label={t('filters.Vibrance')}
                    min={-1}
                    max={1}
                    step={0.01}
                    value={snapshotNumber(draft, 'Vibrance', 'vibrance')}
                    onChange={(value) =>
                      setNumber('Vibrance', 'vibrance', value)
                    }
                  />
                  <RangeField
                    label={t('filters.HueRotation')}
                    min={-1}
                    max={1}
                    step={0.01}
                    value={snapshotNumber(draft, 'HueRotation', 'rotation')}
                    onChange={(value) =>
                      setNumber('HueRotation', 'rotation', value)
                    }
                  />
                  {(['gammaRed', 'gammaGreen', 'gammaBlue'] as const).map(
                    (key, index) => (
                      <RangeField
                        key={key}
                        label={t(`imageFilter.${key}`)}
                        min={0.2}
                        max={2.2}
                        step={0.01}
                        value={gamma[index]}
                        onChange={(value) => setGamma(index, value)}
                      />
                    )
                  )}
                </div>
              )}
              {category === 'effect' && (
                <div>
                  <label className="mb-3 flex items-center justify-between gap-3 text-sm">
                    <span>{t('imageFilter.grayscale')}</span>
                    <select
                      className="select select-bordered select-xs"
                      value={grayscaleMode}
                      onChange={(event) => {
                        const mode = event.target.value
                        preview(
                          updateTypedFilter(
                            draftRef.current,
                            'Grayscale',
                            mode === 'off' ? null : { type: 'Grayscale', mode }
                          )
                        )
                      }}
                    >
                      <option value="off">{t('imageFilter.off')}</option>
                      {GRAYSCALE_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {t(`filters.mode.${mode}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="mb-3 flex items-center justify-between text-sm">
                    <span>{t('filters.Invert')}</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-success"
                      checked={draft.some(
                        (item) =>
                          item.type === 'Invert' && item.invert !== false
                      )}
                      onChange={() => {
                        const enabled = draftRef.current.some(
                          (item) =>
                            item.type === 'Invert' && item.invert !== false
                        )
                        preview(
                          updateTypedFilter(
                            draftRef.current,
                            'Invert',
                            enabled ? null : presetSnapshot('Invert')
                          )
                        )
                      }}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {TONE_FILTERS.map((id) => {
                      const enabled = draft.some((item) => item.type === id)
                      return (
                        <label
                          key={id}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span>{t(`filters.${id}`)}</span>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-xs checkbox-success"
                            checked={enabled}
                            onChange={() => {
                              preview(
                                updateTypedFilter(
                                  draftRef.current,
                                  id,
                                  enabled ? null : { type: id }
                                )
                              )
                            }}
                          />
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
              {category === 'texture' && (
                <div>
                  <RangeField
                    label={t('filters.Blur')}
                    min={0}
                    max={1}
                    step={0.01}
                    value={snapshotNumber(draft, 'Blur', 'blur')}
                    onChange={(value) => setNumber('Blur', 'blur', value)}
                  />
                  <RangeField
                    label={t('filters.Noise')}
                    min={0}
                    max={200}
                    step={1}
                    value={snapshotNumber(draft, 'Noise', 'noise')}
                    digits={0}
                    onChange={(value) => setNumber('Noise', 'noise', value)}
                  />
                  <label className="mb-3 flex items-center justify-between text-sm">
                    <span>{t('filters.Pixelate')}</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-success"
                      checked={!!findFilter(draft, 'Pixelate')}
                      onChange={() => {
                        const enabled = !!findFilter(
                          draftRef.current,
                          'Pixelate'
                        )
                        preview(
                          updateTypedFilter(
                            draftRef.current,
                            'Pixelate',
                            enabled ? null : presetSnapshot('Pixelate')
                          )
                        )
                      }}
                    />
                  </label>
                  {findFilter(draft, 'Pixelate') && (
                    <RangeField
                      label={t('imageFilter.blockSize')}
                      min={2}
                      max={20}
                      step={1}
                      value={snapshotNumber(draft, 'Pixelate', 'blocksize', 4)}
                      digits={0}
                      onChange={(value) =>
                        preview(
                          updateTypedFilter(draftRef.current, 'Pixelate', {
                            type: 'Pixelate',
                            blocksize: value
                          })
                        )
                      }
                    />
                  )}
                  <div className="join mt-2">
                    {(['off', 'sharpen', 'emboss'] as const).map((choice) => (
                      <button
                        key={choice}
                        type="button"
                        className={`btn btn-xs join-item ${
                          convolution === choice ? 'btn-active' : ''
                        }`}
                        onClick={() => setChoice(choice)}
                      >
                        {t(
                          choice === 'off'
                            ? 'imageFilter.off'
                            : choice === 'sharpen'
                            ? 'filters.Sharpen'
                            : 'filters.Emboss'
                        )}
                      </button>
                    ))}
                  </div>
                  {convolution === 'custom' && (
                    <p className="mt-2 text-xs opacity-70">
                      {t('imageFilter.customMatrix')}
                    </p>
                  )}
                </div>
              )}
              {category === 'color' && (
                <div>
                  <label className="mb-3 flex items-center justify-between text-sm">
                    <span>{t('filters.BlendColor')}</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-xs checkbox-success"
                      checked={!!blend}
                      onChange={() => {
                        preview(
                          updateTypedFilter(
                            draftRef.current,
                            'BlendColor',
                            blend ? null : presetSnapshot('BlendColor')
                          )
                        )
                      }}
                    />
                  </label>
                  {blend && (
                    <>
                      <label className="mb-3 flex items-center justify-between text-sm">
                        <span>{t('imageFilter.blendColor')}</span>
                        <input
                          type="color"
                          value={colorValue(blend.color)}
                          onChange={(event) => {
                            preview(
                              updateTypedFilter(
                                draftRef.current,
                                'BlendColor',
                                {
                                  type: 'BlendColor',
                                  color: event.target.value,
                                  mode: blend.mode,
                                  alpha:
                                    typeof blend.alpha === 'number'
                                      ? blend.alpha
                                      : 1
                                }
                              )
                            )
                          }}
                        />
                      </label>
                      <label className="mb-3 flex items-center justify-between gap-3 text-sm">
                        <span>{t('imageFilter.blendMode')}</span>
                        <select
                          className="select select-bordered select-xs"
                          value={
                            typeof blend.mode === 'string' ? blend.mode : 'diff'
                          }
                          onChange={(event) => {
                            preview(
                              updateTypedFilter(
                                draftRef.current,
                                'BlendColor',
                                {
                                  type: 'BlendColor',
                                  color: colorValue(blend.color),
                                  mode: event.target.value,
                                  alpha:
                                    typeof blend.alpha === 'number'
                                      ? blend.alpha
                                      : 1
                                }
                              )
                            )
                          }}
                        >
                          {BLEND_MODES.map((mode) => (
                            <option key={mode} value={mode}>
                              {t(`filters.blend.${mode}`)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <RangeField
                        label={t('imageFilter.strength')}
                        min={0}
                        max={1}
                        step={0.01}
                        value={
                          typeof blend.alpha === 'number' ? blend.alpha : 1
                        }
                        onChange={(value) => {
                          preview(
                            updateTypedFilter(
                              draftRef.current,
                              'BlendColor',
                              nearlyZero(value)
                                ? null
                                : {
                                    type: 'BlendColor',
                                    color: colorValue(blend.color),
                                    mode: blend.mode,
                                    alpha: value
                                  }
                            )
                          )
                        }}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          {failed && (
            <p className="mt-2 text-sm text-error">{t('imageFilter.failed')}</p>
          )}
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button type="button" className="btn btn-xs" onClick={openCompare}>
              {t('imageFilter.viewEffect')}
            </button>
            <button
              type="button"
              className="btn btn-xs"
              onClick={() => preview([])}
            >
              {t('imageFilter.reset')}
            </button>
            <form method="dialog">
              <button className="btn btn-xs">{t('cancel')}</button>
            </form>
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onClick={apply}
            >
              {t('imageFilter.apply')}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
      <dialog
        ref={compareRef}
        className="modal"
        onClose={() => setCompare(null)}
      >
        <div className="modal-box w-[52rem] max-w-[94vw]">
          <form method="dialog">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              aria-label={t('cancel') as string}
            >
              ✕
            </button>
          </form>
          <h3 className="pr-8 font-fredokaOne text-lg font-bold">
            {t('imageFilter.viewEffect')}
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <figure className="flex min-w-0 flex-col">
              <figcaption className="mb-2 text-center text-sm font-fredokaOne">
                {t('imageFilter.original')}
              </figcaption>
              {compare?.original && (
                <img
                  src={compare.original}
                  alt={t('imageFilter.original') as string}
                  className="max-h-[60vh] w-full rounded bg-base-200 object-contain"
                />
              )}
            </figure>
            <figure className="flex min-w-0 flex-col">
              <figcaption className="mb-2 text-center text-sm font-fredokaOne">
                {t('imageFilter.currentEffect')}
              </figcaption>
              {compare?.current && (
                <img
                  src={compare.current}
                  alt={t('imageFilter.currentEffect') as string}
                  className="max-h-[60vh] w-full rounded bg-base-200 object-contain"
                />
              )}
            </figure>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  )
}

const RangeField = ({
  label,
  min,
  max,
  step,
  value,
  digits = 2,
  onChange
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  digits?: number
  onChange: (value: number) => void
}) => {
  const shown = Math.min(max, Math.max(min, value))
  return (
    <label className="mb-3 block">
      <div className="mb-1 flex justify-between text-xs">
        <span>{label}</span>
        <span>{value.toFixed(digits)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={shown}
        className="range range-success range-xs"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

export default AdjustFilterModal
