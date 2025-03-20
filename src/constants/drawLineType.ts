import SolidIcon from '@/components/icons/drawLineType/solid.svg?react'
import DashedIcon from '@/components/icons/drawLineType/dashed.svg?react'
import DottedIcon from '@/components/icons/drawLineType/dotted.svg?react'

export const DrawLineType = {
  Solid: 'solid',
  Dashed: 'dashed',
  Dotted: 'dotted'
}

interface DrawLineTypeSwitchType {
  type: string
  icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined
    }
  >
}

export const drawLineTypeSwitch: Record<
  string,
  Array<DrawLineTypeSwitchType>
> = {
  line_1: [
    {
      type: DrawLineType.Solid,
      icon: SolidIcon
    },
    {
      type: DrawLineType.Dashed,
      icon: DashedIcon
    },
    {
      type: DrawLineType.Dotted,
      icon: DottedIcon
    }
  ]
}
