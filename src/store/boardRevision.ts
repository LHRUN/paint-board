import { diff } from 'jsondiffpatch'

/**
 * Fabric may rewrite key order when a board is saved again.
 * A structural diff ignores that and only reports real content changes.
 */
export const boardDataChanged = (previous: unknown, next: unknown) =>
  diff(previous ?? {}, next ?? {}) !== undefined

export const nextContentRevision = (
  current: number | undefined,
  changed: boolean
) => (changed ? (current ?? 0) + 1 : current ?? 0)

export const contentRevisionOf = (current: number | undefined) => current ?? 0
