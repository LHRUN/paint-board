import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, GripVertical } from 'lucide-react'
import { ObjectListRow } from '@/core/element/layer/objectList'

interface IProps {
  row: ObjectListRow
  onSelect: () => void
  onToggleVisible: () => void
}

const ObjectItem: FC<IProps> = ({ row, onSelect, onToggleVisible }) => {
  const { t } = useTranslation()
  const iconColor = row.selected ? '#fff' : '#66CC8A'

  return (
    <li
      className={`flex items-center justify-between flex-row my-1 px-2 rounded-lg overflow-hidden group cursor-pointer h-12 transition-all duration-200 ${
        row.selected ? 'bg-primary' : 'hover:bg-slate-100'
      } ${row.visible ? '' : 'opacity-50'}`}
      onClick={onSelect}
    >
      <span
        className={`w-full truncate ${
          row.selected ? 'text-white font-semibold' : ''
        }`}
      >
        {t(row.labelKey)}
        {row.detail ? (
          <span className={row.selected ? 'font-normal' : 'text-slate-500'}>
            {` ${row.detail}`}
          </span>
        ) : null}
      </span>
      <span className="ml-5 flex items-center gap-x-2 shrink-0">
        <span
          onClick={(event) => {
            event.stopPropagation()
            onToggleVisible()
          }}
        >
          {row.visible ? (
            <Eye color={iconColor} size={16} />
          ) : (
            <EyeOff color={iconColor} size={16} />
          )}
        </span>
        <GripVertical
          className="drag-object-list-handle hidden group-hover:block xs:block cursor-grab"
          color={iconColor}
          size={16}
          onClick={(event) => {
            event.stopPropagation()
          }}
        />
      </span>
    </li>
  )
}

export default ObjectItem
