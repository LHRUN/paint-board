export interface ILayer {
  id: number
  value: string
  show: boolean
}

export class Layer {
  queue: ILayer[]
  id: number
  active: number
  render: () => void

  constructor(render: () => void, initData?: Layer) {
    const {
      queue = [
        {
          id: 1,
          value: 'item1',
          show: true
        }
      ],
      id = 1,
      active = 1
    } = initData || {}
    this.queue = queue
    this.id = id
    this.active = active
    this.render = render
  }

  add() {
    const id = ++this.id

    this.queue.unshift({
      id,
      value: `item${id}`,
      show: true
    })
    this.active = id
    this.render()
  }

  delete(id: number) {
    if (this.queue.length > 0) {
      this.queue = this.queue.filter((item) => item.id !== id)
      this.active = this.queue[0].id
      this.render()
    }
  }

  swap(dragIndex: number, dropIndex: number) {
    ;[this.queue[dragIndex], this.queue[dropIndex]] = [
      this.queue[dropIndex],
      this.queue[dragIndex]
    ]
  }

  updateVal(id: number, value: string) {
    this.queue.forEach((item) => {
      if (item.id === id) {
        item.value = value
      }
    })
    this.render()
  }

  updateShow(id: number, show: boolean) {
    if (!show && this.queue.filter((item) => item.show).length <= 1) {
      return
    }
    this.queue.forEach((item) => {
      if (item.id === id) {
        item.show = !item.show
      }
    })
    this.render()
  }

  updateActive(id: number) {
    this.active = id
    this.render()
  }
}
