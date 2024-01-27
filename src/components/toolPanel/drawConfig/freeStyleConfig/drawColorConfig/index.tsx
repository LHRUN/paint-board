import AddColorIcon from '@/components/icons/addColor.svg?react'
import useDrawStore from '@/store/draw'

const DrawColorConfig = () => {
  const { drawColors, updateDrawColors } = useDrawStore()

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
      <div className="font-bold text-base font-fredokaOne">Draw Color</div>
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
  )
}

export default DrawColorConfig
