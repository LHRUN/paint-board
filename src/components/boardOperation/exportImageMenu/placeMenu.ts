export interface MenuRect {
  left: number
  top: number
  width: number
  height: number
}

export const placeMenu = (
  anchor: MenuRect,
  menu: { width: number; height: number },
  viewport: { width: number; height: number },
  gap = 8
) => {
  let top = anchor.top - menu.height - gap
  const below = anchor.top + anchor.height + gap
  if (top < gap) {
    if (below + menu.height <= viewport.height - gap) {
      top = below
    } else {
      top = Math.max(gap, viewport.height - menu.height - gap)
    }
  }

  const centered = anchor.left + anchor.width / 2 - menu.width / 2
  const maxLeft = Math.max(gap, viewport.width - menu.width - gap)
  const left = Math.min(Math.max(gap, centered), maxLeft)
  return { top, left }
}
