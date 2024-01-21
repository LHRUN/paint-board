import { ShapeBorderType } from '@/constants/shape'

import SolidIcon from '@/components/icons/shapeBorderType/solid.svg?react'
import DashedIcon from '@/components/icons/shapeBorderType/dashed.svg?react'
import DottedIcon from '@/components/icons/shapeBorderType/dotted.svg?react'

interface BorderTypeSwitchType {
  type: string
  icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined
    }
  >
}

export const borderTypeSwitch: Record<string, Array<BorderTypeSwitchType>> = {
  line_1: [
    {
      type: ShapeBorderType.Solid,
      icon: SolidIcon
    },
    {
      type: ShapeBorderType.Dashed,
      icon: DashedIcon
    },
    {
      type: ShapeBorderType.Dotted,
      icon: DottedIcon
    }
  ]
}
