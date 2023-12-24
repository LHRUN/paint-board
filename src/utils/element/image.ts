import { fabric } from 'fabric'
import { paintBoard } from '../paintBoard'
import { setObjectAttr } from '../common/draw'

export class ImageElement {
  image: fabric.Image | null = null

  addImage(data: string) {
    const canvas = paintBoard.canvas
    if (!canvas) {
      return
    }
    fabric.Image.fromURL(
      data,
      (img) => {
        console.log('upload', img)
        const center = {
          x: canvas.getWidth() / 2,
          y: canvas.getHeight() / 2
        }
        // 计算缩放比例
        const scaleX = canvas.getWidth() / 2 / (img?.width || 1)
        const scaleY = canvas.getHeight() / 2 / (img?.height || 1)
        const scale = Math.min(scaleX, scaleY, 1) // 确保图片不会比原尺寸大

        // 应用计算得出的缩放比例并保持宽高比
        img.scale(scale)

        // 设置图片位置
        img.set({
          left: center.x - img.getScaledWidth() / 2,
          top: center.y - img.getScaledHeight() / 2
        })

        setObjectAttr(img, 'image')

        canvas.add(img)
        paintBoard.render()
      },
      {
        crossOrigin: 'anonymous' // 指定跨域策略，如果您的图片来自于不同的域，可以需要这个
      }
    )
  }
}

export function renderImageFilters(image: fabric.Image, filterType: string) {
  const findFilterIndex =
    image.filters?.findIndex((item) => (item as any)?.type === filterType) ?? -1

  if (findFilterIndex > -1) {
    image.filters?.splice(findFilterIndex, 1)
  } else {
    switch (filterType) {
      case 'Grayscale':
        image.filters?.push(new fabric.Image.filters.Grayscale())
        break
      case 'Invert':
        image.filters?.push(new fabric.Image.filters.Invert())
        break
      case 'BlackWhite':
        image.filters?.push(new fabric.Image.filters.BlackWhite())
        break
      case 'Sepia':
        image.filters?.push(new fabric.Image.filters.Sepia())
        break
      case 'Blur':
        image.filters?.push(
          new fabric.Image.filters.Blur({
            blur: 0.5
          })
        ) // 模糊
        break
      case 'Vintage':
        image.filters?.push(new fabric.Image.filters.Vintage())
        break
      case 'BlendColor':
        image.filters?.push(
          new fabric.Image.filters.BlendColor({
            color: '#66CC89',
            mode: 'diff'
          })
        ) //盲目的
        break
      case 'Brownie':
        image.filters?.push(new fabric.Image.filters.Brownie())
        break
      case 'Kodachrome':
        image.filters?.push(new fabric.Image.filters.Kodachrome())
        break
      case 'Pixelate':
        image.filters?.push(new fabric.Image.filters.Pixelate())
        break
      case 'Polaroid':
        image.filters?.push(new fabric.Image.filters.Polaroid())
        break
      case 'Technicolor':
        image.filters?.push(new fabric.Image.filters.Technicolor())
        break
      case 'Brightness':
        image.filters?.push(
          new fabric.Image.filters.Brightness({
            brightness: 0.6
          })
        )
        break
      case 'Noise':
        image.filters?.push(
          new fabric.Image.filters.Noise({
            noise: 100
          })
        )
        break
      case 'Convolute':
        image.filters?.push(
          new fabric.Image.filters.Convolute({
            matrix: [1, 1, 1, 1, 0.7, -1, -1, -1, -1]
          })
        )
        break
      default:
        break
    }
  }

  image.applyFilters()
}
