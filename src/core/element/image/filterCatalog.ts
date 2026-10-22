export const QUICK_FILTER_LIMIT = 9

export const EMBOSS_MATRIX = [1, 1, 1, 1, 0.7, -1, -1, -1, -1]
export const SHARPEN_MATRIX = [0, -1, 0, -1, 5, -1, 0, -1, 0]

export const GRAYSCALE_MODES = ['average', 'lightness', 'luminosity'] as const
export const BLEND_MODES = [
  'multiply',
  'add',
  'diff',
  'screen',
  'subtract',
  'darken',
  'lighten',
  'overlay',
  'exclusion',
  'tint'
] as const

export const FILTER_GROUPS = [
  {
    id: 'effect',
    filters: [
      'Sepia',
      'Invert',
      'BlackWhite',
      'Grayscale',
      'Vintage',
      'Brownie',
      'Kodachrome',
      'Polaroid',
      'Technicolor'
    ]
  },
  {
    id: 'texture',
    filters: ['Blur', 'Pixelate', 'Noise', 'Emboss', 'Sharpen']
  },
  {
    id: 'adjust',
    filters: [
      'Brightness',
      'Contrast',
      'Saturation',
      'Vibrance',
      'HueRotation',
      'Gamma'
    ]
  },
  {
    id: 'color',
    filters: ['BlendColor']
  }
] as const

export type FilterGroupId = (typeof FILTER_GROUPS)[number]['id']
export type FilterId = (typeof FILTER_GROUPS)[number]['filters'][number]

export const FILTER_LIBRARY: FilterId[] = FILTER_GROUPS.flatMap(
  (group) => group.filters
)

export const DEFAULT_QUICK_FILTERS: FilterId[] = [
  'Sepia',
  'Invert',
  'BlackWhite',
  'Grayscale',
  'Blur',
  'Pixelate',
  'Noise',
  'Emboss',
  'Kodachrome'
]

export interface FilterSnapshot {
  type: string
  [key: string]: unknown
}

const PRESETS: Record<FilterId, FilterSnapshot> = {
  Sepia: { type: 'Sepia' },
  Invert: { type: 'Invert', invert: true },
  BlackWhite: { type: 'BlackWhite' },
  Grayscale: { type: 'Grayscale', mode: 'average' },
  Vintage: { type: 'Vintage' },
  Brownie: { type: 'Brownie' },
  Kodachrome: { type: 'Kodachrome' },
  Polaroid: { type: 'Polaroid' },
  Technicolor: { type: 'Technicolor' },
  Blur: { type: 'Blur', blur: 0.5 },
  Pixelate: { type: 'Pixelate', blocksize: 4 },
  Noise: { type: 'Noise', noise: 100 },
  Emboss: { type: 'Convolute', opaque: false, matrix: EMBOSS_MATRIX },
  Sharpen: { type: 'Convolute', opaque: false, matrix: SHARPEN_MATRIX },
  Brightness: { type: 'Brightness', brightness: 0.6 },
  Contrast: { type: 'Contrast', contrast: 0.3 },
  Saturation: { type: 'Saturation', saturation: 0.4 },
  Vibrance: { type: 'Vibrance', vibrance: 0.4 },
  HueRotation: { type: 'HueRotation', rotation: 0.2 },
  Gamma: { type: 'Gamma', gamma: [1.2, 1, 0.8] },
  BlendColor: {
    type: 'BlendColor',
    color: '#66CC89',
    mode: 'diff',
    alpha: 1
  }
}

const LIBRARY_SET = new Set<string>(FILTER_LIBRARY)

export const isFilterId = (value: string): value is FilterId => {
  return LIBRARY_SET.has(value)
}

export const cloneSnapshots = (list: FilterSnapshot[]) => {
  return JSON.parse(JSON.stringify(list)) as FilterSnapshot[]
}

export const presetSnapshot = (id: FilterId): FilterSnapshot => {
  return JSON.parse(JSON.stringify(PRESETS[id])) as FilterSnapshot
}

export const sanitizeQuickFilters = (value: unknown): FilterId[] => {
  if (!Array.isArray(value)) {
    return [...DEFAULT_QUICK_FILTERS]
  }
  const seen = new Set<string>()
  const next: FilterId[] = []
  value.forEach((item) => {
    if (next.length >= QUICK_FILTER_LIMIT || typeof item !== 'string') {
      return
    }
    if (!isFilterId(item) || seen.has(item)) {
      return
    }
    seen.add(item)
    next.push(item)
  })
  return next
}

export const toggleQuickSelection = (list: FilterId[], id: FilterId) => {
  if (list.includes(id)) {
    return {
      filters: list.filter((item) => item !== id),
      limited: false
    }
  }
  if (list.length >= QUICK_FILTER_LIMIT) {
    return { filters: list, limited: true }
  }
  return { filters: [...list, id], limited: false }
}

export const moveQuickFilter = (list: FilterId[], from: number, to: number) => {
  if (
    from === to ||
    from < 0 ||
    to < 0 ||
    from >= list.length ||
    to >= list.length
  ) {
    return list
  }
  const next = [...list]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next
}

const sameMatrix = (value: unknown, expected: number[]) => {
  if (!Array.isArray(value) || value.length !== expected.length) {
    return false
  }
  return expected.every(
    (item, index) => Math.abs(Number(value[index]) - item) < 0.001
  )
}

export const isPresetActive = (list: FilterSnapshot[], id: FilterId) => {
  if (id === 'Emboss' || id === 'Sharpen') {
    const matrix = id === 'Emboss' ? EMBOSS_MATRIX : SHARPEN_MATRIX
    return list.some(
      (item) => item.type === 'Convolute' && sameMatrix(item.matrix, matrix)
    )
  }
  if (id === 'Invert') {
    return list.some((item) => item.type === 'Invert' && item.invert !== false)
  }
  return list.some((item) => item.type === PRESETS[id].type)
}

export const updateTypedFilter = (
  list: FilterSnapshot[],
  type: string,
  next: FilterSnapshot | null
) => {
  const index = list.findIndex((item) => item.type === type)
  if (!next) {
    return index < 0 ? list : list.filter((item) => item.type !== type)
  }
  const snapshot = cloneSnapshots([next])[0]
  if (index < 0) {
    return [...list, snapshot]
  }
  return list.map((item, itemIndex) => (itemIndex === index ? snapshot : item))
}

export const togglePreset = (list: FilterSnapshot[], id: FilterId) => {
  if (isPresetActive(list, id)) {
    if (id === 'Emboss' || id === 'Sharpen') {
      const matrix = id === 'Emboss' ? EMBOSS_MATRIX : SHARPEN_MATRIX
      return list.filter(
        (item) =>
          !(item.type === 'Convolute' && sameMatrix(item.matrix, matrix))
      )
    }
    return list.filter((item) => item.type !== PRESETS[id].type)
  }
  return updateTypedFilter(list, PRESETS[id].type, presetSnapshot(id))
}

const nearly = (value: unknown, target: number) => {
  return typeof value === 'number' && Math.abs(value - target) < 0.0001
}

const gammaIsNeutral = (value: unknown) => {
  return (
    Array.isArray(value) &&
    value.length >= 3 &&
    nearly(Number(value[0]), 1) &&
    nearly(Number(value[1]), 1) &&
    nearly(Number(value[2]), 1)
  )
}

export const stripNeutral = (list: FilterSnapshot[]) => {
  return list.filter((item) => {
    if (item.type === 'Brightness') return !nearly(item.brightness, 0)
    if (item.type === 'Contrast') return !nearly(item.contrast, 0)
    if (item.type === 'Saturation') return !nearly(item.saturation, 0)
    if (item.type === 'Vibrance') return !nearly(item.vibrance, 0)
    if (item.type === 'HueRotation') return !nearly(item.rotation, 0)
    if (item.type === 'Noise') return !nearly(item.noise, 0)
    if (item.type === 'Blur') return !nearly(item.blur, 0)
    if (item.type === 'Invert') return item.invert !== false
    if (item.type === 'Gamma') return !gammaIsNeutral(item.gamma)
    if (item.type === 'BlendColor') return !nearly(item.alpha, 0)
    return true
  })
}

export const findFilter = (list: FilterSnapshot[], type: string) => {
  return list.find((item) => item.type === type)
}

export const snapshotNumber = (
  list: FilterSnapshot[],
  type: string,
  key: string,
  fallback = 0
) => {
  const value = findFilter(list, type)?.[key]
  return typeof value === 'number' ? value : fallback
}

export const snapshotGamma = (
  list: FilterSnapshot[]
): [number, number, number] => {
  const value = findFilter(list, 'Gamma')?.gamma
  if (!Array.isArray(value) || value.length < 3) {
    return [1, 1, 1]
  }
  return [Number(value[0]), Number(value[1]), Number(value[2])]
}

export type ConvoluteChoice = 'off' | 'emboss' | 'sharpen' | 'custom'

export const convoluteChoice = (list: FilterSnapshot[]): ConvoluteChoice => {
  const item = findFilter(list, 'Convolute')
  if (!item) {
    return 'off'
  }
  if (sameMatrix(item.matrix, EMBOSS_MATRIX)) {
    return 'emboss'
  }
  if (sameMatrix(item.matrix, SHARPEN_MATRIX)) {
    return 'sharpen'
  }
  return 'custom'
}
