import { lazy, Suspense, type FC } from 'react'

const UploadImage = lazy(() => import('./index'))

interface IProps {
  url: string
  showModal: boolean
  setShowModal: (show: boolean) => void
  handleUploadImage: (image: string) => void
}

const LazyUploadImage: FC<IProps> = (props) => {
  if (!props.showModal) {
    return null
  }
  return (
    <Suspense fallback={null}>
      <UploadImage {...props} />
    </Suspense>
  )
}

export default LazyUploadImage
