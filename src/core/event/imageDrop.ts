import { fabric } from 'fabric'
import { ImageElement } from '@/core/element/image'
import { isBoardImageFile, scenePoint } from '@/core/element/image/placement'

export type ImageDropNotice =
  | 'tip.dropImageUnsupported'
  | 'tip.dropImageReadFail'

const noticeListeners = new Set<(notice: ImageDropNotice) => void>()

export const subscribeImageDropNotice = (
  listener: (notice: ImageDropNotice) => void
) => {
  noticeListeners.add(listener)
  return () => {
    noticeListeners.delete(listener)
  }
}

const notifyImageDrop = (notice: ImageDropNotice) => {
  noticeListeners.forEach((listener) => listener(notice))
}

const hasFileDrag = (event: DragEvent) => {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files')
}

const readImageFile = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }
      reject(new Error('empty image'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('read failed'))
    reader.readAsDataURL(file)
  })
}

/**
 * Drop local images onto the board. The ring is only a hint; the images
 * themselves go through ImageElement.
 */
export class ImageDrop {
  private canvas: fabric.Canvas | null = null
  private target: HTMLElement | null = null
  private hint: HTMLDivElement | null = null
  private dragDepth = 0
  private session = 0

  attach(canvas: fabric.Canvas) {
    const target = canvas.upperCanvasEl
    const parent = target?.parentElement
    if (!target || !parent) {
      return
    }
    this.detach()
    this.canvas = canvas
    this.target = target
    const hint = document.createElement('div')
    hint.setAttribute('data-image-drop', 'true')
    hint.setAttribute('aria-hidden', 'true')
    hint.style.position = 'absolute'
    hint.style.inset = '0'
    hint.style.zIndex = '4'
    hint.style.pointerEvents = 'none'
    hint.style.display = 'none'
    hint.style.border = '2px dashed rgba(102, 204, 138, 0.95)'
    hint.style.background = 'rgba(102, 204, 138, 0.12)'
    hint.style.boxSizing = 'border-box'
    parent.appendChild(hint)
    this.hint = hint
    target.addEventListener('dragenter', this.onDragEnter)
    target.addEventListener('dragover', this.onDragOver)
    target.addEventListener('dragleave', this.onDragLeave)
    target.addEventListener('drop', this.onDrop)
    window.addEventListener('dragend', this.hideHint)
  }

  detach() {
    this.session += 1
    this.dragDepth = 0
    this.target?.removeEventListener('dragenter', this.onDragEnter)
    this.target?.removeEventListener('dragover', this.onDragOver)
    this.target?.removeEventListener('dragleave', this.onDragLeave)
    this.target?.removeEventListener('drop', this.onDrop)
    window.removeEventListener('dragend', this.hideHint)
    this.hint?.remove()
    this.hint = null
    this.target = null
    this.canvas = null
  }

  private onDragEnter = (event: DragEvent) => {
    if (!hasFileDrag(event)) {
      return
    }
    event.preventDefault()
    this.dragDepth += 1
    this.showHint()
  }

  private onDragOver = (event: DragEvent) => {
    if (!hasFileDrag(event)) {
      return
    }
    event.preventDefault()
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy'
    }
    this.showHint()
  }

  private onDragLeave = (event: DragEvent) => {
    if (!hasFileDrag(event)) {
      return
    }
    this.dragDepth = Math.max(0, this.dragDepth - 1)
    if (this.dragDepth === 0) {
      this.hideHint()
    }
  }

  private onDrop = (event: DragEvent) => {
    if (!hasFileDrag(event)) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    this.dragDepth = 0
    this.hideHint()
    const files = Array.from(event.dataTransfer?.files ?? [])
    const canvas = this.canvas
    const bounds = canvas?.upperCanvasEl?.getBoundingClientRect()
    if (!canvas || !bounds || !files.length) {
      return
    }
    const point = scenePoint(
      event.clientX,
      event.clientY,
      bounds,
      { width: canvas.getWidth(), height: canvas.getHeight() },
      canvas.viewportTransform ? [...canvas.viewportTransform] : []
    )
    void this.placeFiles(files, point, this.session)
  }

  private showHint = () => {
    if (this.hint) {
      this.hint.style.display = 'block'
    }
  }

  private hideHint = () => {
    this.dragDepth = 0
    if (this.hint) {
      this.hint.style.display = 'none'
    }
  }

  private async placeFiles(
    files: File[],
    point: { x: number; y: number },
    session: number
  ) {
    const images: string[] = []
    let unsupported = false
    let readError = false
    for (const file of files) {
      if (session !== this.session) {
        return
      }
      if (!isBoardImageFile(file)) {
        unsupported = true
        continue
      }
      try {
        images.push(await readImageFile(file))
      } catch {
        readError = true
      }
    }
    if (session !== this.session) {
      return
    }
    if (images.length) {
      await new ImageElement().addImagesAt(images, point)
    }
    if (session !== this.session) {
      return
    }
    if (readError) {
      notifyImageDrop('tip.dropImageReadFail')
    } else if (unsupported) {
      notifyImageDrop('tip.dropImageUnsupported')
    }
  }
}
