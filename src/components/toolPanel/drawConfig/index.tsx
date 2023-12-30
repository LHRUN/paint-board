import { useTranslation } from 'react-i18next'
import useDrawStore from '@/store/draw'
import { DrawStyle } from '@/constants'
import { styleSwitch } from './constant'

import ShapeConfig from './shapeConfig'
import ShadowConfig from './shadowConfig'
import DrawTextConfig from './drawTextConfig'
import MaterialConfig from './materialConfig'
import MultiColorConfig from './multiColorConfig'

const DrawConfig = () => {
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
      <div className="mt-3">
        <div className="font-bold text-lg font-fredokaOne">Draw Style</div>
        {Object.keys(styleSwitch).map((lineKey) => (
          <div key={lineKey} className="btn-group mt-1 flex">
            {styleSwitch[lineKey].map(({ type, text }) => (
              <button
                key={type}
                className={`btn btn-sm flex-grow font-fredokaOne text-xs ${
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
      {drawStyle === DrawStyle.Shape && <ShapeConfig />}
      {drawStyle === DrawStyle.Material && <MaterialConfig />}
      {drawStyle === DrawStyle.MultiColor && <MultiColorConfig />}
      {drawStyle !== DrawStyle.Text && (
        <div className="mt-3">
          <div className="font-bold text-lg font-fredokaOne">Draw Width</div>
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
      )}
      {/* color config */}
      {drawStyle !== DrawStyle.Rainbow && (
        <>
          <div className="form-control mt-3">
            <div className="font-bold text-lg font-fredokaOne">Draw Color</div>
            <div className="mt-1 flex items-center w-full">
              {drawColors.map((color, i) => {
                return (
                  <div className="w-8 h-8 mr-2 indicator" key={i}>
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
                <div
                  className="w-8 h-8 rounded-sm border-dashed border-2 border-black text-center leading-6 text-2xl box-border cursor-pointer"
                  onClick={() => {
                    handleDrawColors('#000000', drawColors.length)
                  }}
                >
                  +
                </div>
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

export default DrawConfig
