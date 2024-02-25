import { ShapeStyle } from '@/constants/shape'

import LineIcon from '@/components/icons/shapeStyle/line.svg?react'
import RectIcon from '@/components/icons/shapeStyle/rect.svg?react'
import CircleIcon from '@/components/icons/shapeStyle/circle.svg?react'
import EllipseIcon from '@/components/icons/shapeStyle/ellipse.svg?react'
import TriangleIcon from '@/components/icons/shapeStyle/triangle.svg?react'
import ArrowLineIcon from '@/components/icons/shapeStyle/arrowLine.svg?react'
import ArrowOutlineIcon from '@/components/icons/shapeStyle/arrowOutline.svg?react'
import CloudIcon from '@/components/icons/shapeStyle/cloud.svg?react'
import TooltipsIcon from '@/components/icons/shapeStyle/tooltips.svg?react'
import LightningIcon from '@/components/icons/shapeStyle/lightning.svg?react'
import CloseIcon from '@/components/icons/shapeStyle/close.svg?react'
import CheckIcon from '@/components/icons/shapeStyle/check.svg?react'
import InfoIcon from '@/components/icons/shapeStyle/info.svg?react'
import BackspaceIcon from '@/components/icons/shapeStyle/backspace.svg?react'
import BlockIcon from '@/components/icons/shapeStyle/block.svg?react'
import SpeakerIcon from '@/components/icons/shapeStyle/speaker.svg?react'
import SearchIcon from '@/components/icons/shapeStyle/search.svg?react'
import InfoOutlineIcon from '@/components/icons/shapeStyle/infoOutline.svg?react'
import HeartIcon from '@/components/icons/shapeStyle/heart.svg?react'
import AlertIcon from '@/components/icons/shapeStyle/alert.svg?react'

interface ShapeStyleSwitchType {
  type: string
  icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined
    }
  >
}

export const shapeStyleSwitch: Record<string, Array<ShapeStyleSwitchType>> = {
  line_1: [
    {
      type: ShapeStyle.Line,
      icon: LineIcon
    },
    {
      type: ShapeStyle.Rect,
      icon: RectIcon
    },
    {
      type: ShapeStyle.Circle,
      icon: CircleIcon
    },
    {
      type: ShapeStyle.Ellipse,
      icon: EllipseIcon
    },
    {
      type: ShapeStyle.Triangle,
      icon: TriangleIcon
    }
  ],
  line_2: [
    {
      type: ShapeStyle.ArrowLine,
      icon: ArrowLineIcon
    },
    {
      type: ShapeStyle.ArrowOutline,
      icon: ArrowOutlineIcon
    },
    {
      type: ShapeStyle.Cloud,
      icon: CloudIcon
    },
    {
      type: ShapeStyle.Tooltips,
      icon: TooltipsIcon
    },
    {
      type: ShapeStyle.Lightning,
      icon: LightningIcon
    }
  ],
  line_3: [
    {
      type: ShapeStyle.Close,
      icon: CloseIcon
    },
    {
      type: ShapeStyle.Check,
      icon: CheckIcon
    },
    {
      type: ShapeStyle.Info,
      icon: InfoIcon
    },
    {
      type: ShapeStyle.Backspace,
      icon: BackspaceIcon
    },
    {
      type: ShapeStyle.Block,
      icon: BlockIcon
    }
  ],
  line_4: [
    {
      type: ShapeStyle.Speaker,
      icon: SpeakerIcon
    },
    {
      type: ShapeStyle.Search,
      icon: SearchIcon
    },
    {
      type: ShapeStyle.InfoOutline,
      icon: InfoOutlineIcon
    },
    {
      type: ShapeStyle.Heart,
      icon: HeartIcon
    },
    {
      type: ShapeStyle.Alert,
      icon: AlertIcon
    }
  ]
}
