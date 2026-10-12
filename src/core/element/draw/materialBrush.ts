/**
 * A material texture may finish loading after the user has already changed brushes.
 */
export const shouldApplyMaterialBrush = (input: {
  mode: string
  drawType: string
  drawStyle: string
  canvasMatches: boolean
  generationMatches: boolean
}) =>
  input.mode === 'draw' &&
  input.drawType === 'freeStyle' &&
  input.drawStyle === 'material' &&
  input.canvasMatches &&
  input.generationMatches
