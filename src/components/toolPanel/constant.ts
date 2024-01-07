import { ActionMode } from '@/constants'

export const modeSwitch = [
  {
    type: ActionMode.DRAW,
    text: 'tool.draw'
  },
  {
    type: ActionMode.ERASE,
    text: 'tool.eraser'
  },
  {
    type: ActionMode.SELECT,
    text: 'tool.select'
  },
  {
    type: ActionMode.Board,
    text: 'tool.board'
  }
]
