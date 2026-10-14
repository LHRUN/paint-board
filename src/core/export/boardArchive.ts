const ILLEGAL_FILE_CHARS = /[\\/:*?"<>|]/g

export type BoardArchiveOutcome =
  | 'all-started'
  | 'partial'
  | 'all-failed'
  | 'zip-failed'

export const boardFileBaseName = (title: string) => {
  const cleaned = title
    .replace(ILLEGAL_FILE_CHARS, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.slice(0, 80) || 'paint-board'
}

export const uniqueBoardFileName = (
  title: string,
  id: string,
  used: Set<string>
) => {
  const base = boardFileBaseName(title)
  const suffix = id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'board'
  let name = `${base}.json`
  if (used.has(name)) {
    name = `${base}-${suffix}.json`
  }
  let duplicate = 2
  while (used.has(name)) {
    name = `${base}-${suffix}-${duplicate}.json`
    duplicate += 1
  }
  used.add(name)
  return name
}

export const boardArchiveOutcome = (input: {
  total: number
  generated: number
  zipFailed: boolean
}): BoardArchiveOutcome => {
  if (input.generated === 0 || input.total === 0) {
    return 'all-failed'
  }
  if (input.zipFailed) {
    return 'zip-failed'
  }
  if (input.generated < input.total) {
    return 'partial'
  }
  return 'all-started'
}

/**
 * Ask the browser to save a blob. This does not report whether the
 * user finished the system download dialog.
 */
export const triggerBlobDownload = (blob: Blob, filename: string) => {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
