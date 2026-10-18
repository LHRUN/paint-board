import { fabric } from 'fabric'
import {
  actionHandler,
  anchorWrapper,
  polygonPositionHandler
} from '../element/shape/utils/line'
import {
  actionHandler as arrowActionHandler,
  anchorWrapper as arrowAnchorWrapper,
  pathPositionHandler
} from '../element/shape/utils/arrowLine'
import { ELEMENT_CUSTOM_TYPE } from '@/constants'
import { paintBoard } from '../paintBoard'
import useFileStore, {
  DEFAULT_BACKGROUND_COLOR_LIST,
  DEFAULT_BACKGROUND_SORT,
  IBoardData
} from '@/store/files'
import { CANVAS_CUSTOM_PROPERTIES } from './canvasProperties'
import { markFileContentDirty } from '@/store/fileRecord'

/**
 * get fabric.js canvas JSON data
 * @returns JSON
 */
export const getCanvasJSON = (): Partial<IBoardData> => {
  const canvas = paintBoard?.canvas
  if (canvas) {
    return canvas.toDatalessJSON(CANVAS_CUSTOM_PROPERTIES) ?? {}
  }
  return {}
}

/**
 * Line and arrow endpoint controls are created in memory.
 * They are not part of Fabric's serialized object, so every new instance
 * (JSON load, undo, or paste) has to build them again from `_customType`.
 */
export const initObjectControls = (obj: fabric.Object) => {
  if (obj.type === 'group') {
    ;(obj as fabric.Group).getObjects().forEach(initObjectControls)
  }

  if (obj._customType === ELEMENT_CUSTOM_TYPE.SHAPE_LINE) {
    const points = (obj as fabric.Polyline).points as fabric.Point[]
    const lastControl = points.length - 1
    obj.controls = points.reduce(function (acc, point, index) {
      acc['p' + index] = new fabric.Control({
        positionHandler: polygonPositionHandler,
        actionHandler: anchorWrapper(
          index > 0 ? index - 1 : lastControl,
          actionHandler
        ),
        actionName: 'polylineEndPoint',
        pointIndex: index
      })
      return acc
    }, {} as Record<string, fabric.Control>)
  }

  if (obj._customType === ELEMENT_CUSTOM_TYPE.SHAPE_ARROW_LINE) {
    const paths = (obj as fabric.Path).path
    obj.controls = paths
      .slice(0, paths.length - 4)
      .reduce(function (acc, point, index) {
        acc['p' + index] = new fabric.Control({
          positionHandler: pathPositionHandler,
          actionHandler: arrowAnchorWrapper(
            index > 0 ? index - 1 : paths.length - 5,
            arrowActionHandler
          ),
          actionName: 'pathEndPoint',
          pointIndex: index
        })
        return acc
      }, {} as Record<string, fabric.Control>)
  }
}

/**
 * Handling canvas json loaded data
 * Used to initialize undo redo
 * @param canvas fabric.Canvas
 */
export const handleCanvasJSONLoaded = (canvas: fabric.Canvas) => {
  canvas.getObjects().forEach(initObjectControls)
}

export const handleFileListData = () => {
  const { files } = useFileStore.getState()
  let hasChanges = false

  const updatedFiles = files.map((file) => {
    const { background, backgroundImage, ...otherBoardData } =
      file.boardData || {}

    if (background || backgroundImage) {
      hasChanges = true
      return {
        ...file,
        backgroundColorList: background
          ? [background]
          : file.backgroundColorList || DEFAULT_BACKGROUND_COLOR_LIST,
        currentBackgroundColor: background ? 0 : file.currentBackgroundColor,
        backgroundImage: backgroundImage?.src || file.backgroundImage || '',
        boardData: otherBoardData,
        backgroundSort: file.backgroundSort || DEFAULT_BACKGROUND_SORT
      }
    }
    return file
  })

  if (hasChanges) {
    updatedFiles.forEach((file, index) => {
      if (file !== files[index]) {
        markFileContentDirty(file.id)
      }
    })
    useFileStore.setState({
      files: updatedFiles
    })
  }
}
