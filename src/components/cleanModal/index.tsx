import { paintBoard } from '@/utils/paintBoard'
import { useTranslation } from 'react-i18next'

const CleanModal = () => {
  const { t } = useTranslation()

  // clean the current canvas
  const clean = () => {
    paintBoard.history?.clean()
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
