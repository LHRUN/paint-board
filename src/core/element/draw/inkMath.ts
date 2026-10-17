export const INK_WIDTH = 30
export const INK_AMOUNT = 7
export const INK_BASE_WIDTH = 20
export const INK_SPLASH_DISTANCE = 30
export const INK_SPLASH_COUNT = 12

export const inkBristleCount = (width: number) => width / 5 + INK_BASE_WIDTH

/**
 * Slow movement stays at 20% of the brush width.
 * Faster movement thins the ink.
 */
export const inkStrokeWidth = (width: number, screenDistance: number) => {
  const amount = INK_AMOUNT / (screenDistance + 1)
  const ratio = amount > 0.3 ? 0.2 : amount < 0 ? 0 : amount
  return width * ratio
}

export const inkShouldSplash = (screenDistance: number) =>
  screenDistance > INK_SPLASH_DISTANCE

export const inkBristleOffset = (range: number, random: () => number) => {
  const rx = random() * range
  const turn = random() * Math.PI * 2
  const x0 = rx * Math.sin(turn)
  const y0 = (rx / 2) * Math.cos(turn)
  const spin = random() * Math.PI * 2
  const cos = Math.cos(spin)
  const sin = Math.sin(spin)
  return {
    x: x0 * cos - y0 * sin,
    y: x0 * sin + y0 * cos
  }
}

export const inkSplashCount = (random: () => number) =>
  random() * INK_SPLASH_COUNT

export const inkSplashOffset = (random: () => number) => {
  const reach = INK_AMOUNT * 10
  const distance = random() * (reach - 1) + 1
  const angle = random() * Math.PI * 2
  return {
    x: distance * Math.sin(angle),
    y: distance * Math.cos(angle),
    radius: (random() * INK_AMOUNT) / 2
  }
}
