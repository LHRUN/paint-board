import React, { Suspense } from 'react'

/**
 * @description 路由懒加载
 * @param {Element} Comp 需要访问的组件
 * @returns element
 */
const LazyLoad: React.FC<React.LazyExoticComponent<any>> = (Comp) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Comp />
    </Suspense>
  )
}

export default LazyLoad
