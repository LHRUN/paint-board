/**
 * 历史记录栈
 */
export class History<T> {
  stack: T[]
  step: number
  constructor(stack: T[]) {
    this.stack = stack
    this.step = stack.length - 1
  }

  /**
   * 遍历stack
   * @param cb 遍历执行回调
   */
  each(cb?: (ele: T) => void) {
    for (let i = 0; i <= this.step; i++) {
      cb?.(this.stack[i])
    }
  }

  /**
   * 添加数据
   * @param data
   */
  add(data: T) {
    // 如果在回退时添加数据就删除暂存数据
    if (this.step !== this.stack.length - 1) {
      this.stack.length = this.step + 1
    }
    this.stack.push(data)
    this.step = this.stack.length - 1
  }

  /**
   * 后退
   */
  undo() {
    if (this.step >= 0) {
      this.step--
      return this.stack[this.step]
    }
  }

  /**
   * 前进
   */
  redo() {
    if (this.step < this.stack.length - 1) {
      this.step++
      return this.stack[this.step]
    }
  }

  /**
   * 清空
   */
  clean() {
    this.stack = []
    this.step = -1
  }
}
