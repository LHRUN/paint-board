import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  DEFAULT_QUICK_FILTERS,
  FilterId,
  sanitizeQuickFilters
} from '@/core/element/image/filterCatalog'

interface ImageFilterState {
  quickFilters: FilterId[]
  setQuickFilters: (filters: FilterId[]) => void
}

const useImageFilterStore = create<ImageFilterState>()(
  persist(
    (set) => ({
      quickFilters: [...DEFAULT_QUICK_FILTERS],
      setQuickFilters(filters) {
        set({ quickFilters: sanitizeQuickFilters(filters) })
      }
    }),
    {
      name: 'PAINT-BOARD-IMAGE-FILTER-STORE',
      version: 1,
      partialize: (state) => ({
        quickFilters: state.quickFilters
      }),
      merge: (persistedState, currentState) => {
        const stored = persistedState as { quickFilters?: unknown } | undefined
        return {
          ...currentState,
          quickFilters: sanitizeQuickFilters(stored?.quickFilters)
        }
      }
    }
  )
)

export default useImageFilterStore
