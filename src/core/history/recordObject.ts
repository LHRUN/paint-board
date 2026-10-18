/**
 * Record move, scale and rotate.
 * Fabric puts the transform name in `action`. A text content change fires
 * `object:modified` with no action, and that edit is stored when editing exits.
 * `_textBeforeEdit` stays at the pre-edit string afterwards, so it must not be
 * used to decide whether a later drag is a content edit.
 */
export const shouldRecordObjectModified = (event: {
  action?: string
  target?: unknown
}) => {
  return Boolean(event.action && event.target)
}
