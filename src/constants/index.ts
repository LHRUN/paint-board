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
  THORN: 'thorn',
  FREEHAND: 'freehand',
  FREEHAND_STROKE: 'freehandStroke',
  INK: 'ink'
}

export const SHAPE_ELEMENT_CUSTOM_TYPE = {
  SHAPE_LINE: 'shapeLine',
  SHAPE_ARROW_LINE: 'shapeArrowLine',
  SHAPE_RECTANGLE: 'shapeRectangle',
  SHAPE_CIRCLE: 'shapeCircle',
  SHAPE_TRIANGLE: 'shapeTriangle',
  SHAPE_PENTAGON: 'shapePentagon',
  SHAPE_HEXAGON: 'shapeHexagon',
  SHAPE_GRAPH: 'shapeGraph'
}

export const ELEMENT_CUSTOM_TYPE = {
  // freeStyle
  ...FREESTYLE_ELEMENT_CUSTOM_TYPE,

  // shape
  ...SHAPE_ELEMENT_CUSTOM_TYPE,

  // User-made group. Brush and shape groups keep their own custom types.
  GROUP: 'group'
}
