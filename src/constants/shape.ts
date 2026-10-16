export const StrokeStyleType = {
  Solid: 'solid',
  Dashed: 'dashed',
  Dotted: 'dotted',
  Sketch: 'sketch'
}

export const FillStyleType = {
  Transparent: 'transparent',
  Solid: 'solid',
  Hachure: 'hachure',
  CrossHatch: 'crossHatch',
  ZigZag: 'zigZag',
  Dots: 'dots'
}

export const FILLABLE_GRAPH_ICONS = [
  'MessageCircle',
  'MessageSquare',
  'Cloud',
  'Badge',
  'Heart',
  'Zap',
  'Flame',
  'Moon',
  'Folder',
  'Sparkle',
  'Star'
]

export const isFillableGraphIcon = (icon: string) => {
  return (FILLABLE_GRAPH_ICONS as readonly string[]).includes(icon)
}
