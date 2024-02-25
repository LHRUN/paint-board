import { formatPublicUrl } from '@/utils/common'
import { MATERIAL_TYPE } from '@/utils/element/draw/material'

export const MaterialSwitch = [
  {
    type: MATERIAL_TYPE.CARBON,
    image: formatPublicUrl(`pattern/carbon.png`)
  },
  {
    type: MATERIAL_TYPE.CLOTH,
    image: formatPublicUrl(`pattern/cloth.png`)
  },
  {
    type: MATERIAL_TYPE.CRAYON,
    image: formatPublicUrl(`pattern/crayon.png`)
  },
  {
    type: MATERIAL_TYPE.OIL,
    image: formatPublicUrl(`pattern/oil.png`)
  },
  {
    type: MATERIAL_TYPE.CRAYON_DARK,
    image: formatPublicUrl(`pattern/crayonDark.png`)
  }
]
