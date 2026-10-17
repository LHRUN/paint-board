import { DrawStyle } from '@/constants/draw'

interface StyleSwitchType {
  type: string
  text: string
  keyboard: string
}

export const styleSwitch: Record<string, Array<StyleSwitchType>> = {
  line_1: [
    {
      type: DrawStyle.Basic,
      text: 'style.basic',
      keyboard: 'Q'
    },
    {
      type: DrawStyle.Freehand,
      text: 'style.freehand',
      keyboard: 'W'
    },
    {
      type: DrawStyle.FreehandStroke,
      text: 'style.freehandStroke',
      keyboard: 'E'
    }
  ],
  line_2: [
    {
      type: DrawStyle.Rainbow,
      text: 'style.rainbow',
      keyboard: 'A'
    },
    {
      type: DrawStyle.Shape,
      text: 'style.shape',
      keyboard: 'S'
    },
    {
      type: DrawStyle.Material,
      text: 'style.material',
      keyboard: 'D'
    }
  ],
  line_3: [
    {
      type: DrawStyle.Pixels,
      text: 'style.pixels',
      keyboard: 'Z'
    },
    {
      type: DrawStyle.MultiColor,
      text: 'style.multiColor',
      keyboard: 'X'
    },
    {
      type: DrawStyle.Text,
      text: 'style.text',
      keyboard: 'C'
    }
  ],
  line_4: [
    {
      type: DrawStyle.MultiLine,
      text: 'style.multiLine',
      keyboard: 'R'
    },
    {
      type: DrawStyle.Reticulate,
      text: 'style.reticulate',
      keyboard: 'F'
    },
    {
      type: DrawStyle.MultiPoint,
      text: 'style.multiPoint',
      keyboard: 'V'
    }
  ],
  line_5: [
    {
      type: DrawStyle.Wiggle,
      text: 'style.wiggle',
      keyboard: 'T'
    },
    {
      type: DrawStyle.Thorn,
      text: 'style.thorn',
      keyboard: 'G'
    },
    {
      type: DrawStyle.Ink,
      text: 'style.ink',
      keyboard: 'B'
    }
  ]
}
