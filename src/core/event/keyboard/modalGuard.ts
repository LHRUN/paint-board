/**
 * An open modal dialog owns the keyboard. Canvas shortcuts must not delete,
 * copy, undo, or change tools while one is showing.
 */
export const isModalDialogOpen = (
  root: { querySelector: (selector: string) => unknown } | null
) => {
  return !!root?.querySelector('dialog[open]')
}
