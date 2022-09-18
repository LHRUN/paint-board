export interface ILayer {
  id: number
  title: string
  show: boolean
}

/**
 * 图层
 */
export class Layer {
  queue: ILayer[] // 图层队列
  id: number // 用于简单的自增id处理
  current: number // 当前图层
  render: () => void // 画板渲染事件

  /**
   * constructor
   * @param render 画板渲染事件
   * @param initData 初始化数据
   */
  constructor(render: () => void, initData?: Layer) {
    const {
      queue = [
        {
          id: 1,
          title: 'item1',
          show: true
        }
      ],
      id = 1,
      current = 1
    } = initData || {}
    this.queue = queue
    this.id = id
    this.current = current
    this.render = render
  }

  /**
   * 添加图层
   */
  add() {
    const id = ++this.id

    this.queue.unshift({
      id,
      title: `item${id}`,
      show: true
    })
    this.current = id
    this.render()
  }

  /**
   * 删除图层
   * @param id 图层id
   */
  delete(id: number) {
    if (this.queue.length > 1) {
      this.queue = this.queue.filter((item) => item.id !== id)
      this.current = this.queue[0].id
      this.render()
    }
  }

  /**
   * 拖拽交换图层
   * @param dragIndex
   * @param dropIndex
   */
  swap(dragIndex: number, dropIndex: number) {
    ;[this.queue[dragIndex], this.queue[dropIndex]] = [
      this.queue[dropIndex],
      this.queue[dragIndex]
    ]
  }

  /**
   * 更新图层标题
   * @param id 图层id
   * @param title 图层标题
   */
  updateTitle(id: number, title: string) {
    this.queue.forEach((item) => {
      if (item.id === id) {
        item.title = title
      }
    })
    this.render()
  }

  /**
   * 更新图层展示状态
   * @param id 图层id
   * @param show 图层展示状态
   */
  updateShow(id: number, show: boolean) {
    this.queue.forEach((item) => {
      if (item.id === id) {
        item.show = show
      }
    })
    this.render()
  }

  /**
   * 更新当前图层
   * @param id 图层id
   */
  updateCurrent(id: number) {
    this.current = id
    this.render()
  }
}
