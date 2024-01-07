import { paintBoard } from '@/utils/paintBoard'
import { CSSProperties, useEffect, useState } from 'react'

const ZoomInfo = () => {
  const [zoomValue, setZoomValue] = useState(
    paintBoard.evnet?.zoomEvent.handleZoomPercentage(false)
  )
  useEffect(() => {
    paintBoard.evnet?.zoomEvent.setZoomHook((num: number) => {
      setZoomValue(num)
    })
  }, [setZoomValue])

  return (
    <div
      className="radial-progress bg-primary text-primary-content border-4 border-primary cursor-pointer ml-2"
      style={
        {
          '--value': zoomValue,
          '--size': '1.1rem',
          '--thickness': '0.2rem'
        } as CSSProperties
      }
      onClick={() => paintBoard.evnet?.zoomEvent.initZoom()}
    ></div>
  )
}

export default ZoomInfo
