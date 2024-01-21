import { DrawStyle, DrawShape } from '@/constants/draw'
import { formatPublicUrl } from '@/utils/common'
import { MATERIAL_TYPE } from '@/utils/element/draw/material'

import BubbleIcon from '@/components/icons/shape/bubble.svg?react'
import StarIcon from '@/components/icons/shape/star.svg?react'
import LoveIcon from '@/components/icons/shape/love.svg?react'
import ButterflyIcon from '@/components/icons/shape/butterfly.svg?react'
import SnowIcon from '@/components/icons/shape/snow.svg?react'
import MusicIcon from '@/components/icons/shape/music.svg?react'
import SunIcon from '@/components/icons/shape/sun.svg?react'
import MoonIcon from '@/components/icons/shape/moon.svg?react'
import LeafIcon from '@/components/icons/shape/leaf.svg?react'
import FlowerIcon from '@/components/icons/shape/flower.svg?react'

interface StyleSwitchType {
  type: string
  text: string
}

export const styleSwitch: Record<string, Array<StyleSwitchType>> = {
  line_1: [
    {
      type: DrawStyle.Basic,
      text: 'style.basic'
    },
    {
      type: DrawStyle.Rainbow,
      text: 'style.rainbow'
    },
    {
      type: DrawStyle.Shape,
      text: 'style.shape'
    }
  ],
  line_2: [
    {
      type: DrawStyle.Material,
      text: 'style.material'
    },
    {
      type: DrawStyle.Pixels,
      text: 'style.pixels'
    },
    {
      type: DrawStyle.MultiColor,
      text: 'style.multiColor'
    }
  ],
  line_3: [
    {
      type: DrawStyle.Text,
      text: 'style.text'
    },
    {
      type: DrawStyle.MultiLine,
      text: 'style.multiLine'
    },
    {
      type: DrawStyle.Reticulate,
      text: 'style.reticulate'
    }
  ],
  line_4: [
    {
      type: DrawStyle.MultiPoint,
      text: 'style.multiPoint'
    },
    {
      type: DrawStyle.Wiggle,
      text: 'style.wiggle'
    },
    {
      type: DrawStyle.Thorn,
      text: 'style.thorn'
    }
  ]
}

export const MaterialSwitch = [
  {
    type: MATERIAL_TYPE.CARBON,
    image: formatPublicUrl(`pattern/carbon.png`)
  },
  {
    type: MATERIAL_TYPE.CLOTH,
    image: formatPublicUrl(`pattern/cloth.png`)
  },
  {
    type: MATERIAL_TYPE.CRAYON,
    image: formatPublicUrl(`pattern/crayon.png`)
  },
  {
    type: MATERIAL_TYPE.OIL,
    image: formatPublicUrl(`pattern/oil.png`)
  },
  {
    type: MATERIAL_TYPE.CRAYON_DARK,
    image: formatPublicUrl(`pattern/crayonDark.png`)
  }
]

interface ShapeSwitchType {
  type: string
  icon: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & {
      title?: string | undefined
    }
  >
}
export const shapeSwitch: Record<string, Array<ShapeSwitchType>> = {
  line_1: [
    {
      type: DrawShape.Bubble,
      icon: BubbleIcon
    },
    {
      type: DrawShape.Star,
      icon: StarIcon
    },
    {
      type: DrawShape.Love,
      icon: LoveIcon
    },
    {
      type: DrawShape.Butterfly,
      icon: ButterflyIcon
    },
    {
      type: DrawShape.Snow,
      icon: SnowIcon
    }
  ],
  line_2: [
    {
      type: DrawShape.Music,
      icon: MusicIcon
    },
    {
      type: DrawShape.Sun,
      icon: SunIcon
    },
    {
      type: DrawShape.Moon,
      icon: MoonIcon
    },
    {
      type: DrawShape.Leaf,
      icon: LeafIcon
    },
    {
      type: DrawShape.Flower,
      icon: FlowerIcon
    }
  ]
}
