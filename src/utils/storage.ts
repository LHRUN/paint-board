export const BOARD_STORAGE_KEY = 'PAINT_BOARD_DATA'

export const storage = {
  get(key: string) {
    if (!key) {
      return null
    }
    key = key.toString()
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  },
  set(key: string, value: any) {
    if (!key || !value) {
      return null
    }
    localStorage.setItem(key.toString(), JSON.stringify(value))
  },
  deleteKey(key: string) {
    if (!key) {
      return
    }
    key = key.toString()
    localStorage.removeItem(key)
  },
  clear() {
    localStorage.clear()
  }
}
