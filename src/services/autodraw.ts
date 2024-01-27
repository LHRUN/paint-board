import axios from 'axios'
import { AUTODRAW_URL } from './constant'

export type IInk = Array<Array<number>>

interface IAutoDrawParams {
  drawWidth: number
  drawHeight: number
  ink: IInk[]
}

export const autoDrawPost = async (params: IAutoDrawParams) => {
  const { drawWidth = 100, drawHeight = 100, ink = [] } = params
  const body = {
    input_type: 0,
    requests: [
      {
        language: 'autodraw',
        writing_guide: {
          width: drawWidth,
          height: drawHeight
        },
        ink
      }
    ]
  }
  const res = await axios.post(AUTODRAW_URL, body)
  return res?.data
}
