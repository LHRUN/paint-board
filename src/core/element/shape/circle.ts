import { fabric } from 'fabric'
import { paintBoard } from '@/core/paintBoard'

import { initCustomObjectAttr } from '@/core/utils/object'
import { getRoughShapeOptions, getFabricShapeOptions } from './utils'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import { RoughShapeUtils } from './utils/roughUtils'
import { SHAPE_VIEWBOX } from './utils/roughFrame'
import { createRoughShapeGroup, layoutRoughShape } from './utils/roughGroup'

export class CircleElement {
  graphInstance: fabric.Object | undefined
  startX = 0
  startY = 0

  constructor(point: fabric.Point | undefined) {
    if (!point) {
      return
    }

    const group = this.renderSketchCircle(point)

    paintBoard.canvas?.add(group)
    this.graphInstance = group
    this.startX = point.x
    this.startY = point.y
    initCustomObjectAttr(group, ELEMENT_CUSTOM_TYPE.SHAPE_CIRCLE)
  }

  renderSketchCircle(point: fabric.Point) {
    const paths = RoughShapeUtils.getCirclePaths(
      SHAPE_VIEWBOX,
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
