import useDrawStore from '@/store/draw'
import FontFamilyConfg from '../fontFamilyConfig'
import { useTranslation } from 'react-i18next'

const DrawTextConfig = () => {
  const { t } = useTranslation()
  const { drawTextValue, updateDrawTextValue } = useDrawStore()

  return (
    <div className="mt-3">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.drawText')}
      </div>
      <div className="flex mt-1 justify-between px-3 py-1.5 rounded-lg bg-primary cursor-pointer">
        <input
          value={drawTextValue}
          className="px-2 rounded-lg flex-1"
          onInput={(e) =>
            updateDrawTextValue((e.target as HTMLInputElement).value)
          }
        />
      </div>
      <FontFamilyConfg />
    </div>
  )
}

export default DrawTextConfig
