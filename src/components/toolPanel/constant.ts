import { CANVAS_ELE_TYPE } from '@/utils/constants'
import { FreeDrawStyle } from '@/utils/element/freeDraw'

export const typeSwitch = [
  {
    type: CANVAS_ELE_TYPE.FREE_DRAW,
    text: 'tool.draw'
  },
  {
    type: CANVAS_ELE_TYPE.ERASER,
    text: 'tool.eraser'
  },
  {
    type: CANVAS_ELE_TYPE.SELECT,
    text: 'tool.select'
  },
  {
    type: CANVAS_ELE_TYPE.RENDER,
    text: 'tool.render'
  }
]

export const styleSwitch = {
  line_1: [
    {
      type: FreeDrawStyle.Basic,
      text: 'style.basic'
    },
    {
      type: FreeDrawStyle.Shadow,
      text: 'style.shadow'
    },
    {
      type: FreeDrawStyle.MultiColor,
      text: 'style.multicolor'
    }
  ],
  line_2: [
    {
      type: FreeDrawStyle.Spray,
      text: 'style.spray'
    },
    {
      type: FreeDrawStyle.Crayon,
      text: 'style.crayon'
    },
    {
      type: FreeDrawStyle.Bubble,
      text: 'style.bubble'
    }
  ]
}

export const CHANGE_COLOR_TYPE = {
  UNI: 'uni',
  MULTI: 'multi'
}
