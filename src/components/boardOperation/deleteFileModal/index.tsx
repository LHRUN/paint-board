import { useTranslation } from 'react-i18next'

interface IProps {
  count: number
  keepCurrent: boolean
  onConfirm: () => void
  onClose: () => void
}

const DeleteFileModal: React.FC<IProps> = ({
  count,
  keepCurrent,
  onConfirm,
  onClose
}) => {
  const { t } = useTranslation()
  const blocked = count <= 0

  return (
    <div className="modal modal-open z-[80]">
      <div className="modal-box relative flex flex-col items-center justify-center">
        <h3 className="text-center text-lg font-bold">
          {blocked
            ? t('deleteFileModal.keepOne')
            : t('deleteFileModal.title', { count })}
        </h3>
        {!blocked && keepCurrent && (
          <p className="mt-3 text-center text-sm text-slate-500">
            {t('deleteFileModal.keepCurrent')}
          </p>
        )}
        <div className="mt-10 flex w-64 justify-between">
          {!blocked && (
            <button
              type="button"
              className="btn btn-active btn-primary btn-sm w-2/5"
              onClick={onConfirm}
            >
              {t('confirm')}
            </button>
          )}
          <button
            type="button"
            className={`btn btn-active btn-ghost btn-sm ${
              blocked ? 'w-full' : 'w-2/5'
            }`}
            onClick={onClose}
          >
            {blocked ? t('confirm') : t('cancel')}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </div>
  )
}

export default DeleteFileModal
