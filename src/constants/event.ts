import { ActionMode } from '.'
import { DrawStyle, DrawType } from './draw'

export enum KeyCode {
  SPACE = 'Space',
  BACKSPACE = 'Backspace',
  DIGIT_1 = 'Digit1',
  DIGIT_2 = 'Digit2',
  DIGIT_3 = 'Digit3',
  DIGIT_4 = 'Digit4',
  DIGIT_5 = 'Digit5',
  DIGIT_6 = 'Digit6',
  KEY_Q = 'KeyQ',
  KEY_W = 'KeyW',
  KEY_E = 'KeyE',
  KEY_R = 'KeyR',
  KEY_A = 'KeyA',
  KEY_S = 'KeyS',
  KEY_D = 'KeyD',
  KEY_F = 'KeyF',
  KEY_Z = 'KeyZ',
  KEY_X = 'KeyX',
  KEY_C = 'KeyC',
  KEY_T = 'KeyT',
  KEY_G = 'KeyG',
  KEY_V = 'KeyV',
  KEY_B = 'KeyB',
  BRACKET_LEFT = 'BracketLeft', // [
  BRACKET_RIGHT = 'BracketRight', // ]
  ARROW_UP = 'ArrowUp',
  ARROW_DOWN = 'ArrowDown',
  ARROW_LEFT = 'ArrowLeft',
  ARROW_RIGHT = 'ArrowRight',
  EQUAL = 'Equal', // +
  MINUS = 'Minus', // -
  DIGIT_0 = 'Digit0', // digit 0
  NUMPAD_ADD = 'NumpadAdd', // numpad +
  NUMPAD_SUBTRACT = 'NumpadSubtract', // numpad -
  NUMPAD_0 = 'Numpad0' // numpad 0
}

export const KeyCodeModeMap = {
  [KeyCode.DIGIT_1]: ActionMode.DRAW,
  [KeyCode.DIGIT_2]: ActionMode.ERASE,
  [KeyCode.DIGIT_3]: ActionMode.SELECT,
  [KeyCode.DIGIT_4]: ActionMode.Board
}

export const KeyCodeDrawTypeMap = {
  [KeyCode.DIGIT_5]: DrawType.FreeStyle,
  [KeyCode.DIGIT_6]: DrawType.Shape
}

export const KeyCodeDrawStyleMap = {
  [KeyCode.KEY_Q]: DrawStyle.Basic,
  [KeyCode.KEY_W]: DrawStyle.Freehand,
  [KeyCode.KEY_E]: DrawStyle.FreehandStroke,
  [KeyCode.KEY_A]: DrawStyle.Rainbow,
  [KeyCode.KEY_S]: DrawStyle.Shape,
  [KeyCode.KEY_D]: DrawStyle.Material,
  [KeyCode.KEY_Z]: DrawStyle.Pixels,
  [KeyCode.KEY_X]: DrawStyle.MultiColor,
  [KeyCode.KEY_C]: DrawStyle.Text,
  [KeyCode.KEY_R]: DrawStyle.MultiLine,
  [KeyCode.KEY_F]: DrawStyle.Reticulate,
  [KeyCode.KEY_V]: DrawStyle.MultiPoint,
  [KeyCode.KEY_T]: DrawStyle.Wiggle,
  [KeyCode.KEY_G]: DrawStyle.Thorn,
  [KeyCode.KEY_B]: DrawStyle.Ink
}
