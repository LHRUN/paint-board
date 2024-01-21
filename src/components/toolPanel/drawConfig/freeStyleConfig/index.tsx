import { useTranslation } from 'react-i18next'
import useDrawStore from '@/store/draw'
import { DrawStyle } from '@/constants/draw'
import { styleSwitch } from './constant'

import ShapeConutConfig from './shapeConfig/shapeConutConfig'
import ShapeTypeConfig from './shapeConfig/shapeTypeConfig'
import ShadowConfig from './shadowConfig'
import DrawTextConfig from './drawTextConfig'
import MaterialConfig from './materialConfig'
import MultiColorConfig from './multiColorConfig'
import AddColorIcon from '@/components/icons/addColor.svg?react'

const FreeDrawConfig = () => {
  const { t } = useTranslation()
  const {
    drawWidth,
    updateDrawWidth,
    drawStyle,
    updateDrawStyle,
    drawColors,
    updateDrawColors
  } = useDrawStore()

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
    <>
      {/* style config */}
      <div className="mt-2">
        <div className="font-bold text-base font-fredokaOne">Draw Style</div>
        {Object.keys(styleSwitch).map((lineKey) => (
          <div key={lineKey} className="btn-group mt-1 flex">
            {styleSwitch[lineKey].map(({ type, text }) => (
              <button
                key={type}
                className={`btn btn-xs flex-grow font-fredokaOne text-xs ${
                  drawStyle === type ? 'btn-active' : ''
                }`}
                onClick={() => updateDrawStyle(type)}
              >
                {t(text)}
              </button>
            ))}
          </div>
        ))}
      </div>
      {drawStyle === DrawStyle.Shape && <ShapeTypeConfig />}
      {(drawStyle === DrawStyle.Shape ||
        drawStyle === DrawStyle.MultiPoint) && <ShapeConutConfig />}
      {drawStyle === DrawStyle.Material && <MaterialConfig />}
      {drawStyle === DrawStyle.MultiColor && <MultiColorConfig />}
      {![DrawStyle.Text, DrawStyle.Wiggle, DrawStyle.Thorn].includes(
        drawStyle
      ) && (
        <div className="mt-2">
          <div className="font-bold text-base font-fredokaOne">Draw Width</div>
          <div className="flex items-center">
            <div className="text-lg font-fredokaOne mr-2 text-primary-focus">
              {drawWidth}
            </div>
            <input
              type="range"
              min="5"
              max="30"
              step="1"
              value={drawWidth}
              className="range range-primary range-xs"
              onChange={(e) => updateDrawWidth(Number(e.target.value))}
            />
          </div>
        </div>
      )}
      {/* color config */}
      {drawStyle !== DrawStyle.Rainbow && (
        <>
          <div className="form-control mt-3">
            <div className="font-bold text-base font-fredokaOne">
              Draw Color
            </div>
            <div className="mt-1 flex items-center w-full">
              {drawColors.map((color, i) => {
                return (
                  <div className="w-7 h-7 mr-2 indicator" key={i}>
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        handleDrawColors(e.target.value, i)
                      }}
                      className="colorInput"
                    />
                    {drawColors.length > 1 && (
                      <span
                        onClick={() => deleteDrawColor(i)}
                        className="indicator-item badge badge-secondary w-3 h-3 p-0 text-sm bg-black text-white border-black cursor-pointer block text-center"
                        style={{ lineHeight: '0.5rem' }}
                      >
                        x
                      </span>
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
        </>
      )}
      {[DrawStyle.Basic, DrawStyle.Material, DrawStyle.MultiColor].includes(
        drawStyle
      ) && <ShadowConfig />}
      {drawStyle === DrawStyle.Text && <DrawTextConfig />}
    </>
  )
}

export default FreeDrawConfig
