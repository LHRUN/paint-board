import { v4 as uuidv4 } from 'uuid'

export const initCustomObjectAttr = (obj: fabric.Object, type: string) => {
  const id = uuidv4()
  obj.set({
    id,
    _customType: type
  } as any)
}
