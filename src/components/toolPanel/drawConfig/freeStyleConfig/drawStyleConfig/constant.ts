import { DrawStyle } from '@/constants/draw'

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
