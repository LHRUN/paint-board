import React, { FC } from 'react'

interface IProps {
  show: boolean
  clickMask: () => void
  children?: React.ReactNode
}

const Mask: FC<IProps> = ({ show, clickMask, children }) => {
  return (
    <div
      className={`fixed top-0 left-0 right-0 bottom-0 bg-black z-10 bg-opacity-75 ${
        show ? 'block' : 'hidden'
      }`}
      onClick={clickMask}
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-2/4 -translate-y-2/4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export default Mask
