/**
 * Fabric overwrites lockMovement*, hasControls and selectable while an IText
 * is editing, and restores them before text:editing:exited. That exit already
 * records history, so a snapshot taken during the session would keep the
 * temporary flags.
 */
export const canSnapshotTextChange = (
  objects: ReadonlyArray<{ isEditing?: boolean }>
) => objects.every((object) => object.isEditing !== true)
