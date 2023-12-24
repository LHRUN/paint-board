/**
 * 比较版本号
 * @param v1
 * @param v2
 * @returns 0: v1 === v2; 1: v1 > v2; -1: v1 < v2
 */
export const compareVersion = (v1: string, v2: string) => {
  const v1s = v1.split('.')
  const v2s = v2.split('.')
  const len = Math.max(v1s.length, v2s.length)

  while (v1s.length < len) {
    v1s.push('0')
  }
  while (v2s.length < len) {
    v1s.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1s[i])
    const num2 = parseInt(v2s[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

/**
 * 获取随机整数数
 * @param min 最小范围
 * @param max 最大范围
 */
export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * 获取随机浮点数
 * @param min
 * @param max
 */
export const getRandomFloat = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

/**
 * 处理public文件夹下的静态文件路径
 * @param originUrl
 * @returns publicDir + originUrl
 */
export const formatPublicUrl = (originUrl: string) => {
  if (originUrl && typeof originUrl === 'string') {
    return `${import.meta.env.BASE_URL}${originUrl}`
  }
  return ''
}

/**
 * 计算两点之间的距离
 * @param start 起点
 * @param end 终点
 * @returns 距离
 */
export const getDistance = (start: fabric.Point, end: fabric.Point) => {
  return Math.sqrt(Math.pow(start.x - end.x, 2) + Math.pow(start.y - end.y, 2))
}
