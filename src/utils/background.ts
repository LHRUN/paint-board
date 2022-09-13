import { CANVAS_ELE_TYPE } from './constants'

export class Background {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  color: string
  type: string

  constructor(
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    color: string
  ) {
    this.color = color
    this.canvas = canvas
    this.context = context
    this.type = CANVAS_ELE_TYPE.BACKGROUND
  }

  /**
   * 修改背景颜色
   */
  setBackgroundColor(color: string) {
    this.color = color
  }

  render() {
    this.context.save()
    this.context.rect(0, 0, this.canvas.width, this.canvas.height)
    this.context.fillStyle = this.color
    this.context.fill()
    this.context.restore()
  }
}
