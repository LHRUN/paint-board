import { FC } from 'react'
import { MousePosition } from '@/types'
import { PaintBoard } from '@/utils/paintBoard'

interface IProps {
  position: MousePosition
  clickText: () => void
  board: PaintBoard | undefined
}

const ContextMenu: FC<IProps> = ({ position, clickText, board }) => {
  const choiceImage = () => {
    if (board) {
      board.imageEdit.showImageInput().then((imgData) => {
        board.addImageElement(imgData, position)
      })
    }
  }

  return (
    <ul
      className="menu w-56 rounded-box fixed bg-secondary"
      style={{ top: position.y, left: position.x }}
    >
      <li onClick={clickText}>
        <a>文字</a>
      </li>
      <li onClick={choiceImage}>
        <a>图片</a>
      </li>
    </ul>
  )
}

export default ContextMenu
