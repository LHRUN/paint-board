import useDrawStore from '@/store/draw'
import useFontStore from '@/store/font'
import { useTranslation } from 'react-i18next'
import { FC, useEffect, useState } from 'react'
import { Settings } from 'lucide-react'
import { paintBoard } from '@/core/paintBoard'
import { cssFontFamily, sameFont } from '@/core/font/fontConfig'
import { collectPlainText } from '@/core/font/collectFontFamilies'
import {
  ensureFontTextReady,
  ensureFontsLoaded,
  FontLoadError
} from '@/core/font/googleFont'
import FontConfigModal from './fontConfigModal'

interface IProps {
  fontFamily?: string
  layoutType?: string
  updateFontFamily?: (fontFamily: string) => void
}

const loadMessage = (error: unknown) => {
  if (error instanceof FontLoadError) {
    if (error.reason === 'not-found') {
      return 'fontConfig.notFound'
    }
    if (error.reason === 'network') {
      return 'fontConfig.network'
    }
  }
  return 'fontConfig.loadFailed'
}

const FontFamilyConfg: FC<IProps> = ({
  fontFamily,
  updateFontFamily,
  layoutType = 'horizontal'
}) => {
  const { textFontFamily, updateTextFontFamily } = useDrawStore()
  const quickFonts = useFontStore((state) => state.quickFonts)
  const { t } = useTranslation()
  const [showFontConfig, setShowFontConfig] = useState(false)
  const [pendingFont, setPendingFont] = useState('')
  const [messageKey, setMessageKey] = useState('')
  const [fontRevision, setFontRevision] = useState(0)
  const selectedFont = fontFamily || textFontFamily

  useEffect(() => {
    let cancelled = false
    void ensureFontsLoaded(quickFonts).then(() => {
      if (!cancelled) {
        setFontRevision((revision) => revision + 1)
      }
    })
    return () => {
      cancelled = true
    }
  }, [quickFonts])

  const selectFont = async (font: string) => {
    if (pendingFont) {
      return
    }
    const activeObject = updateFontFamily
      ? paintBoard.canvas?.getActiveObject()
      : undefined
    setPendingFont(font)
    setMessageKey('')
    try {
      const drawingText = useDrawStore.getState().drawTextValue || ''
      await ensureFontTextReady(
        font,
        `${drawingText}${collectPlainText(activeObject)}`
      )
      updateTextFontFamily(font)
      if (!updateFontFamily) {
        return
      }
      const currentObject = paintBoard.canvas?.getActiveObject()
      if (currentObject === activeObject) {
        updateFontFamily(font)
      }
    } catch (error) {
      setMessageKey(loadMessage(error))
    } finally {
      setPendingFont('')
    }
  }

  return (
    <>
      <div
        className={`mt-2 ${
          layoutType === 'horizontal' ? 'flex items-start' : ''
        }`}
      >
        <div
          className={`font-bold text-sm font-fredokaOne flex items-center shrink-0 ${
            layoutType === 'horizontal' ? 'w-20 justify-end' : ''
          }`}
        >
          {t('title.fontFamily')}
          <button
            type="button"
            className="ml-1 inline-flex tooltip tooltip-right cursor-pointer"
            data-tip={t('fontConfig.settingsTip') as string}
            aria-label={t('fontConfig.settingsTip') as string}
            onClick={() => setShowFontConfig(true)}
          >
            <Settings size={14} />
          </button>
        </div>
        <div
          className={`min-w-0 ${
            layoutType === 'horizontal' ? 'ml-3 w-40' : 'max-w-40'
          }`}
        >
          {quickFonts.map((font) => (
            <label
              className={`flex items-center gap-2 mt-1 w-full min-w-0 cursor-pointer ${
                layoutType === 'horizontal' ? 'first:mt-0' : ''
              } ${pendingFont === font ? 'opacity-60' : ''}`}
              key={font}
            >
              <div
                style={{ fontFamily: cssFontFamily(font) }}
                title={font}
                data-font-revision={fontRevision}
                className="text-xs min-w-0 flex-1 truncate"
              >
                {font}
              </div>
              <input
                type="radio"
                name="font-quick-list"
                className="radio radio-success radio-xs shrink-0"
                disabled={!!pendingFont}
                checked={sameFont(selectedFont, font)}
                onChange={() => {
                  void selectFont(font)
                }}
              />
            </label>
          ))}
          {messageKey && (
            <p className="mt-1 text-xs text-error">{t(messageKey)}</p>
          )}
        </div>
      </div>
      <FontConfigModal
        open={showFontConfig}
        onClose={() => setShowFontConfig(false)}
      />
    </>
  )
}

export default FontFamilyConfg
