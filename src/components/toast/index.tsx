import { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  message: string
}

const Toast: FC<IProps> = ({ message }) => {
  const { t } = useTranslation()

  return (
    <div className="toast toast-top toast-center">
      <div className="alert alert-success">
        <div>
          <span className="whitespace-nowrap">{t(message)}</span>
        </div>
      </div>
    </div>
  )
}

export default Toast
