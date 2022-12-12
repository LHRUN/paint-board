import { FC } from 'react'

interface IProps {
  show: boolean
  clickMask: () => void
  children?: React.ReactNode
}

const Mask: FC<IProps> = ({ show, clickMask, children }) => {
  return (
    <div
      className={`fixed top-0 left-0 w-full h-full items-center justify-center bg-black bg-opacity-75 ${
        show ? 'flex' : 'hidden'
      }`}
      onClick={clickMask}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  )
}

export default Mask
