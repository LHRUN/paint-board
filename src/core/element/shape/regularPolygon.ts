import { fabric } from 'fabric'
import { paintBoard } from '@/core/paintBoard'

import { initCustomObjectAttr } from '@/core/utils/object'
import { getRoughShapeOptions, getFabricShapeOptions } from './utils'
import { ELEMENT_CUSTOM_TYPE, SHAPE_ELEMENT_CUSTOM_TYPE } from '@/constants'
import useShapeStore from '@/store/shape'
import { RoughShapeUtils } from './utils/roughUtils'
import { SHAPE_VIEWBOX } from './utils/roughFrame'
import { createRoughShapeGroup, layoutRoughShape } from './utils/roughGroup'

const REGULAR_POLYGON_SIDES = {
  [SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_TRIANGLE]: 3,
  [SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_PENTAGON]: 5,
  [SHAPE_ELEMENT_CUSTOM_TYPE.SHAPE_HEXAGON]: 6
}

export class RegularPolygonElement {
  graphInstance: fabric.Object | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }
    const { currentShapeIcon } = useShapeStore.getState()
    const group = this.renderSketchRegularPolygon(point)

    paintBoard.canvas?.add(group)
    this.graphInstance = group
    this.startX = point.x
    this.startY = point.y
    initCustomObjectAttr(
      group,
      ELEMENT_CUSTOM_TYPE[currentShapeIcon as keyof typeof ELEMENT_CUSTOM_TYPE]
    )
  }

  renderSketchRegularPolygon(point: fabric.Point) {
    const { currentShapeIcon } = useShapeStore.getState()

    const sides = REGULAR_POLYGON_SIDES[currentShapeIcon]

    const paths = RoughShapeUtils.getRegularPolygonPaths(
      SHAPE_VIEWBOX,
      SHAPE_VIEWBOX,
      sides,
      getRoughShapeOptions()
    ).map((path) => new fabric.Path(path.d, getFabricShapeOptions(path)))

    return createRoughShapeGroup(
      paths,
      point,
      paintBoard.canvas?.getZoom() ?? 1
    ).group
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point || !this.graphInstance) {
      return
    }
    layoutRoughShape(this.graphInstance, this.startX, this.startY, point, {
      x: this.graphInstance.width || 1,
      y: this.graphInstance.height || 1
    })
    paintBoard.canvas?.requestRenderAll()
  }

  destroy() {
    if (this.graphInstance) {
      paintBoard.canvas?.remove(this.graphInstance)
    }
  }
}
