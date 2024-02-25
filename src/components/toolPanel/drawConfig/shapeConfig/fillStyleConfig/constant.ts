import { ShapeFillType } from '@/constants/shape'
import TransparentIcon from '@/components/icons/shapeFill/transparent.svg?react'
import FillFullIcon from '@/components/icons/shapeFill/fillFull.svg?react'

interface FillTypeSwitchType {
  type: string
  icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined
    }
  >
}

export const FillTypeSwitch: Array<FillTypeSwitchType> = [
  {
    type: ShapeFillType.Transparent,
    icon: TransparentIcon
  },
  {
    type: ShapeFillType.Full,
    icon: FillFullIcon
  }
]
