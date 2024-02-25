import { paintBoard } from '@/utils/paintBoard'
import { FC, useCallback, useMemo } from 'react'
import useShapeStore from '@/store/shape'
import { debounce, omit } from 'lodash'
import { ShapeBorderType, ShapeFillType } from '@/constants/shape'
import { SHAPE_ELEMENT_CUSTOM_TYPE } from '@/constants'

import BorderTypeConfig from '@/components/toolPanel/drawConfig/shapeConfig/borderTypeConfig'
import BorderStyleConfig from '@/components/toolPanel/drawConfig/shapeConfig/borderStyleConfig'
import FillStyleConfig from '@/components/toolPanel/drawConfig/shapeConfig/fillStyleConfig'

interface IProps {
  refreshCount: number
}

const SelectShapeConfig: FC<IProps> = ({ refreshCount }) => {
  const { fillColor } = useShapeStore()

  const getTypeByDashArray = (strokeDashArray: number[] | undefined) => {
    if (Array.isArray(strokeDashArray)) {
      const [value1, value2] = strokeDashArray
      if (value1 > value2) {
        return ShapeBorderType.Dashed
      } else {
        return ShapeBorderType.Dotted
      }
    } else if (!strokeDashArray) {
      return ShapeBorderType.Solid
    } else {
      return ''
    }
  }

  const currentTextFontFamily = useMemo(() => {
    const strokeDashArray = (
      paintBoard.canvas?.getActiveObject() as fabric.Path
    )?.strokeDashArray
    return getTypeByDashArray(strokeDashArray)
  }, [refreshCount])

  const updateBorderType = (type: string) => {
    const strokeWidth = paintBoard.canvas?.getActiveObject()?.strokeWidth
    if (!strokeWidth) {
      return
    }
    let strokeDashArray = undefined
    switch (type) {
      case ShapeBorderType.Dashed:
        strokeDashArray = [strokeWidth * 3, strokeWidth * 2]
        break
      case ShapeBorderType.Dotted:
        strokeDashArray = [strokeWidth, strokeWidth * 3]
        break
      default:
        break
    }
    paintBoard.canvas?.getActiveObject()?.set({
      strokeDashArray
    })
    paintBoard.render()
    paintBoard.triggerHook()
  }

  const currentBorderColor = useMemo(() => {
    return paintBoard.canvas?.getActiveObject()?.stroke ?? undefined
  }, [refreshCount])

  const updateBorderColor = useCallback(
    debounce((borderColor: string) => {
      paintBoard.canvas?.getActiveObject()?.set({
        stroke: borderColor
      })
      paintBoard.render()
      paintBoard.triggerHook()
    }, 500),
    []
  )

  const currentBorderWidth = useMemo(() => {
    return paintBoard.canvas?.getActiveObject()?.strokeWidth ?? undefined
  }, [refreshCount])

  const updateBorderWidth = useCallback(
    debounce((borderWidth: number) => {
      const oldStrokeDashArray = (
        paintBoard.canvas?.getActiveObject() as fabric.Path
      )?.strokeDashArray
      const type = getTypeByDashArray(oldStrokeDashArray)
      let newStrokeDashArray = undefined
      switch (type) {
        case ShapeBorderType.Dashed:
          newStrokeDashArray = [borderWidth * 3, borderWidth * 2]
          break
        case ShapeBorderType.Dotted:
          newStrokeDashArray = [borderWidth, borderWidth * 3]
          break
        default:
          break
      }
      paintBoard.canvas?.getActiveObject()?.set({
        strokeWidth: borderWidth,
        strokeDashArray: newStrokeDashArray
      })
      paintBoard.render()
      paintBoard.triggerHook()
    }, 500),
    []
  )

  const currentFillColor = useMemo(() => {
    return paintBoard.canvas?.getActiveObject()?.fill as string
  }, [refreshCount])
  const updateFillColor = useCallback(
    debounce((fillColor: string) => {
      const currentFillColor = paintBoard.canvas?.getActiveObject()
        ?.fill as string
      if (currentFillColor !== 'transparent') {
        paintBoard.canvas?.getActiveObject()?.set({
          fill: fillColor
        })
        paintBoard.render()
        paintBoard.triggerHook()
      }
    }, 500),
    []
  )

  const currentFillType = useMemo(() => {
    const fillColor = paintBoard.canvas?.getActiveObject()?.fill as string
    if (fillColor === 'transparent') {
      return ShapeFillType.Transparent
    }
    return ShapeFillType.Full
  }, [refreshCount])
  const updateFillType = (fillType: string) => {
    switch (fillType) {
      case ShapeFillType.Transparent:
        paintBoard.canvas?.getActiveObject()?.set({
          fill: 'transparent'
        })
        break
      case ShapeFillType.Full:
        paintBoard.canvas?.getActiveObject()?.set({
          fill: fillColor
        })
        break
      default:
        break
    }
    paintBoard.render()
    paintBoard.triggerHook()
  }

  return (
    <>
      <BorderTypeConfig
        borderType={currentTextFontFamily}
        updateBorderType={updateBorderType}
      />
      <BorderStyleConfig
        borderColor={currentBorderColor}
        updateBorderColor={updateBorderColor}
        borderWidth={currentBorderWidth}
        updateBorderWidth={updateBorderWidth}
      />
      {Object.values(
        omit(SHAPE_ELEMENT_CUSTOM_TYPE, ['SHAPE_LINE', 'SHAPE_ARROW_LINE'])
      ).includes(
        paintBoard.canvas?.getActiveObject()?._customType as string
      ) && (
        <FillStyleConfig
          fillColor={currentFillColor}
          fillType={currentFillType}
          updateFillColor={updateFillColor}
          updateFillType={updateFillType}
        />
      )}
    </>
  )
}

export default SelectShapeConfig
