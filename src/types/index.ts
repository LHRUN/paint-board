import { Background } from '@/utils/background'
import { CleanLine } from '@/utils/cleanLine'
import { FreeLine } from '@/utils/freeLine'

export interface MousePosition {
  x: number
  y: number
}

export type ELEMENT_INSTANCE = FreeLine | CleanLine | Background | null
