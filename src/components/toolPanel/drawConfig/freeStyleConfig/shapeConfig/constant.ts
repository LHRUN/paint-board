import { DrawShape } from '@/constants/draw'

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
