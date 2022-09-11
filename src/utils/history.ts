export class History {
  stack: string[]
  step: number
  constructor() {
    this.stack = []
    this.step = 0
  }

  // 添加
  add(data: string) {
    this.stack.push(data)
    this.step = this.stack.length - 1
  }

  // 后退
  undo() {
    if (this.step > 0) {
      this.step--
      console.log(this.step, this.stack[this.step])
      return this.stack[this.step]
    }
  }

  // 前进
  redo() {
    if (this.step < this.stack.length - 1) {
      this.step++
      return this.stack[this.step]
    }
  }

  // 清空
  clean() {
    this.stack = []
    this.step = 0
  }
}
