import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  canAddCustomFont,
  DEFAULT_FONTS,
  defaultFontLists,
  FONT_CONFIG_VERSION,
  FontLists,
  nextQuickFonts,
  normalizeFontName,
  QuickFontStatus,
  removeCustomFont,
  sanitizeFontConfig
} from '@/core/font/fontConfig'
import { ensureFontsLoaded, ensureFontTextReady } from '@/core/font/googleFont'
import useDrawStore from '@/store/draw'

interface FontState extends FontLists {
  version: number
  addCustomFont: (font: string) => boolean
  deleteCustomFont: (font: string) => void
  assignQuickFont: (font: string) => QuickFontStatus
}

const initialLists = defaultFontLists()

const useFontStore = create<FontState>()(
  persist(
    (set, get) => ({
      version: FONT_CONFIG_VERSION,
      customFonts: initialLists.customFonts,
      quickFonts: initialLists.quickFonts,
      addCustomFont(font) {
        const { customFonts } = get()
        const name = normalizeFontName(font)
        if (canAddCustomFont(name, customFonts) !== 'ok') {
          return false
        }
        set({ customFonts: [...customFonts, name] })
        return true
      },
      deleteCustomFont(font) {
        // Removing a configured font must leave canvas text objects unchanged.
        const next = removeCustomFont(get(), font)
        set({
          customFonts: next.customFonts,
          quickFonts: next.quickFonts
        })
      },
      assignQuickFont(font) {
        const { customFonts, quickFonts } = get()
        const result = nextQuickFonts(quickFonts, font, [
          ...DEFAULT_FONTS,
          ...customFonts
        ])
        if (result.status === 'added' || result.status === 'replaced') {
          set({ quickFonts: result.quickFonts })
        }
        return result.status
      }
    }),
    {
      name: 'PAINT-BOARD-FONT-STORE',
      version: FONT_CONFIG_VERSION,
      partialize: (state) => ({
        version: state.version,
        customFonts: state.customFonts,
        quickFonts: state.quickFonts
      }),
      merge: (persistedState, currentState) => {
        const sanitized = sanitizeFontConfig(persistedState)
        return {
          ...currentState,
          version: FONT_CONFIG_VERSION,
          customFonts: sanitized.customFonts,
          quickFonts: sanitized.quickFonts
        }
      },
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }
        const drawState = useDrawStore.getState()
        const activeFont = normalizeFontName(drawState.textFontFamily || '')
        void ensureFontsLoaded([
          ...DEFAULT_FONTS,
          ...state.customFonts,
          ...state.quickFonts,
          activeFont
        ])
        void ensureFontTextReady(
          activeFont,
          drawState.drawTextValue || ''
        ).catch(() => undefined)
      }
    }
  )
)

export default useFontStore
