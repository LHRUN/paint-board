import { fabric } from 'fabric'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import { paintBoard } from '@/core/paintBoard'
import {
  cloneSnapshots,
  FilterId,
  FilterSnapshot,
  isFilterId,
  stripNeutral,
  togglePreset
} from './filterCatalog'

type FabricFilter = {
  toObject: () => FilterSnapshot
}

export const getActiveImage = () => {
  const object = paintBoard.canvas?.getActiveObject() as
    | (fabric.Image & { _customType?: string })
    | undefined
  if (!object || object._customType !== ELEMENT_CUSTOM_TYPE.IMAGE) {
    return null
  }
  return object
}

export const createFabricFilter = (snapshot: FilterSnapshot) => {
  const options = JSON.parse(JSON.stringify(snapshot)) as FilterSnapshot
  const registry = fabric.Image.filters as unknown as Record<
    string,
    new (opts?: object) => FabricFilter
  >
  const FilterClass = registry[options.type]
  if (!FilterClass) {
    return null
  }
  return new FilterClass(options)
}

export const readFilterSnapshots = (image: fabric.Image) => {
  return (image.filters || []).flatMap((filter) => {
    const source = filter as FabricFilter | null
    if (!source || typeof source.toObject !== 'function') {
      return []
    }
    const snapshot = source.toObject()
    if (!snapshot || typeof snapshot.type !== 'string') {
      return []
    }
    return [JSON.parse(JSON.stringify(snapshot)) as FilterSnapshot]
  })
}

export const applyFilterSnapshots = (
  image: fabric.Image,
  snapshots: FilterSnapshot[],
  commit: boolean,
  notify = commit
) => {
  const previous = image.filters ? [...image.filters] : []
  const next = snapshots
    .map((snapshot) => createFabricFilter(snapshot))
    .filter((filter): filter is FabricFilter => !!filter)
  image.filters = next as fabric.Image['filters']
  try {
    image.applyFilters()
  } catch {
    image.filters = previous
    try {
      image.applyFilters()
    } catch {
      // The previous filters could not be rebuilt. Keep the image visible.
    }
    paintBoard.canvas?.requestRenderAll()
    if (notify) {
      paintBoard.triggerHook()
    }
    return false
  }
  if (commit) {
    paintBoard.render()
  } else {
    paintBoard.canvas?.requestRenderAll()
  }
  if (notify) {
    paintBoard.triggerHook()
  }
  return true
}

export const toggleImageFilter = (image: fabric.Image, id: FilterId) => {
  const current = readFilterSnapshots(image)
  const next = togglePreset(current, id)
  if (!applyFilterSnapshots(image, next, true)) {
    applyFilterSnapshots(image, current, false, true)
    return false
  }
  return true
}

const originalElement = (image: fabric.Image) => {
  return (
    image as fabric.Image & {
      _originalElement?: HTMLImageElement | HTMLCanvasElement
    }
  )._originalElement
}

const elementUrl = (element?: HTMLImageElement | HTMLCanvasElement) => {
  if (!element) {
    return ''
  }
  if (element instanceof HTMLCanvasElement) {
    return element.toDataURL('image/png')
  }
  return element.src || ''
}

/** The unfiltered source. Reading it does not change the board image. */
export const originalImageSrc = (image: fabric.Image) => {
  return elementUrl(originalElement(image))
}

/**
 * Draw the current adjustments on a copy. The board image is left unchanged.
 */
export const renderFilteredPreview = (
  image: fabric.Image,
  snapshots: FilterSnapshot[]
) => {
  const source = originalElement(image)
  const original = elementUrl(source)
  if (!source || !snapshots.length) {
    return original
  }
  const preview = new fabric.Image(source)
  const filters = snapshots
    .map((snapshot) => createFabricFilter(snapshot))
    .filter((filter): filter is FabricFilter => !!filter)
  preview.filters = filters as fabric.Image['filters']
  try {
    preview.applyFilters()
  } catch {
    return original
  }
  const element = preview.getElement() as
    | HTMLImageElement
    | HTMLCanvasElement
    | undefined
  const url =
    element instanceof HTMLCanvasElement ? elementUrl(element) : original
  const disposable = preview as fabric.Image & {
    removeTexture?: (key: string) => void
    cacheKey?: string
  }
  if (disposable.removeTexture && disposable.cacheKey) {
    disposable.removeTexture(disposable.cacheKey)
    disposable.removeTexture(`${disposable.cacheKey}_filtered`)
  }
  return url
}

export const commitFilterSnapshots = (
  image: fabric.Image,
  snapshots: FilterSnapshot[]
) => {
  return applyFilterSnapshots(
    image,
    stripNeutral(cloneSnapshots(snapshots)),
    true
  )
}

export const toggleImageFilterByType = (
  image: fabric.Image,
  filterType: string
) => {
  const id = filterType === 'Convolute' ? 'Emboss' : filterType
  if (!isFilterId(id)) {
    return
  }
  toggleImageFilter(image, id)
}
