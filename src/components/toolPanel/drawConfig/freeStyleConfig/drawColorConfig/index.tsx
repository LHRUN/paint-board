import debounce from 'lodash-es/debounce'
import { useMemo } from 'react'
import useDrawStore from '@/store/draw'
import { useTranslation } from 'react-i18next'
import { DrawStyle } from '@/constants/draw'
import ColorSwatchList from '@/components/toolPanel/colorSwatchList'

const DrawColorConfig = () => {
  const {
    drawStyle,
    drawColors,
    updateDrawColor,
    deleteDrawColor,
    updateCurrentDrawColor,
    currentDrawColor,
    currentMultiColor
  } = useDrawStore()
  const { t } = useTranslation()

  const currentColorIndexList = useMemo(() => {
    return [DrawStyle.MultiColor, DrawStyle.Pixels, DrawStyle.Shape].includes(
      drawStyle
    )
      ? currentMultiColor
      : [currentDrawColor]
  }, [drawStyle, currentDrawColor, currentMultiColor])

  const handleDrawColor = debounce((color: string, colorIndex: number) => {
    updateDrawColor(color, colorIndex)
  }, 100)

  return (
    <ColorSwatchList
      label={t('title.drawColor')}
      inputId="draw-color-input"
      colors={drawColors}
      activeIndexes={currentColorIndexList}
      onSelect={updateCurrentDrawColor}
      onEdit={handleDrawColor}
      onAdd={() => {
        updateDrawColor('#000000', drawColors.length)
      }}
      onDelete={deleteDrawColor}
    />
  )
}

export default DrawColorConfig
