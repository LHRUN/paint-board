import { useState } from 'react'
import AddColorIcon from '@/components/icons/addColor.svg?react'
import ClearIcon from '@/components/icons/clear.svg?react'
import EditIcon from '@/components/icons/edit.svg?react'

interface IProps {
  label: string
  inputId: string
  colors: string[]
  activeIndexes: number[]
  maxColors?: number
  /** Label and swatches share one row and do not wrap. */
  inline?: boolean
  onSelect: (index: number) => void
  onEditStart?: (index: number) => void
  onEdit: (color: string, index: number) => void
  onEditEnd?: (color: string, index: number) => void
  onAdd: () => void
  onDelete: (index: number) => void
}

const ColorSwatchList = ({
  label,
  inputId,
  colors,
  activeIndexes,
  maxColors = 6,
  inline = false,
  onSelect,
  onEditStart,
  onEdit,
  onEditEnd,
  onAdd,
  onDelete
}: IProps) => {
  const [editColorIndex, setEditColorIndex] = useState(-1)
  const editingColor =
    editColorIndex >= 0 ? colors[editColorIndex] : colors[0] || '#000000'

  const swatches = (
    <div
      className={`flex flex-nowrap items-center gap-x-2 relative ${
        inline ? '' : 'mt-1 pb-1 w-full'
      }`}
    >
      {colors.map((color, colorIndex) => (
        <div
          className={`relative w-6 h-6 transition-all duration-300 ${
            activeIndexes.includes(colorIndex) ? 'w-7' : ''
          }`}
          key={colorIndex}
        >
          <div
            className={`absolute top-0 left-0 shrink-0 flex items-center justify-between w-6 bg-gray-200 overflow-hidden join hover:w-20 hover:z-10 transition-all duration-300 ring-offset-1 ${
              activeIndexes.includes(colorIndex)
                ? 'ring-2 ring-primary mx-1'
                : 'hover:ring-2 ring-base-200'
            }`}
          >
            <div
              className="shrink-0 w-6 h-6 rounded-sm cursor-pointer join-item"
              style={{ background: color }}
              onClick={() => {
                onSelect(colorIndex)
              }}
            ></div>
            <label
              htmlFor={inputId}
              onClick={() => {
                setEditColorIndex(colorIndex)
                onEditStart?.(colorIndex)
              }}
            >
              <EditIcon className="shrink-0 w-5 h-5 cursor-pointer join-item hover:opacity-80" />
            </label>
            <ClearIcon
              className="shrink-0 w-4 h-4 mr-1 cursor-pointer join-item hover:opacity-80"
              onClick={() => {
                if (editColorIndex === colorIndex) {
                  setEditColorIndex(-1)
                }
                onDelete(colorIndex)
              }}
            />
          </div>
        </div>
      ))}
      {colors.length < maxColors && (
        <AddColorIcon
          className="w-6 h-6 cursor-pointer hover:opacity-60"
          onClick={onAdd}
        />
      )}
      <input
        id={inputId}
        type="color"
        value={editingColor}
        onInput={(event) => {
          if (editColorIndex >= 0) {
            onEdit((event.target as HTMLInputElement).value, editColorIndex)
          }
        }}
        onBlur={(event) => {
          if (editColorIndex >= 0) {
            onEditEnd?.(
              (event.target as HTMLInputElement).value,
              editColorIndex
            )
          }
        }}
        className={`w-0 h-0 opacity-0 absolute top-7 left-${
          editColorIndex * 7
        }`}
      />
    </div>
  )

  if (inline) {
    return (
      <div className="mt-2 flex items-center">
        <div className="font-bold text-sm font-fredokaOne w-20 shrink-0 text-right">
          {label}
        </div>
        <div className="ml-2">{swatches}</div>
      </div>
    )
  }

  return (
    <div className="form-control mt-2">
      <div className="font-bold text-sm font-fredokaOne">{label}</div>
      {swatches}
    </div>
  )
}

export default ColorSwatchList
