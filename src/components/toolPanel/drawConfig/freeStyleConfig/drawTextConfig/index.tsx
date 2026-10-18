import useDrawStore from '@/store/draw'
import { ensureFontTextReady } from '@/core/font/googleFont'
import { useTranslation } from 'react-i18next'

const DrawTextConfig = () => {
  const { t } = useTranslation()
  const { drawTextValue, updateDrawTextValue } = useDrawStore()

  return (
    <div className="mt-2">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.drawText')}
      </div>
      <input
        value={drawTextValue}
        className="input input-bordered input-sm mt-1 w-full"
        onInput={(e) => {
          const value = (e.target as HTMLInputElement).value
          updateDrawTextValue(value)
          void ensureFontTextReady(
            useDrawStore.getState().textFontFamily,
            value
          ).catch(() => undefined)
        }}
      />
    </div>
  )
}

export default DrawTextConfig
