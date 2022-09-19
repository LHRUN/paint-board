export class CanvasElement {
  type: string // 元素类型
  layer: number // 图层
  constructor(type: string, layer: number) {
    this.type = type
    this.layer = layer
  }
}
