import useFileStore from '@/store/files'
import { contentRevisionOf } from '@/store/boardRevision'
import { needsThumbnail } from './frame'
import { renderBoardThumbnail } from './renderBoardThumbnail'
import {
  cachedThumbnail,
  emitThumbnails,
  isThumbnailToken,
  nextThumbnailToken,
  saveThumbnail
} from './thumbnailCache'

const pendingRevision = new Map<string, number>()
let chain: Promise<void> = Promise.resolve()

export const isThumbnailPending = (id: string, revision: number | undefined) =>
  pendingRevision.get(id) === contentRevisionOf(revision)

const renderWhenCurrent = async (
  id: string,
  revision: number,
  token: number
) => {
  const stillCurrent = () => isThumbnailToken(id, token)
  if (!stillCurrent()) {
    return
  }
  const latest = useFileStore.getState().files.find((file) => file.id === id)
  if (!latest || contentRevisionOf(latest.contentRevision) !== revision) {
    return
  }
  const blob = await renderBoardThumbnail(latest)
  if (!stillCurrent()) {
    return
  }
  const after = useFileStore.getState().files.find((file) => file.id === id)
  if (!after || contentRevisionOf(after.contentRevision) !== revision) {
    return
  }
  await saveThumbnail(id, revision, blob, stillCurrent)
}

export const scheduleBoardThumbnail = (id: string) => {
  const file = useFileStore.getState().files.find((item) => item.id === id)
  if (!file) {
    return
  }
  const revision = contentRevisionOf(file.contentRevision)
  const cached = cachedThumbnail(id)
  if (!needsThumbnail(file.contentRevision, cached ? cached.revision : null)) {
    return
  }
  if (pendingRevision.get(id) === revision) {
    return
  }

  pendingRevision.set(id, revision)
  const token = nextThumbnailToken(id)
  emitThumbnails()
  chain = chain
    .then(() => renderWhenCurrent(id, revision, token))
    .catch((error) => {
      console.error('Failed to render board thumbnail', error)
    })
    .finally(() => {
      if (pendingRevision.get(id) === revision) {
        pendingRevision.delete(id)
        emitThumbnails()
      }
    })
}
