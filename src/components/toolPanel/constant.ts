import { CANVAS_ELE_TYPE } from '@/utils/constants'
import { FreeDrawStyle } from '@/utils/element/freeDraw'

export const typeSwitch = [
  {
    type: CANVAS_ELE_TYPE.FREE_DRAW,
    text: '画笔'
  },
  {
    type: CANVAS_ELE_TYPE.ERASER,
    text: '橡皮擦'
  },
  {
    type: CANVAS_ELE_TYPE.SELECT,
    text: '选择'
  }
]

export const styleSwitch = {
  line_1: [
    {
      type: FreeDrawStyle.Basic,
      text: '单色'
    },
    {
      type: FreeDrawStyle.Shadow,
      text: '荧光'
    },
    {
      type: FreeDrawStyle.MultiColor,
      text: '多色'
    }
  ],
  line_2: [
    {
      type: FreeDrawStyle.Spray,
      text: '喷雾'
    },
    {
      type: FreeDrawStyle.Crayon,
      text: '蜡笔'
    },
    {
      type: FreeDrawStyle.Bubble,
      text: '泡泡'
    }
  ]
}

export const CHANGE_COLOR_TYPE = {
  UNI: 'uni',
  MULTI: 'multi'
}
