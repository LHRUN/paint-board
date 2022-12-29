import { CANVAS_ELE_TYPE } from '../constants'
import { ElementRect } from './../../types/index'
import { createDocument } from './../common'
import { CanvasElement } from './element'

export class ImageElement extends CanvasElement {
  url: string
  rect: ElementRect

  constructor(layer: number, url: string, rect: ElementRect) {
    super(CANVAS_ELE_TYPE.IMAGE, layer)
    this.url = url
    this.rect = rect
  }
}

export interface ImageData {
  width: number
  height: number
  url: string
}

export class ImageEdit {
  imageData: ImageData | null = null
  imageInput: HTMLInputElement | null = null

  showImageInput() {
    return new Promise<ImageData>((resolve) => {
      const imageInputStyle = {
        opacity: 0,
        position: 'fixed',
        top: 0,
        left: 0
      }
      const imageInput = createDocument('input', imageInputStyle)
      imageInput.type = 'file'
      imageInput.accept = 'image/*'
      imageInput.addEventListener('change', async (e: Event) => {
        console.log(e)
        if (e.target) {
          const url = await this.getImageUrl(e.target.files[0])
          const { width, height } = await this.getImageSize(url)
          const imageData = {
            width,
            height,
            url
          }
          this.imageData = imageData
          resolve(imageData)
        }
      })
      imageInput.click()
      this.imageInput = imageInput
    })
  }

  private getImageUrl(file: Blob) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        resolve(reader.result as string)
      }
      reader.onerror = (err) => {
        reject(err)
      }
      reader.readAsDataURL(file)
    })
  }

  private getImageSize(url: string) {
    return new Promise<Omit<ImageData, 'url'>>((resolve, reject) => {
      const img = new Image()
      img.setAttribute('crossOrigin', 'anonymous')
      img.onload = () => {
        const maxWidth = 750
        const maxHeight = 450
        const maxRatio = maxWidth / maxHeight
        let width = img.width
        let height = img.height
        const ratio = width / height
        if (width > maxWidth || height > maxHeight) {
          if (ratio > maxRatio) {
            width = maxWidth
            height = maxWidth / ratio
          } else {
            height = maxHeight
            width = maxHeight * ratio
          }
        }

        resolve({
          width,
          height
        })
      }
      img.onerror = (err) => {
        reject(err)
      }
      img.src = url
    })
  }

  destroy() {
    if (this.imageInput) {
      document.body.removeChild(this.imageInput)
      this.imageInput = null
    }
    this.imageData = null
  }
}

export const imageRender = (
  context: CanvasRenderingContext2D,
  ele: ImageElement
) => {
  return new Promise<void>((resolve) => {
    context.save()
    const img = new Image()
    img.src = ele.url
    img.onload = () => {
      context.drawImage(
        img,
        ele.rect.x,
        ele.rect.y,
        ele.rect.width,
        ele.rect.height
      )
      resolve()
    }
    context.restore()
  })
}
