import useShapeStore from '@/store/shape'
import { fabric } from 'fabric'
import { getShapeBorderWidth } from '.'
import { generateRandomCoordinates } from '../../draw/shape/util'
import { paintBoard } from '@/utils/paintBoard'

const linePoint = [
  {
    startPoint: {
      x: 0,
      y: 0
    },
    endPoint: {
      x: 30,
      y: 0
    }
  },
  {
    startPoint: {
      x: 0,
      y: 5
    },
    endPoint: {
      x: 30,
      y: 5
    }
  },
  {
    startPoint: {
      x: 0,
      y: 10
    },
    endPoint: {
      x: 30,
      y: 10
    }
  },
  {
    startPoint: {
      x: 0,
      y: 15
    },
    endPoint: {
      x: 30,
      y: 15
    }
  },
  {
    startPoint: {
      x: 0,
      y: 20
    },
    endPoint: {
      x: 30,
      y: 20
    }
  },
  {
    startPoint: {
      x: 0,
      y: 25
    },
    endPoint: {
      x: 30,
      y: 25
    }
  },
  {
    startPoint: {
      x: 0,
      y: 30
    },
    endPoint: {
      x: 30,
      y: 30
    }
  }
]

export const createLineFill = () => {
  const patternCanvas = fabric.util.createCanvasElement()
  console.log('isDrawingMode', paintBoard.canvas?.isDrawingMode)
  patternCanvas.width = patternCanvas.height = 30
  const ctx = patternCanvas.getContext('2d')
  if (ctx) {
    ctx.strokeStyle = useShapeStore.getState().fillColor
    ctx.lineWidth = 1
    linePoint.forEach(({ startPoint, endPoint }) => {
      // const randomStartPoint = generateRandomCoordinates(
      //   startPoint.x,
      //   startPoint.y,
      //   2,
      //   1
      // )[0]
      // const randomEndPoint = generateRandomCoordinates(
      //   endPoint.x,
      //   endPoint.y,
      //   2,
      //   1
      // )[0]
      ctx.moveTo(startPoint.x, startPoint.y)
      ctx.lineTo(endPoint.x, endPoint.y)
    })
    ctx.stroke()
    console.log('patternCanvas', patternCanvas)
    const pattern = new fabric.Pattern({
      source: patternCanvas,
      repeat: 'repeat'
    })
    return pattern
  }
  return undefined
}
