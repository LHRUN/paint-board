/**
 * Palette edits from select mode rebuild the multi-color brush through
 * updateDrawColors. That rebuild also turns drawing mode on, so it only
 * belongs while the board is already in draw mode.
 * Entering draw mode calls renderMultiColor itself, before the mode store
 * updates, and does not use this check.
 */
export const shouldApplyMultiColorBrush = (mode: string) => mode === 'draw'
