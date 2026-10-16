import { fabric } from 'fabric'
import { renderToString } from 'react-dom/server'
import { createElement } from 'react'
import { paintBoard } from '@/core/paintBoard'

import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import useShapeStore from '@/store/shape'

import { initCustomObjectAttr } from '@/core/utils/object'
import {
  getFabricShapeOptions,
  getRoughShapeOptions,
  getShapeFillColor,
  getShapeStrokeDashArray,
  getShapeStrokeWidth
} from './utils'
import { svgShapesToPaths } from './utils/svgToPath'
import { RoughShapeUtils } from './utils/roughUtils'
import { isFillableGraphIcon, StrokeStyleType } from '@/constants/shape'
import { shouldAttachGraph } from './graphReady'

const closeSvgPath = (path: string) => {
  const trimmed = path.trim()
  if (/[zZ]\s*$/.test(trimmed)) {
    return trimmed
  }
  return `${trimmed} Z`
}

export class GraphElement {
  graphInstance: fabric.Object | undefined
  startX = 0
  startY = 0
  private cancelled = false
  private readySettled = false
  private pendingPoint: fabric.Point | undefined
  private readyResolve: (attached: boolean) => void = () => {}
  readonly ready: Promise<boolean>

  constructor(point: fabric.Point | undefined) {
    this.ready = new Promise((resolve) => {
      this.readyResolve = resolve
    })
    if (!point) {
      this.settleReady(false)
      return
    }
    this.initGraph(point)
  }

  private settleReady(attached: boolean) {
    if (this.readySettled) {
      return
    }
    this.readySettled = true
    this.readyResolve(attached)
  }

  async initGraph(point: fabric.Point) {
    const canvas = paintBoard.canvas
    const generation = paintBoard.getLoadGeneration()
    const LucideIcons = await import('lucide-react').catch((error) => {
      console.warn('Failed to load Lucide icons', error)
      return null
    })
    if (!LucideIcons || this.cancelled) {
      this.settleReady(false)
      return
    }
    const { currentShapeIcon } = useShapeStore.getState()

    const strokeWidth = getShapeStrokeWidth()
    const { strokeColorList, currentStrokeColor, strokeStyle } =
      useShapeStore.getState()

    // get the current Lucide icon
    const iconComponent = (LucideIcons as any)[currentShapeIcon]

    if (!iconComponent) {
      console.warn(`Icon "${currentShapeIcon}" not found in LucideIcons`)
      this.settleReady(false)
      return
    }

    const graphIcon = createElement(iconComponent, {
      size: 24,
      color: strokeColorList[currentStrokeColor],
      strokeWidth: strokeWidth
    })

    const svgString = renderToString(graphIcon)

    let groupObj: fabric.Object | undefined

    if (strokeStyle === StrokeStyleType.Sketch) {
      groupObj = this.renderSketchGraph(svgString, point)
    } else {
      groupObj = await this.renderNormalGraph(svgString, point)
    }

    if (
      !groupObj ||
      !shouldAttachGraph({
        cancelled: this.cancelled,
        canvasMatches: !!canvas && paintBoard.canvas === canvas,
        generationMatches: paintBoard.getLoadGeneration() === generation,
        historyApplying: paintBoard.history?.isApplying() ?? false
      })
    ) {
      this.settleReady(false)
      return
    }

    paintBoard.canvas?.add(groupObj)
    this.graphInstance = groupObj
    this.startX = point.x
    this.startY = point.y
    initCustomObjectAttr(groupObj, ELEMENT_CUSTOM_TYPE.SHAPE_GRAPH)
    if (this.pendingPoint) {
      this.applyPosition(this.pendingPoint)
    }
    this.settleReady(true)
  }

  renderNormalGraph(
    svgString: string,
    point: fabric.Point
  ): Promise<fabric.Object> {
    return new Promise((resolve) => {
      // use fabric.loadSVGFromString to load SVG
      fabric.loadSVGFromString(svgString, (objects, options) => {
        const strokeWidth = getShapeStrokeWidth()
        const { strokeColorList, currentStrokeColor, currentShapeIcon } =
          useShapeStore.getState()
        const fillable = isFillableGraphIcon(currentShapeIcon)
        const fill = fillable ? getShapeFillColor() : undefined

        const svgGroup = fabric.util.groupSVGElements(objects, options)
        const dashArray = getShapeStrokeDashArray(strokeWidth)
        const objectStyle = {
          stroke: strokeColorList[currentStrokeColor],
          strokeWidth,
          strokeDashArray: dashArray,
          strokeLineCap: 'round',
          strokeUniform: true,
          perPixelTargetFind: true,
          ...(fillable ? { fill } : {})
        }

        svgGroup.set({
          left: point.x,
          top: point.y,
          scaleX: 0,
          scaleY: 0,
          stroke: strokeColorList[currentStrokeColor],
          strokeWidth,
          strokeUniform: true,
          strokeLineCap: 'round',
          perPixelTargetFind: true,
          ...(fillable ? { fill } : {})
        })

        // apply styles to all objects in the SVG group
        if (svgGroup.type === 'group') {
          const group = svgGroup as fabric.Group
          if (group.getObjects) {
            group.getObjects().forEach((obj: fabric.Object) => {
              obj.set(objectStyle)
            })
          }
        } else {
          svgGroup.set(objectStyle)
        }

        resolve(svgGroup)
      })
    })
  }

  renderSketchGraph(svgString: string, point: fabric.Point) {
    const pathList = svgShapesToPaths(svgString)

    const strokeWidth = getShapeStrokeWidth()
    const { strokeColorList, currentStrokeColor, currentShapeIcon } =
      useShapeStore.getState()
    const fillable = isFillableGraphIcon(currentShapeIcon)
    const options = fillable
      ? getRoughShapeOptions()
      : {
          roughness: 0.3,
          bowing: 0.7
        }

    const pathElementList: fabric.Path[] = []
    pathList.forEach((path) => {
      const roughPathList = RoughShapeUtils.getPathPaths(
        fillable ? closeSvgPath(path) : path,
        options
      )
      roughPathList.forEach((roughPath) => {
        const pathElement = new fabric.Path(
          roughPath.d,
          fillable
            ? {
                ...getFabricShapeOptions(roughPath),
                strokeWidth
              }
            : {
                scaleX: 1,
                scaleY: 1,
                stroke: strokeColorList[currentStrokeColor],
                strokeWidth,
                strokeUniform: true,
                strokeLineCap: 'round',
                fill: 'transparent'
              }
        )
        pathElementList.push(pathElement)
      })
    })

    const group = new fabric.Group(pathElementList, {
      top: point.y,
      left: point.x,
      width: 26,
      height: 26,
      scaleX: 0,
      scaleY: 0
    })

    return group
  }

  addPosition(point: fabric.Point | undefined) {
    if (!point) {
      return
    }
    this.pendingPoint = point
    if (!this.graphInstance) {
      return
    }
    this.applyPosition(point)
  }

  private applyPosition(point: fabric.Point) {
    if (!this.graphInstance) {
      return
    }
    const { x: moveToX, y: moveToY } = new fabric.Point(point.x, point.y)
    const width = Math.abs(moveToX - this.startX)
    const height = Math.abs(moveToY - this.startY)
    const left = moveToX > this.startX ? this.startX : this.startX - width
    const top = moveToY > this.startY ? this.startY : this.startY - height

    this.graphInstance.set({
      scaleX: width / 24,
      scaleY: height / 24,
      left,
      top
    })

    this.graphInstance.setCoords()
    paintBoard.canvas?.requestRenderAll()
  }

  destroy() {
    this.cancelled = true
    if (this.graphInstance) {
      paintBoard.canvas?.remove(this.graphInstance)
      this.graphInstance = undefined
    }
    this.settleReady(false)
  }
}
