import { ActionMode } from '@/constants'
import useBoardStore from '@/store/board'
import useFileStore from '@/store/files'
import { paintBoard } from '@/utils/paintBoard'
import { useTranslation } from 'react-i18next'

const DeleteFileModal = () => {
  const { t } = useTranslation()
  const { files, deleteFile } = useFileStore()
  const { updateMode } = useBoardStore()

  // 清除画布
  const clean = () => {
    // paintBoard.history?.clean()
    if (files.length > 1) {
      deleteFile()
      paintBoard.initCanvasStorage()
      updateMode(ActionMode.DRAW)
    }
  }

  return (
    <>
      <input type="checkbox" id="delete-file-modal" className="modal-toggle" />
      <label htmlFor="delete-file-modal" className="modal cursor-pointer">
        <label
          className="modal-box relative flex flex-col justify-center items-center"
          htmlFor=""
        >
          <h3 className="text-lg font-bold text-center">
            {t('deleteFileModal.title')}
          </h3>
          <div className="w-64 flex justify-between mt-10">
            <label
              htmlFor="delete-file-modal"
              className="btn btn-active btn-primary btn-md w-2/5"
              onClick={clean}
            >
              {t('deleteFileModal.confirm')}
            </label>
            <label
              htmlFor="delete-file-modal"
              className="btn btn-active btn-ghost btn-md w-2/5"
            >
              {t('deleteFileModal.cancel')}
            </label>
          </div>
        </label>
      </label>
    </>
  )
}

export default DeleteFileModal
