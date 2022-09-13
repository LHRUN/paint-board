import { CANVAS_ELE_TYPE } from './constants'

export class Background {
  color: string
  type: string

  constructor(color: string) {
    this.color = color
    this.type = CANVAS_ELE_TYPE.BACKGROUND
  }

  /**
   * 修改背景颜色
   */
  setBackgroundColor(color: string) {
    this.color = color
  }

  render(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
    context.save()
    context.rect(0, 0, canvas.width, canvas.height)
    context.fillStyle = this.color
    context.fill()
    context.restore()
  }
}
