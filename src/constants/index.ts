export const ActionMode = {
  DRAW: 'draw',
  ERASE: 'erase',
  SELECT: 'select',
  Board: 'board'
}

export const FREESTYLE_ELEMENT_CUSTOM_TYPE = {
  IMAGE: 'image',
  I_TEXT: 'itext',
  RAINBOW: 'rainbow',
  SHAPE: 'shape',
  PIXELS: 'pixels',
  DRAW_TEXT: 'drawText',
  MULTI_LINE: 'multiLine',
  RETICULATE: 'reticulate',
  MULTI_POINT: 'multiPoint',
  WIGGLE: 'wiggle',
  THORN: 'thorn'
}

export const SHAPE_ELEMENT_CUSTOM_TYPE = {
  SHAPE_LINE: 'shapeLine',
  SHAPE_RECT: 'shapeRect',
  SHAPE_CIRCLE: 'shapeCircle',
  SHAPE_ELLIPSE: 'shapeEllipse',
  SHAPE_TRIANGLE: 'shapeTriangle',
  SHAPE_ARROW_LINE: 'shapeArrowLine',
  SHAPE_ARROW_OUTLINE: 'shapeArrowOutline',
  SHAPE_CLOUD: 'shapeCloud',
  SHAPE_TOOLTIPS: 'shapeTooltips',
  SHAPE_LIGHTNING: 'shapeLightning',
  SHAPE_CLOSE: 'shapeClose',
  SHAPE_CHECK: 'shapeCheck',
  SHAPE_INFO: 'shapeInfo',
  SHAPE_BACKSPACE: 'shapeBackspace',
  SHAPE_BLOCK: 'shapeBlock',
  SHAPE_SPEAKER: 'shapeSpeaker',
  SHAPE_SEARCH: 'shapeSearch',
  SHAPE_INFO_OUTLINE: 'shapeInfoOutline',
  SHAPE_HEART: 'shapeHeart',
  SHAPE_ALERT: 'shapeAlert'
}

export const ELEMENT_CUSTOM_TYPE = {
  // freeStyle
  ...FREESTYLE_ELEMENT_CUSTOM_TYPE,

  // shape
  ...SHAPE_ELEMENT_CUSTOM_TYPE
}
