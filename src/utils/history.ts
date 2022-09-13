import { ELEMENT_INSTANCE } from '@/types'

// 执行历史记录
export class History {
  stack: ELEMENT_INSTANCE[]
  step: number
  constructor(stack: ELEMENT_INSTANCE[]) {
    this.stack = stack
    this.step = 0
  }

  // 遍历stack
  each(cb: (ele: ELEMENT_INSTANCE) => any) {
    for (let i = 0; i < this.step; i++) {
      cb(this.stack[i])
    }
  }

  // 添加
  add(data: ELEMENT_INSTANCE) {
    this.stack.push(data)
    this.step = this.stack.length - 1
  }

  // 后退
  undo() {
    if (this.step > 0) {
      this.step--
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
