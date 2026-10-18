export const THUMBNAIL_LONG_EDGE = 480

export interface ThumbnailContentBounds {
  left: number
  top: number
  width: number
  height: number
}

export interface ThumbnailFrame {
  left: number
  top: number
  width: number
  height: number
  scale: number
  outputWidth: number
  outputHeight: number
}

/**
 * Frame the drawn elements only. An empty board has no thumbnail.
 * The scale never enlarges small content, so a short stroke stays sharp.
 */
export const fitContentFrame = (
  content: ThumbnailContentBounds | null,
  maxEdge = THUMBNAIL_LONG_EDGE
): ThumbnailFrame | null => {
  if (!content || content.width <= 0 || content.height <= 0) {
    return null
  }

  const longest = Math.max(content.width, content.height)
  const scale = maxEdge > 0 && longest > maxEdge ? maxEdge / longest : 1

  return {
    left: content.left,
    top: content.top,
    width: content.width,
    height: content.height,
    scale,
    outputWidth: Math.max(1, Math.round(content.width * scale)),
    outputHeight: Math.max(1, Math.round(content.height * scale))
  }
}

export const needsThumbnail = (
  contentRevision: number | undefined,
  cachedRevision: number | null
) => cachedRevision === null || cachedRevision !== (contentRevision ?? 0)

/**
 * Hidden and fully transparent objects are not thumbnail content.
 * When nothing visible can be framed, cache an empty thumbnail.
 * Retry only when a visible object exists but its bounds cannot be measured.
 */
export const shouldRetryThumbnailMeasure = (
  objects: Array<{ visible?: boolean; opacity?: number }>
) => objects.some((object) => object.visible !== false && object.opacity !== 0)
