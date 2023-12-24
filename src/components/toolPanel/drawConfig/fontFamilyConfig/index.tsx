import useDrawStore from '@/store/draw'
import { FC } from 'react'

const fontFamilyRadio: Record<string, string> = {
  georgia: 'Georgia',
  fredokaOne: 'Fredoka One',
  hanaleiFill: 'Hanalei Fill',
  ruslanDisplay: 'Ruslan Display',
  lobster: 'Lobster',
  pacifico: 'Pacifico',
  gloriaHallelujah: 'Gloria Hallelujah'
}

interface IProps {
  fontFamily?: string
  changeFontFamily?: (fontFamily: string) => void
}

const FontFamilyConfg: FC<IProps> = ({ fontFamily, changeFontFamily }) => {
  const { textFontFamily, updateTextFontFamily } = useDrawStore()

  return (
    <>
      <div className="font-bold text-lg font-fredokaOne mt-3">Font Family</div>
      <div>
        {Object.keys(fontFamilyRadio).map((key) => (
          <label
            className="flex justify-between mt-2 w-full cursor-pointer"
            key={key}
          >
            <div
              style={{
                fontFamily: `${fontFamilyRadio[key]}, cursive`,
                fontSize: '14px'
              }}
            >
              {fontFamilyRadio[key]}
            </div>
            <input
              type="radio"
              name="radio-5"
              className="radio radio-success radio-sm"
              checked={(fontFamily || textFontFamily) === fontFamilyRadio[key]}
              onChange={() => {
                updateTextFontFamily(fontFamilyRadio[key])
                changeFontFamily?.(fontFamilyRadio[key])
              }}
            />
          </label>
        ))}
      </div>
    </>
  )
}

export default FontFamilyConfg
