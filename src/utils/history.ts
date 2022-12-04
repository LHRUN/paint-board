import { ELEMENT_INSTANCE } from '@/types'
import { cloneDeep } from 'lodash'
import { at, compareVersion } from './common'
import { CANVAS_ELE_TYPE } from './constants'
import { calculateRect, FreeDraw, initRect } from './element/freeDraw'

export enum EACH_ORDER_TYPE {
  FIRST = 'first', // 顺序
  LAST = 'last' // 倒序
}

/**
 * 历史记录栈
 */
export class History<T> {
  cacheStack: Array<T[]>
  step: number
  constructor(cacheStack: T[], version: string) {
    formatHistory(<ELEMENT_INSTANCE[]>cacheStack, version)
    this.cacheStack = [cacheStack]
    this.step = 0
  }

  /**
   * 遍历cacheQueue
   * @param cb 遍历执行回调
   * @param order 倒叙 | 正序
   */
  each(cb?: (ele: T, i: number) => void, order = EACH_ORDER_TYPE.FIRST) {
    const cur = this.getCurrentStack()

    if (cur) {
      if (order === EACH_ORDER_TYPE.FIRST) {
        for (let i = 0; i < cur.length; i++) {
          cb?.(cur[i], i)
        }
      } else if (order === EACH_ORDER_TYPE.LAST) {
        for (let i = cur.length - 1; i >= 0; i--) {
          cb?.(cur[i], i)
        }
      }
    }
  }

  /**
   * 对缓存进行排序
   */
  sort(cb: (a: T, b: T) => number) {
    const last = at(this.cacheStack)
    last?.sort(cb)
  }

  /**
   * 添加数据
   */
  add(data: T) {
    // 如果在回退时添加数据就删除暂存数据
    if (this.step !== this.cacheStack.length - 1) {
      this.cacheStack.length = this.step + 1
    }

    const last = at(this.cacheStack)
    const newData = last ? [...cloneDeep(last), data] : [data]
    this.cacheStack.push(newData)
    this.step = this.cacheStack.length - 1
  }

  /**
   * 根据条件删除
   * @param key 删除条件匹配的key
   * @param value 删除条件匹配的值
   */
  delete<K extends keyof T>(key: K, value: T[K]) {
    if (this.step !== this.cacheStack.length - 1) {
      this.cacheStack.length = this.step + 1
    }
    const last = cloneDeep(at(this.cacheStack)) as T[]
    const newData =
      last?.filter((item) => {
        if (item && Object.hasOwn(item, key)) {
          return item[key] !== value
        }
        return false
      }) ?? []
    this.cacheStack.push(newData)
    this.step = this.cacheStack.length - 1
  }

  /**
   * 根据坐标删除
   * @param index 下标
   */
  deleteByIndex(index: number) {
    if (this.step !== this.cacheStack.length - 1) {
      this.cacheStack.length = this.step + 1
    }
    const newData = cloneDeep(at(this.cacheStack)) as T[]
    newData.splice(index, 1)
    this.cacheStack.push(newData)
    this.step = this.cacheStack.length - 1
  }

  /**
   * 后退
   */
  undo() {
    if (this.step >= 0) {
      this.step--
      return this.cacheStack[this.step]
    }
  }

  /**
   * 前进
   */
  redo() {
    if (this.step < this.cacheStack.length - 1) {
      this.step++
      return this.cacheStack[this.step]
    }
  }

  /**
   * 清空
   */
  clean() {
    this.cacheStack = []
    this.step = -1
  }

  /**
   * 获取当前层
   */
  getCurrentStack() {
    return at(this.cacheStack, this.step < 0 ? 0 : this.step) as T[]
  }

  /**
   * 缓存栈插入数据
   * @param newData 插入数据
   * @param replaceData 需替换的数据
   * @returns 缓存栈
   */
  pushStack(newData: T[], replaceData?: T[]) {
    if (this.step !== this.cacheStack.length - 1) {
      this.cacheStack.length = this.step + 1
    }
    this.cacheStack.push(cloneDeep(newData))
    if (replaceData) {
      this.cacheStack[this.cacheStack.length - 2] = cloneDeep(replaceData)
    }
    this.step = this.cacheStack.length - 1
    return this.cacheStack
  }
}

/**
 * 处理历史记录栈格式，主要用于版本兼容
 * @param stack
 */
export const formatHistory = (stack: ELEMENT_INSTANCE[], version: string) => {
  if (compareVersion(version, '0.2.0') < 0) {
    stack.forEach((ele) => {
      // 兼容类型，类型已修改
      if (ele.type === 'freeLine') {
        ele.type = CANVAS_ELE_TYPE.FREE_DRAW
      } else if (ele.type === 'cleanLine') {
        ele.type = CANVAS_ELE_TYPE.ERASER
      }

      // 0.2.0增加选择模式，兼容矩形数据
      if (ele.type === CANVAS_ELE_TYPE.FREE_DRAW) {
        initRect(<FreeDraw>ele)
        ;(<FreeDraw>ele).positions.forEach((position) => {
          calculateRect(<FreeDraw>ele, position)
        })
      }
    })
  }
}
