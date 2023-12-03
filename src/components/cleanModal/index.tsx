import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { PaintBoard } from '@/utils/paintBoard'

interface IProps {
  board: PaintBoard | undefined // 画板
}

const CleanModal: FC<IProps> = ({ board }) => {
  const { t } = useTranslation()

  // 清除画布
  const clean = () => {
    if (board) {
      board.clean()
    }
  }

  return (
    <>
      <input type="checkbox" id="clean-modal" className="modal-toggle" />
      <label htmlFor="clean-modal" className="modal cursor-pointer">
        <label
          className="modal-box relative flex flex-col justify-center items-center"
          htmlFor=""
        >
          <h3 className="text-lg font-bold text-center">
            {t('cleanModal.title')}
          </h3>
          <div className="w-64 flex justify-between mt-10">
            <label
              htmlFor="clean-modal"
              className="btn btn-active btn-primary btn-md w-2/5"
              onClick={clean}
            >
              {t('cleanModal.confirm')}
            </label>
            <label
              htmlFor="clean-modal"
              className="btn btn-active btn-ghost btn-md w-2/5"
            >
              {t('cleanModal.cancel')}
            </label>
          </div>
        </label>
      </label>
    </>
  )
}

export default CleanModal
