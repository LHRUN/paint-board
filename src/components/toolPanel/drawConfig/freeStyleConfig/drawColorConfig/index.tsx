import AddColorIcon from '@/components/icons/addColor.svg?react'
import useDrawStore from '@/store/draw'
import { useTranslation } from 'react-i18next'

import ClearIcon from '@/components/icons/clear.svg?react'

const DrawColorConfig = () => {
  const { drawColors, updateDrawColors } = useDrawStore()
  const { t } = useTranslation()

  // update draw colors
  const handleDrawColors = (color: string, index: number) => {
    const colors = [...drawColors]
    colors[index] = color
    updateDrawColors(colors)
  }

  // delete draw color
  const deleteDrawColor = (index: number) => {
    const colors = [...drawColors]
    colors.splice(index, 1)
    updateDrawColors(colors)
  }

  return (
    <div className="form-control mt-3">
      <div className="font-bold text-sm font-fredokaOne">
        {t('title.drawColor')}
      </div>
      <div className="mt-2 flex items-center w-full">
        {drawColors.map((color, i) => {
          return (
            <div className="w-7 h-7 mr-2 relative" key={i}>
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  handleDrawColors(e.target.value, i)
                }}
                className="colorInput"
              />
              {drawColors.length > 1 && (
                <ClearIcon
                  onClick={() => deleteDrawColor(i)}
                  className="absolute top-[-6px] right-[-6px] rounded-full w-3 h-3 cursor-pointer"
                />
              )}
            </div>
          )
        })}
        {drawColors.length < 5 && (
          <AddColorIcon
            className="cursor-pointer"
            onClick={() => {
              handleDrawColors('#000000', drawColors.length)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default DrawColorConfig
