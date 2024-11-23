/**
 * crop transparent areas of the image
 * @param imgDataUrl
 */
export const cropTransparent = (imgDataUrl: string) => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image()
    img.src = imgDataUrl

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const { data, width, height } = imageData

      // calculating the minimum area
      let minX = width,
        minY = height,
        maxX = 0,
        maxY = 0
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4
          const alpha = data[index + 3] // get alpha

          // If alpha is not 0, record
          if (alpha !== 0) {
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
          }
        }
      }

      // If no opaque area is found, return to the original image
      if (minX > maxX || minY > maxY) {
        resolve(imgDataUrl)
        return
      }

      // cropped width and height
      const cropWidth = maxX - minX + 1
      const cropHeight = maxY - minY + 1

      // cropped image
      const croppedImageData = ctx.getImageData(
        minX,
        minY,
        cropWidth,
        cropHeight
      )
      canvas.width = cropWidth
      canvas.height = cropHeight
      ctx.putImageData(croppedImageData, 0, 0)

      // put image
      const croppedDataUrl = canvas.toDataURL()
      resolve(croppedDataUrl)
    }

    img.onerror = () => reject(new Error('Image loading failed'))
  })
}
