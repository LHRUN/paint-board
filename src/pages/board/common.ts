import { MousePosition } from '@/types/mouse'

export const drawLine = (
  context: CanvasRenderingContext2D,
  start: MousePosition,
  end: MousePosition,
  width: number,
  color: string
) => {
  context.beginPath()
  context.lineWidth = width
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.moveTo(start.x, start.y)
  context.lineTo(end.x, end.x)
  context.strokeStyle = color
  context.stroke()
}
